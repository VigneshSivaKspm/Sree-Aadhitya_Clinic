/** Shipping fee for a given subtotal, from the shipping configuration. */
export function calcShipping(subtotal, shipping = {}) {
  if (!shipping.enabled || subtotal <= 0) return 0;
  if (shipping.freeAbove && subtotal >= shipping.freeAbove) return 0;
  return Number(shipping.flatFee) || 0;
}

export function calcTotals(items, shipping) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee = calcShipping(subtotal, shipping);
  return { subtotal, shippingFee, total: subtotal + shippingFee };
}

export function slotsBetween(startTime = '09:30', endTime = '17:30', minutes = 30) {
  const toMin = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const slots = [];
  for (let t = toMin(startTime); t <= toMin(endTime); t += minutes) {
    slots.push(`${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`);
  }
  return slots;
}

/** Random, unguessable, human-friendly order code: AAH-XXXX-XXXX-XXXX */
export function generateOrderCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 symbols, no I/O/0/1
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
  return `AAH-${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}`;
}
