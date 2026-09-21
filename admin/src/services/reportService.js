import { collection, getAggregateFromServer, getCountFromServer, getDocs, limit, orderBy, query, sum, Timestamp, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { APPOINTMENT_STATUSES, ORDER_STATUSES, REVENUE_STATUSES } from '../config/constants';
import { todayISO } from '../utils/format';

// All numbers come from Firestore COUNT/SUM aggregations (no document downloads).
const count = async (name, ...clauses) => (await getCountFromServer(query(collection(db, name), ...clauses))).data().count;
const since = (date) => (date ? [where('createdAt', '>=', Timestamp.fromDate(date))] : []);

export const practicesFor = (practiceScope) => (practiceScope ? [practiceScope] : ['ayurveda', 'dental']);

/** { ayurveda: { total, pending, confirmed, ... }, dental: {...} } */
export async function appointmentBreakdown(practiceScope, startDate) {
  const result = {};
  await Promise.all(
    practicesFor(practiceScope).map(async (practice) => {
      const counts = await Promise.all(
        APPOINTMENT_STATUSES.map((s) => count('appointments', where('practiceType', '==', practice), where('status', '==', s), ...since(startDate))),
      );
      result[practice] = Object.fromEntries(APPOINTMENT_STATUSES.map((s, i) => [s, counts[i]]));
      result[practice].total = counts.reduce((a, b) => a + b, 0);
    }),
  );
  return result;
}

export async function orderBreakdown(startDate) {
  const counts = await Promise.all(ORDER_STATUSES.map((s) => count('orders', where('orderStatus', '==', s), ...since(startDate))));
  const byStatus = Object.fromEntries(ORDER_STATUSES.map((s, i) => [s, counts[i]]));
  const revenueSnap = await getAggregateFromServer(
    query(collection(db, 'orders'), where('orderStatus', 'in', REVENUE_STATUSES), ...since(startDate)),
    { revenue: sum('total') },
  );
  return { byStatus, total: counts.reduce((a, b) => a + b, 0), revenue: revenueSnap.data().revenue || 0 };
}

/** Top products from the most recent orders (bounded read, not a full scan). */
export async function topProducts(startDate, maxOrders = 200) {
  const snap = await getDocs(
    query(collection(db, 'orders'), where('orderStatus', 'in', REVENUE_STATUSES), ...since(startDate), orderBy('createdAt', 'desc'), limit(maxOrders)),
  );
  const map = new Map();
  snap.docs.forEach((d) =>
    (d.data().items || []).forEach((i) => {
      const row = map.get(i.productId) || { productId: i.productId, name: i.name, quantity: 0, revenue: 0 };
      row.quantity += i.quantity;
      row.revenue += i.total;
      map.set(i.productId, row);
    }),
  );
  return { rows: [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 10), ordersConsidered: snap.size, capped: snap.size === maxOrders };
}

export async function lowStockProducts(threshold, max = 25) {
  const snap = await getDocs(query(collection(db, 'products'), where('stockQuantity', '<=', threshold), orderBy('stockQuantity', 'asc'), limit(max)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function dashboardCounts({ practiceScope, storeAccess, threshold }) {
  const scope = practiceScope ? [where('practiceType', '==', practiceScope)] : [];
  const [today, pending, confirmed, completed] = await Promise.all([
    count('appointments', ...scope, where('preferredDate', '==', todayISO())),
    count('appointments', ...scope, where('status', '==', 'pending')),
    count('appointments', ...scope, where('status', '==', 'confirmed')),
    count('appointments', ...scope, where('status', '==', 'completed')),
  ]);
  const out = { today, pending, confirmed, completed };
  if (storeAccess) {
    const [orders, pendingOrders, products, lowStock] = await Promise.all([
      count('orders'),
      count('orders', where('orderStatus', '==', 'pending')),
      count('products'),
      count('products', where('stockQuantity', '<=', threshold)),
    ]);
    Object.assign(out, { orders, pendingOrders, products, lowStock });
  }
  return out;
}

export async function recent(name, max = 5, constraints = []) {
  const snap = await getDocs(query(collection(db, name), ...constraints, orderBy('createdAt', 'desc'), limit(max)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
