import { collection, doc, getDocs, orderBy, query, serverTimestamp, where, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import { APPOINTMENT_TRANSITIONS } from '../config/constants';
import { AppError } from '../utils/errors';

/** Server-side filters for the list; text/doctor/service/date filters run client-side on loaded rows. */
export function appointmentConstraints({ practice, status }) {
  const parts = [];
  if (practice) parts.push(where('practiceType', '==', practice));
  if (status) parts.push(where('status', '==', status));
  parts.push(orderBy('createdAt', 'desc'));
  return parts;
}

/**
 * Changes an appointment's status and records an audit entry in appointments/{id}/history.
 * For 'rescheduled', pass the new preferredDate/preferredTime; the previous slot is preserved.
 */
export async function changeAppointmentStatus(appt, nextStatus, { note = '', preferredDate, preferredTime } = {}, user, profile) {
  if (!APPOINTMENT_TRANSITIONS[appt.status]?.includes(nextStatus)) {
    throw new AppError(`An appointment that is ${appt.status} can’t be changed to ${nextStatus}.`, 'invalid-transition');
  }
  const apptRef = doc(db, 'appointments', appt.id);
  const update = { status: nextStatus, updatedAt: serverTimestamp(), updatedBy: user.uid, lastStatusNote: note };
  const entry = { from: appt.status, to: nextStatus, note, by: user.uid, byName: profile?.name || user.email || '', at: serverTimestamp() };

  if (nextStatus === 'rescheduled') {
    update.rescheduledFrom = { date: appt.preferredDate, time: appt.preferredTime };
    update.preferredDate = preferredDate;
    update.preferredTime = preferredTime;
    entry.newDate = preferredDate;
    entry.newTime = preferredTime;
  }

  const batch = writeBatch(db);
  batch.update(apptRef, update);
  batch.set(doc(collection(apptRef, 'history')), entry);
  await batch.commit();

  return {
    ...update,
    updatedAt: new Date(),
  };
}

export async function listAppointmentHistory(id) {
  const snap = await getDocs(query(collection(db, 'appointments', id, 'history'), orderBy('at', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
