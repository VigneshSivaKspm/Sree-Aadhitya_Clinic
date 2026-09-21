import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDb } from './base';
import { normalizePhone } from '../utils/validators';

export async function createEnquiry({ practiceType, name, phone, email, message }) {
  await addDoc(collection(getDb(), 'enquiries'), {
    practiceType,
    name: name.trim(),
    phone: normalizePhone(phone),
    email: (email || '').trim(),
    message: message.trim(),
    status: 'new',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
