import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { AppError } from '../utils/errors';
import { calcTotals, generateOrderCode } from '../utils/pricing';
import { normalizePhone } from '../utils/validators';
import { getDb } from './base';
import { verifyCartItems } from './productService';

/**
 * Places an order (create-only). Prices/stock are re-read from Firestore first.
 * If anything changed, throws an AppError('cart-changed') carrying the verified lines
 * so the UI can update the cart and ask the customer to review.
 *
 * Payment is offline (COD / manual transfer): paymentStatus always starts 'pending'.
 * Stock is NOT decremented here — staff confirm the order in the admin app, which
 * deducts stock inside a transaction.
 */
export async function placeOrder({ customer, address, items, paymentMethod, shipping }) {
  const db = getDb();
  const { verified, issues } = await verifyCartItems(items);

  if (issues.length) {
    throw new AppError('Some items in your cart have changed. Please review your cart and try again.', 'cart-changed', {
      verified,
      issues,
    });
  }

  const { subtotal, shippingFee, total } = calcTotals(verified, shipping);
  const orderId = generateOrderCode();
  const itemCount = verified.reduce((n, i) => n + i.quantity, 0);

  const orderItems = verified.map((i) => ({
    productId: i.productId,
    name: i.name,
    sku: i.sku,
    quantity: i.quantity,
    unitPrice: i.price,
    total: i.price * i.quantity,
  }));

  const order = {
    orderNumber: orderId,
    customer: { name: customer.name.trim(), phone: normalizePhone(customer.phone), email: (customer.email || '').trim() },
    deliveryAddress: {
      addressLine: address.addressLine.trim(),
      area: address.area.trim(),
      city: address.city.trim(),
      district: address.district.trim(),
      state: address.state.trim(),
      postalCode: address.postalCode.trim(),
      landmark: (address.landmark || '').trim(),
    },
    items: orderItems,
    itemCount,
    subtotal,
    shippingFee,
    total,
    paymentMethod,
    paymentStatus: 'pending',
    orderStatus: 'pending',
    stockDeducted: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Public status record: contains no address or phone number.
  const tracking = {
    orderNumber: orderId,
    orderStatus: 'pending',
    paymentStatus: 'pending',
    itemCount,
    total,
    items: orderItems.map((i) => ({ name: i.name, quantity: i.quantity })),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const batch = writeBatch(db);
  batch.set(doc(db, 'orders', orderId), order);
  batch.set(doc(db, 'orderTracking', orderId), tracking);
  await batch.commit();

  return {
    id: orderId,
    orderNumber: orderId,
    total,
    subtotal,
    shippingFee,
    itemCount,
    items: orderItems,
    paymentMethod,
    orderStatus: 'pending',
    paymentStatus: 'pending',
    createdAtISO: new Date().toISOString(),
  };
}

/** Public order lookup by tracking code (status only). Returns null when not found. */
export async function getOrderTracking(code) {
  const id = String(code || '').trim().toUpperCase();
  if (!/^AAH-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(id)) return null;
  const snap = await getDoc(doc(getDb(), 'orderTracking', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
