import { collection, doc, getDocs, limit, orderBy, query, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AppError } from '../utils/errors';

/**
 * Sets a product's stock and appends a movement record (products/{id}/stockMovements),
 * inside one transaction. The movement log is the foundation for future stock history views.
 */
export async function setStock(productId, newQuantity, reason, user) {
  const qty = Number(newQuantity);
  if (!Number.isInteger(qty) || qty < 0) throw new AppError('Stock must be a whole number, zero or more.', 'invalid-stock');

  return runTransaction(db, async (tx) => {
    const ref = doc(db, 'products', productId);
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new AppError('This product no longer exists.', 'not-found');
    const previous = Number(snap.data().stockQuantity) || 0;
    if (previous === qty) return { previous, next: qty };
    tx.update(ref, { stockQuantity: qty, inStock: qty > 0, updatedAt: serverTimestamp(), updatedBy: user.uid });
    tx.set(doc(collection(ref, 'stockMovements')), {
      delta: qty - previous, previous, next: qty, reason: reason || 'Manual adjustment', by: user.uid, at: serverTimestamp(),
    });
    return { previous, next: qty };
  });
}

export async function listStockMovements(productId, max = 20) {
  const snap = await getDocs(query(collection(db, 'products', productId, 'stockMovements'), orderBy('at', 'desc'), limit(max)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
