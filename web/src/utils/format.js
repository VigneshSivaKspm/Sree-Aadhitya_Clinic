const wholeInr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});
const decimalInr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** ₹1,299 / ₹1,299.50 */
export function formatCurrency(value) {
  const n = Number(value) || 0;
  return Number.isInteger(n) ? wholeInr.format(n) : decimalInr.format(n);
}

/** Parses 'YYYY-MM-DD' as a local calendar date (no timezone shift). */
export function parseISODate(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** 'YYYY-MM-DD' -> 'Mon, 5 Jan 2026' */
export function formatDate(iso) {
  const date = parseISODate(iso);
  if (!date) return '—';
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** 'HH:mm' -> '10:30 AM' */
export function formatTime(hhmm) {
  if (!hhmm || !/^\d{2}:\d{2}$/.test(hhmm)) return '—';
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** Firestore Timestamp | Date | millis -> '5 Jan 2026, 10:30 am' (IST) */
export function formatTimestamp(value) {
  const date = value?.toDate ? value.toDate() : value instanceof Date ? value : value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Today's calendar date in India as 'YYYY-MM-DD' (independent of browser timezone). */
export function todayISO() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

export function addDaysISO(iso, days) {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Current time in India as minutes since midnight. */
export function nowMinutesIST() {
  const parts = new Date()
    .toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit' })
    .split(':')
    .map(Number);
  return parts[0] * 60 + parts[1];
}

/** '+91 98765 43210' for a 10-digit number. */
export function formatPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  return phone || '';
}

export function appointmentReference(id) {
  return id ? `APT-${String(id).slice(0, 8).toUpperCase()}` : '—';
}

export function truncate(text, max = 140) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}
