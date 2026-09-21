// Safe localStorage wrappers (private mode / blocked storage must never crash the app).
export function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable or full — ignore */
  }
}

// ---- Locally remembered orders (so customers can find their orders on this device)
const ORDERS_KEY = 'aah_orders_v1';

export function getSavedOrders() {
  const list = readJSON(ORDERS_KEY, []);
  return Array.isArray(list) ? list : [];
}

export function saveOrderLocally(order) {
  const list = getSavedOrders().filter((o) => o.id !== order.id);
  list.unshift({
    id: order.id,
    total: order.total,
    itemCount: order.itemCount,
    items: order.items.map((i) => ({ name: i.name, quantity: i.quantity })),
    createdAt: order.createdAtISO,
  });
  writeJSON(ORDERS_KEY, list.slice(0, 20));
}
