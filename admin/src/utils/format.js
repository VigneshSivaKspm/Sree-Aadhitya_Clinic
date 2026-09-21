const wholeInr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const decimalInr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatCurrency(value) {
  const n = Number(value) || 0;
  return Number.isInteger(n) ? wholeInr.format(n) : decimalInr.format(n);
}

export const formatNumber = (n) => new Intl.NumberFormat('en-IN').format(Number(n) || 0);

export function parseISODate(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(iso) {
  const date = parseISODate(iso);
  return date ? date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—';
}

export function formatTime(hhmm) {
  if (!hhmm || !/^\d{2}:\d{2}$/.test(hhmm)) return '—';
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

export function toDate(value) {
  if (!value) return null;
  const d = value.toDate ? value.toDate() : value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Firestore Timestamp | Date -> '5 Jan 2026, 10:30 am' (IST) */
export function formatTimestamp(value) {
  const d = toDate(value);
  return d
    ? d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '—';
}

export function formatShortDate(value) {
  const d = toDate(value);
  return d ? d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' }) : '—';
}

/** Today in India as YYYY-MM-DD (independent of the browser timezone). */
export const todayISO = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

export function formatPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length === 10 ? `+91 ${digits.slice(0, 5)} ${digits.slice(5)}` : phone || '—';
}

export const appointmentReference = (id) => (id ? `APT-${String(id).slice(0, 8).toUpperCase()}` : '—');

export const truncateText = (text, max = 100) => (text && text.length > max ? `${text.slice(0, max).trimEnd()}…` : text || '');

export const titleCase =(s) => String(s || '').replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

/** Start of a reporting range as a Date (or null for all time). */
export function rangeStart(range) {
  const now = new Date();
  if (range === '30d') return new Date(now.getTime() - 30 * 86400000);
  if (range === 'month') return new Date(now.getFullYear(), now.getMonth(), 1);
  if (range === 'year') return new Date(now.getFullYear(), 0, 1);
  return null;
}
