const digitsOnly = (v) => String(v || '').replace(/\D/g, '');

export function telHref(phone) {
  const d = digitsOnly(phone);
  if (!d) return undefined;
  return `tel:+${d.length === 10 ? `91${d}` : d}`;
}

export function whatsappHref(number, message) {
  let d = digitsOnly(number);
  if (!d) return undefined;
  if (d.length === 10) d = `91${d}`;
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${d}${text}`;
}

export function mapsSearchHref(address) {
  return address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : undefined;
}
