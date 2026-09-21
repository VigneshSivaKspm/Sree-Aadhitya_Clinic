import { deleteApp, initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, signOut } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db, firebaseConfig } from '../config/firebase';
import { AppError } from '../utils/errors';

export async function listUsers() {
  // No orderBy: a manually-created bootstrap profile may lack createdAt and would be skipped.
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => String(a.name || a.email).localeCompare(String(b.name || b.email)));
}

/**
 * Creates a Firebase Auth account WITHOUT signing the current super admin out
 * (a throw-away secondary app instance is used), then writes the role profile.
 * Role assignment is protected by the security rules: only a super_admin may write users/*.
 */
export async function createStaffUser({ name, email, password, role }, creator) {
  const secondary = initializeApp(firebaseConfig, `secondary-${Date.now()}`);
  let uid;
  try {
    const secondaryAuth = getAuth(secondary);
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email.trim(), password);
    uid = cred.user.uid;
    await signOut(secondaryAuth);
  } finally {
    await deleteApp(secondary);
  }

  try {
    await setDoc(doc(db, 'users', uid), {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: creator.uid,
    });
  } catch (err) {
    throw new AppError(`The sign-in account was created (UID: ${uid}) but its role profile could not be saved. Create a users/${uid} document manually in the Firebase console.`, 'profile-failed', err);
  }
  return uid;
}

export function updateStaffUser(uid, { name, role, active }, updater) {
  return updateDoc(doc(db, 'users', uid), { name: name.trim(), role, active, updatedAt: serverTimestamp(), updatedBy: updater.uid });
}

// ---- Access requests (created by self-signup)
export async function listAccessRequests() {
  const snap = await getDocs(collection(db, 'accessRequests'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Creates the users/{uid} profile with the chosen role and removes the request, atomically. */
export async function approveAccessRequest(request, role, approver) {
  const batch = writeBatch(db);
  batch.set(doc(db, 'users', request.id), {
    name: request.name, email: String(request.email).toLowerCase(), role, active: true,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(), createdBy: approver.uid,
  });
  batch.delete(doc(db, 'accessRequests', request.id));
  await batch.commit();
}

export const rejectAccessRequest = (id) => deleteDoc(doc(db, 'accessRequests', id));
