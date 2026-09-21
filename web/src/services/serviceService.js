import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { demoServices } from '../config/demoData';
import { byOrder, getDb, mapDoc, withDemo } from './base';

/** Active treatments/services, optionally for one practice. */
export function listServices(practice) {
  return withDemo(
    async () => {
      const clauses = [where('active', '==', true)];
      if (practice) clauses.push(where('practiceType', '==', practice));
      const snap = await getDocs(query(collection(getDb(), 'services'), ...clauses));
      return snap.docs.map(mapDoc).sort(byOrder);
    },
    () => demoServices.filter((s) => !practice || s.practiceType === practice),
  );
}

export function getServiceBySlug(practice, slug) {
  return withDemo(
    async () => {
      const snap = await getDocs(
        query(
          collection(getDb(), 'services'),
          where('active', '==', true),
          where('practiceType', '==', practice),
          where('slug', '==', slug),
          limit(1),
        ),
      );
      return snap.empty ? null : mapDoc(snap.docs[0]);
    },
    () => demoServices.find((s) => s.practiceType === practice && s.slug === slug) || null,
  );
}
