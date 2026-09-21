import { Leaf, Package, Smile, Stethoscope } from 'lucide-react';

const PLACEHOLDER = {
  ayurveda: { Icon: Leaf, bg: 'bg-gradient-to-br from-ayur-100 to-ayur-50', fg: 'text-ayur-400' },
  dental: { Icon: Smile, bg: 'bg-gradient-to-br from-dental-100 to-dental-50', fg: 'text-dental-400' },
  product: { Icon: Package, bg: 'bg-gradient-to-br from-sand-200 to-sand-100', fg: 'text-ayur-400' },
  doctor: { Icon: Stethoscope, bg: 'bg-gradient-to-br from-ink-100 to-ink-50', fg: 'text-ink-300' },
  main: { Icon: Leaf, bg: 'bg-gradient-to-br from-sand-200 to-sand-100', fg: 'text-ink-300' },
};

/**
 * Image with a graceful placeholder when no source is supplied yet.
 * kind: ayurveda | dental | product | doctor | main
 */
export default function SmartImage({ src, alt = '', kind = 'main', className = '', iconClass = 'size-10', eager = false }) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={`object-cover ${className}`}
      />
    );
  }
  const { Icon, bg, fg } = PLACEHOLDER[kind] || PLACEHOLDER.main;
  return (
    <div className={`flex items-center justify-center ${bg} ${className}`} role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true}>
      <Icon className={`${iconClass} ${fg}`} strokeWidth={1.25} aria-hidden="true" />
    </div>
  );
}
