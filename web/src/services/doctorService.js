import { collection, getDocs, query, where } from 'firebase/firestore';
import { demoDoctors } from '../config/demoData';
import { byOrder, getDb, mapDoc, withDemo } from './base';

/** Active doctors, optionally for one practice ('ayurveda' | 'dental'). */
export function listDoctors(practice) {
  return withDemo(
    async () => {
      const clauses = [where('active', '==', true)];
      if (practice) clauses.push(where('practiceType', '==', practice));
      const snap = await getDocs(query(collection(getDb(), 'doctors'), ...clauses));
      return snap.docs.map(mapDoc).sort(byOrder);
    },
    () => demoDoctors.filter((d) => !practice || d.practiceType === practice),
  );
}
