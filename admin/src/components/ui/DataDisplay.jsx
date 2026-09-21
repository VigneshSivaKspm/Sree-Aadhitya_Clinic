import { Link } from 'react-router-dom';
import { LoadingSkeleton } from './States';

export function PageHeader({ title, description, actions, back }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {back}
        <h1 className="text-2xl font-semibold text-ink-900">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-ink-600">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, description, actions, children, className = '', padded = true }) {
  return (
    <section className={`rounded-xl border border-ink-200 bg-white shadow-sm ${className}`}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-3.5">
          <div>
            <h2 className="text-base font-semibold text-ink-900">{title}</h2>
            {description && <p className="text-xs text-ink-500">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </section>
  );
}

const STAT_TONES = { neutral: 'bg-ink-100 text-ink-700', green: 'bg-ayur-100 text-ayur-700', blue: 'bg-info-100 text-info-700', amber: 'bg-gold-100 text-gold-700', red: 'bg-danger-100 text-danger-700' };

export function StatCard({ label, value, icon: Icon, tone = 'neutral', to, loading, hint }) {
  const body = (
    <div className={`flex items-center gap-4 rounded-xl border border-ink-200 bg-white p-5 shadow-sm ${to ? 'transition-shadow hover:shadow-md' : ''}`}>
      {Icon && <span className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${STAT_TONES[tone]}`}><Icon className="size-5" aria-hidden="true" /></span>}
      <div className="min-w-0">
        <p className="text-sm text-ink-600">{label}</p>
        {loading ? <LoadingSkeleton className="mt-1.5 h-7 w-16" /> : <p className="text-2xl font-semibold text-ink-900 tabular-nums">{value}</p>}
        {hint && !loading && <p className="text-xs text-ink-500">{hint}</p>}
      </div>
    </div>
  );
  return to ? <Link to={to} className="block rounded-xl">{body}</Link> : body;
}

/** Definition-list row used in detail views. */
export function DetailRow({ label, children }) {
  return (
    <div className="grid grid-cols-3 gap-3 py-2.5 text-sm">
      <dt className="text-ink-500">{label}</dt>
      <dd className="col-span-2 break-words text-ink-900">{children || '—'}</dd>
    </div>
  );
}
