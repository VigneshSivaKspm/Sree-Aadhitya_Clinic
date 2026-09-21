import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-ink-900 text-white hover:bg-ink-800',
  secondary: 'border border-ink-300 bg-white text-ink-800 hover:bg-ink-50',
  danger: 'bg-danger-600 text-white hover:bg-danger-700',
  dangerOutline: 'border border-danger-600/40 bg-white text-danger-700 hover:bg-danger-50',
  ghost: 'text-ink-700 hover:bg-ink-100',
};
const SIZES = { sm: 'h-8 px-3 text-sm gap-1.5', md: 'h-10 px-4 text-sm gap-2', lg: 'h-11 px-5 text-base gap-2' };

export default function Button({ to, variant = 'primary', size = 'md', loading = false, disabled = false, className = '', children, type = 'button', ...rest }) {
  const classes = `inline-flex items-center justify-center rounded-md font-medium whitespace-nowrap transition-colors disabled:opacity-60 ${SIZES[size]} ${VARIANTS[variant]} ${className}`;
  if (to) return <Link to={to} className={classes} {...rest}>{children}</Link>;
  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

/** Square icon-only button (always give it an aria-label). */
export function IconButton({ label, children, className = '', variant = 'ghost', ...rest }) {
  const v = variant === 'danger' ? 'text-ink-500 hover:bg-danger-50 hover:text-danger-600' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900';
  return (
    <button type="button" aria-label={label} title={label} className={`inline-flex size-8 items-center justify-center rounded-md transition-colors ${v} ${className}`} {...rest}>
      {children}
    </button>
  );
}
