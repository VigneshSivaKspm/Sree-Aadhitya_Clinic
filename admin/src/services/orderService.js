import { collection, doc, getDoc, orderBy, runTransaction, serverTimestamp, where, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ORDER_TRANSITIONS } from '../config/constants';
import { AppError } from '../utils/errors';

export function orderConstraints({ status }) {
  const parts = [];
  if (status) parts.push(where('orderStatus', '==', status));
  parts.push(orderBy('createdAt', 'desc'));
  return parts;
}

export async function getOrder(id) {
  const snap = await getDoc(doc(db, 'orders', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

const sumByProduct = (items) => {
  const map = new Map();
  items.forEach((i) => map.set(i.productId, { name: i.name, qty: (map.get(i.productId)?.qty || 0) + i.quantity }));
  return map;
};

/**
 * Moves an order to a new status inside ONE transaction, and keeps stock consistent:
 *  - first move past 'pending'  -> deduct stock for every line (fails if any line is short)
 *  - cancellation after deduction -> restore stock
 * Also mirrors the status to the public orderTracking record and logs stock movements.
 */
export async function changeOrderStatus(orderId, nextStatus, user) {
  await runTransaction(db, async (tx) => {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await tx.get(orderRef);
    if (!orderSnap.exists()) throw new AppError('This order no longer exists.', 'not-found');
    const order = orderSnap.data();

    if (!ORDER_TRANSITIONS[order.orderStatus]?.includes(nextStatus)) {
      throw new AppError(`An order that is ${order.orderStatus} can’t be changed to ${nextStatus}.`, 'invalid-transition');
    }

    const deduct = nextStatus !== 'cancelled' && !order.stockDeducted;
    const restore = nextStatus === 'cancelled' && order.stockDeducted === true;
    const lines = sumByProduct(order.items);

    // ---- all reads first
    const products = new Map();
    if (deduct || restore) {
      await Promise.all(
        [...lines.keys()].map(async (productId) => {
          products.set(productId, await tx.get(doc(db, 'products', productId)));
        }),
      );
    }

    if (deduct) {
      for (const [productId, line] of lines) {
        const snap = products.get(productId);
        if (!snap.exists()) throw new AppError(`“${line.name}” no longer exists in the catalogue, so this order can’t be confirmed automatically.`, 'missing-product');
        if ((Number(snap.data().stockQuantity) || 0) < line.qty) {
          throw new AppError(`Not enough stock for “${line.name}” (needs ${line.qty}, have ${Number(snap.data().stockQuantity) || 0}).`, 'insufficient-stock');
        }
      }
    }

    // ---- writes
    const orderUpdate = { orderStatus: nextStatus, updatedAt: serverTimestamp(), updatedBy: user.uid };
    const applyStock = (productId, line, sign, reason) => {
      const snap = products.get(productId);
      if (!snap?.exists()) return; // product deleted since the order — nothing to restore
      const previous = Number(snap.data().stockQuantity) || 0;
      const next = previous + sign * line.qty;
      tx.update(snap.ref, { stockQuantity: next, inStock: next > 0, updatedAt: serverTimestamp(), updatedBy: user.uid });
      tx.set(doc(collection(snap.ref, 'stockMovements')), {
        delta: sign * line.qty, previous, next, reason, orderId, by: user.uid, at: serverTimestamp(),
      });
    };

    if (deduct) {
      for (const [productId, line] of lines) applyStock(productId, line, -1, `Order ${orderId} confirmed`);
      orderUpdate.stockDeducted = true;
    }
    if (restore) {
      for (const [productId, line] of lines) applyStock(productId, line, +1, `Order ${orderId} cancelled`);
      orderUpdate.stockDeducted = false;
    }

    tx.update(orderRef, orderUpdate);
    tx.update(doc(db, 'orderTracking', orderId), { orderStatus: nextStatus, updatedAt: serverTimestamp() });
  });
}

export async function changePaymentStatus(orderId, paymentStatus, user) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'orders', orderId), { paymentStatus, updatedAt: serverTimestamp(), updatedBy: user.uid });
  batch.update(doc(db, 'orderTracking', orderId), { paymentStatus, updatedAt: serverTimestamp() });
  await batch.commit();
}

/** Carrier / tracking number, shown to the customer on the public order-status page. */
export async function saveShippingInfo(orderId, { carrier, trackingNumber, note }, user) {
  const shipping = { carrier: carrier.trim(), trackingNumber: trackingNumber.trim(), note: note.trim() };
  const batch = writeBatch(db);
  batch.update(doc(db, 'orders', orderId), { shipping, updatedAt: serverTimestamp(), updatedBy: user.uid });
  batch.update(doc(db, 'orderTracking', orderId), { shipping: { carrier: shipping.carrier, trackingNumber: shipping.trackingNumber }, updatedAt: serverTimestamp() });
  await batch.commit();
  return shipping;
}
