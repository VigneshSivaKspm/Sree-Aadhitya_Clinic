import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { ROLES } from '../config/constants';
import { AppError } from '../utils/errors';

export const signIn = (email, password) => signInWithEmailAndPassword(auth, email.trim(), password);
export const signOutUser = () => signOut(auth);
export const requestPasswordReset = (email) => sendPasswordResetEmail(auth, email.trim());
export const onAuthChange = (cb) => onAuthStateChanged(auth, cb);

/**
 * Loads users/{uid}. Returns null when there is no usable staff profile
 * (missing, inactive, or unknown role) — the account then has no admin access.
 */
export async function loadProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (data.active !== true || !Object.values(ROLES).includes(data.role)) return null;
  return { id: snap.id, ...data };
}

// ---- Self-signup
// 1) The very first signup on a fresh project becomes super_admin (atomic with the
//    settings/adminBootstrap marker, so it can only ever happen once).
// 2) Everyone after that files an access request that a super admin approves.
let signupInFlight = null;

/** AuthContext awaits this so the profile lookup doesn't race the documents being written. */
export const waitForSignup = () => (signupInFlight ? signupInFlight.catch(() => {}) : Promise.resolve());

const RULES_HINT = 'Sign-up was blocked by the database security rules. Deploy the latest firestore.rules to your Firebase project (see README → "Deploy security rules"), then try again.';

async function claimFirstSuperAdmin(user, name) {
  const batch = writeBatch(db);
  batch.set(doc(db, 'users', user.uid), {
    name: name.trim(), email: user.email, role: ROLES.SUPER, active: true,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  batch.set(doc(db, 'settings', 'adminBootstrap'), { uid: user.uid, createdAt: serverTimestamp() });
  await batch.commit();
}

/** Idempotent: safe to re-run if an earlier attempt stopped half-way. */
export async function finishSignup(user, name) {
  if ((await getDoc(doc(db, 'users', user.uid))).exists()) return 'existing';
  try {
    await claimFirstSuperAdmin(user, name);
    return 'super_admin';
  } catch {
    /* expected once a super admin exists — fall through to an access request */
  }
  try {
    if (await getAccessRequest(user.uid)) return 'pending';
    await createAccessRequest(user, name);
    return 'pending';
  } catch (err) {
    if (err?.code === 'permission-denied') throw new AppError(RULES_HINT, 'rules-not-deployed', err);
    throw err;
  }
}

export function signUp({ name, email, password }) {
  signupInFlight = (async () => {
    let user;
    try {
      user = (await createUserWithEmailAndPassword(auth, email.trim(), password)).user;
    } catch (err) {
      if (err?.code !== 'auth/email-already-in-use') throw err;
      // An earlier attempt may have created the account but not finished (e.g. rules weren't deployed yet).
      try {
        user = (await signInWithEmailAndPassword(auth, email.trim(), password)).user;
      } catch {
        throw new AppError('An account with this email already exists. Sign in instead, or use “Forgot password?” on the sign-in page.', 'email-taken');
      }
    }
    await finishSignup(user, name);
    return user;
  })();
  return signupInFlight;
}

export async function getAccessRequest(uid) {
  const snap = await getDoc(doc(db, 'accessRequests', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** For accounts that exist but never filed a request. */
export function createAccessRequest(user, name) {
  return setDoc(doc(db, 'accessRequests', user.uid), { name: name.trim(), email: user.email, status: 'pending', createdAt: serverTimestamp() });
}

/**
 * Called for a signed-in super admin: makes sure the bootstrap marker exists, so a project
 * whose first super admin was created by hand can't be "claimed" through /signup.
 */
export async function ensureBootstrapMarker(user) {
  try {
    const ref = doc(db, 'settings', 'adminBootstrap');
    if (!(await getDoc(ref)).exists()) await setDoc(ref, { uid: user.uid, createdAt: serverTimestamp() });
  } catch {
    /* best effort */
  }
}
