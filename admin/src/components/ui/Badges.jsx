import { titleCase } from '../../utils/format';

const TONES = {
  neutral: 'bg-ink-100 text-ink-700',
  green: 'bg-ayur-100 text-ayur-800',
  blue: 'bg-dental-100 text-dental-800',
  amber: 'bg-gold-100 text-gold-700',
  red: 'bg-danger-100 text-danger-700',
};

export function Badge({ tone = 'neutral', children, className = '' }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${TONES[tone]} ${className}`}>{children}</span>;
}

const STATUS_TONE = {
  // appointments
  pending: 'amber', confirmed: 'blue', completed: 'green', cancelled: 'red', rescheduled: 'neutral',
  // orders
  processing: 'blue', shipped: 'blue', delivered: 'green',
  // payments
  paid: 'green', failed: 'red', refunded: 'neutral',
  // enquiries / generic
  new: 'amber', handled: 'green', active: 'green', inactive: 'neutral',
};

export function StatusBadge({ status }) {
  return <Badge tone={STATUS_TONE[status] || 'neutral'}>{titleCase(status)}</Badge>;
}

export function PracticeBadge({ practice }) {
  if (!practice) return null;
  const map = { ayurveda: ['green', 'Ayurveda'], dental: ['blue', 'Dental'], main: ['neutral', 'Main site'], general: ['neutral', 'General'] };
  const [tone, label] = map[practice] || ['neutral', titleCase(practice)];
  return <Badge tone={tone}>{label}</Badge>;
}
