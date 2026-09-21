import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDb } from './base';
import { normalizePhone } from '../utils/validators';

/**
 * Creates a PENDING appointment request. Only the fields allowed by the Firestore
 * rules are written; status is always 'pending' (staff confirm it from the admin app).
 */
export async function createAppointment(values) {
  const db = getDb();
  const ref = doc(collection(db, 'appointments'));

  const data = {
    practiceType: values.practiceType,
    patientName: values.patientName.trim(),
    phone: normalizePhone(values.phone),
    email: (values.email || '').trim(),
    doctorId: values.doctorId || '',
    doctorName: values.doctorName || '',
    serviceId: values.serviceId || '',
    serviceName: values.serviceName || '',
    preferredDate: values.preferredDate,
    preferredTime: values.preferredTime,
    notes: (values.notes || '').trim(),
    consent: true,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(ref, data);

  // Returned for the confirmation screen (the public cannot read appointments back).
  const { createdAt, updatedAt, ...display } = data; // eslint-disable-line no-unused-vars
  return { id: ref.id, ...display };
}
