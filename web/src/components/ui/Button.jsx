import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toneFor } from '../../config/theme';

const SIZES = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

/**
 * variant: primary | outline | light | ghost
 * tone:    main | ayurveda | dental
 * Pass `to` for a router link, `href` for an anchor, otherwise renders a <button>.
 */
export default function Button({
  as,
  to,
  href,
  variant = 'primary',
  tone = 'main',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  type = 'button',
  ...rest
}) {
  const t = toneFor(tone);
  const variants = {
    primary: t.solid,
    outline: `border bg-transparent ${t.outline}`,
    light: 'bg-white text-ink-900 hover:bg-sand-100',
    ghost: `bg-transparent ${t.text} hover:bg-black/5`,
  };
  const classes = `inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-colors disabled:opacity-60 aria-disabled:pointer-events-none aria-disabled:opacity-60 ${SIZES[size]} ${variants[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }
  const Comp = as || 'button';
  return (
    <Comp type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </Comp>
  );
}
