import { todayISO } from './format';

// Validators return an error message or '' when valid.

export const normalizePhone = (value) => {
  let d = String(value || '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return d;
};

export const v = {
  text: (value, { label = 'This field', min = 0, max = 200, required = false } = {}) => {
    const s = String(value ?? '').trim();
    if (!s) return required ? `${label} is required.` : '';
    if (s.length < min) return `${label} must be at least ${min} characters.`;
    if (s.length > max) return `${label} must be ${max} characters or fewer.`;
    return '';
  },

  email: (value, { required = false } = {}) => {
    const s = String(value || '').trim();
    if (!s) return required ? 'Email is required.' : '';
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) ? '' : 'Enter a valid email address.';
  },

  phone: (value, { required = false } = {}) => {
    const d = normalizePhone(value);
    if (!d) return required ? 'Mobile number is required.' : '';
    return /^[6-9]\d{9}$/.test(d) ? '' : 'Enter a valid 10-digit Indian mobile number.';
  },

  slug: (value) => {
    const s = String(value || '').trim();
    if (!s) return 'Slug is required.';
    if (s.length > 100) return 'Slug must be 100 characters or fewer.';
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s) ? '' : 'Use lowercase letters, numbers and single hyphens only.';
  },

  price: (value, { label = 'Price', required = true, allowZero = false } = {}) => {
    if (value === '' || value == null) return required ? `${label} is required.` : '';
    const n = Number(value);
    if (!Number.isFinite(n)) return `${label} must be a number.`;
    if (n < 0 || (!allowZero && n === 0 && required)) return `${label} must be greater than 0.`;
    if (n > 10000000) return `${label} is too large.`;
    if (Math.abs(n * 100 - Math.round(n * 100)) > 1e-6) return `${label} can have at most 2 decimal places.`;
    return '';
  },

  stock: (value, label = 'Stock') => {
    if (value === '' || value == null) return `${label} is required.`;
    const n = Number(value);
    if (!Number.isInteger(n)) return `${label} must be a whole number.`;
    if (n < 0) return `${label} cannot be negative.`;
    if (n > 1000000) return `${label} is too large.`;
    return '';
  },

  integer: (value, { label = 'Value', min = 0, max = 100000, required = false } = {}) => {
    if (value === '' || value == null) return required ? `${label} is required.` : '';
    const n = Number(value);
    if (!Number.isInteger(n)) return `${label} must be a whole number.`;
    if (n < min || n > max) return `${label} must be between ${min} and ${max}.`;
    return '';
  },

  url: (value) => {
    const s = String(value || '').trim();
    if (!s) return '';
    try {
      const u = new URL(s);
      return ['http:', 'https:'].includes(u.protocol) ? '' : 'Enter a valid http(s) link.';
    } catch {
      return 'Enter a valid link starting with https://';
    }
  },

  date: (value, { notPast = false, label = 'Date' } = {}) => {
    if (!value) return `${label} is required.`;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Enter a valid date.';
    if (notPast && value < todayISO()) return `${label} cannot be in the past.`;
    return '';
  },

  time: (value) => (/^\d{2}:\d{2}$/.test(value || '') ? '' : 'Select a time.'),

  select: (value, label = 'This field') => (value ? '' : `${label} is required.`),
};

export const hasErrors = (errors) => Object.values(errors).some(Boolean);

export const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);

// nested path helpers for structured content forms
export const getIn = (obj, path, fallback = '') => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj) ?? fallback;
export function setIn(obj, path, value) {
  const keys = path.split('.');
  const out = Array.isArray(obj) ? [...obj] : { ...obj };
  let cur = out;
  keys.forEach((k, i) => {
    if (i === keys.length - 1) cur[k] = value;
    else {
      cur[k] = Array.isArray(cur[k]) ? [...cur[k]] : { ...(cur[k] || {}) };
      cur = cur[k];
    }
  });
  return out;
}
