import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export const mapDoc = (snap) => ({ id: snap.id, ...snap.data() });

/** where() constraint that limits a practice admin to their own practice (super admin: none). */
export const scopeConstraint = (practiceScope) => (practiceScope ? [where('practiceType', '==', practiceScope)] : []);

/** Small generic repository with createdBy/updatedBy + server timestamps. */
export function createCrud(name) {
  const col = () => collection(db, name);
  return {
    name,
    async list(constraints = []) {
      const snap = await getDocs(query(col(), ...constraints));
      return snap.docs.map(mapDoc);
    },
    async get(id) {
      const snap = await getDoc(doc(db, name, id));
      return snap.exists() ? mapDoc(snap) : null;
    },
    async create(data, user) {
      const ref = await addDoc(col(), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user.uid,
        updatedBy: user.uid,
      });
      return ref.id;
    },
    update(id, data, user) {
      return updateDoc(doc(db, name, id), { ...data, updatedAt: serverTimestamp(), updatedBy: user.uid });
    },
    remove(id) {
      return deleteDoc(doc(db, name, id));
    },
    /** True when another document already uses this field value (optionally within one practice). */
    async isTaken(field, value, { practiceType, excludeId } = {}) {
      const parts = [where(field, '==', value)];
      if (practiceType) parts.push(where('practiceType', '==', practiceType));
      const snap = await getDocs(query(col(), ...parts, limit(2)));
      return snap.docs.some((d) => d.id !== excludeId);
    },
  };
}

export const doctorService = createCrud('doctors');
export const serviceService = createCrud('services');
export const categoryService = createCrud('productCategories');
export const testimonialService = createCrud('testimonials');
export const faqService = createCrud('faqs');
export const enquiryService = createCrud('enquiries');
export const productCrud = createCrud('products');
