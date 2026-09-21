import { addDaysISO, nowMinutesIST, todayISO } from './format';

// Each validator returns an error message, or '' when the value is valid.

/** Normalises an Indian mobile number to 10 digits (strips +91 / 0 / spaces). */
export function normalizePhone(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}

export const validators = {
  required: (value, label = 'This field') =>
    String(value ?? '').trim() ? '' : `${label} is required.`,

  name: (value, label = 'Name') => {
    const v = String(value || '').trim();
    if (!v) return `${label} is required.`;
    if (v.length < 2) return `${label} must be at least 2 characters.`;
    if (v.length > 100) return `${label} must be 100 characters or fewer.`;
    if (!/^[\p{L}][\p{L}\s.'-]*$/u.test(v)) return `${label} can only contain letters, spaces and . ' -`;
    return '';
  },

  phone: (value) => {
    const digits = normalizePhone(value);
    if (!digits) return 'Mobile number is required.';
    if (!/^[6-9]\d{9}$/.test(digits)) return 'Enter a valid 10-digit Indian mobile number.';
    return '';
  },

  email: (value, { optional = true } = {}) => {
    const v = String(value || '').trim();
    if (!v) return optional ? '' : 'Email is required.';
    if (v.length > 120) return 'Email is too long.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email address.';
    return '';
  },

  text: (value, { label = 'This field', min = 0, max = 200, required = false } = {}) => {
    const v = String(value || '').trim();
    if (!v) return required ? `${label} is required.` : '';
    if (v.length < min) return `${label} must be at least ${min} characters.`;
    if (v.length > max) return `${label} must be ${max} characters or fewer.`;
    return '';
  },

  postalCode: (value) => {
    const v = String(value || '').trim();
    if (!v) return 'PIN code is required.';
    if (!/^[1-9]\d{5}$/.test(v)) return 'Enter a valid 6-digit PIN code.';
    return '';
  },

  /** Preferred appointment date: today or later, within the booking window. */
  appointmentDate: (value, maxDaysAhead = 90) => {
    if (!value) return 'Preferred date is required.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Enter a valid date.';
    const today = todayISO();
    if (value < today) return 'Appointment date cannot be in the past.';
    if (value > addDaysISO(today, maxDaysAhead)) return `Please choose a date within the next ${maxDaysAhead} days.`;
    return '';
  },

  appointmentTime: (value, date, slots = []) => {
    if (!value) return 'Preferred time is required.';
    if (!/^\d{2}:\d{2}$/.test(value)) return 'Enter a valid time.';
    if (slots.length && !slots.includes(value)) return 'Please choose one of the available time slots.';
    if (date === todayISO()) {
      const [h, m] = value.split(':').map(Number);
      if (h * 60 + m <= nowMinutesIST()) return 'That time has already passed today.';
    }
    return '';
  },
};

/** True when a values-to-errors object contains any message. */
export const hasErrors = (errors) => Object.values(errors).some(Boolean);
