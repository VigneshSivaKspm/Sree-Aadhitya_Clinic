import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';
import Button from './Button';

export const LoadingSkeleton = ({ className = '' }) => <div className={`skeleton ${className}`} aria-hidden="true" />;

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div role="status" aria-label="Loading" className="divide-y divide-ink-100">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex gap-4 px-4 py-4">
          {Array.from({ length: cols }, (_, c) => <LoadingSkeleton key={c} className="h-4 flex-1" />)}
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="space-y-4">
      <LoadingSkeleton className="h-8 w-56" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <LoadingSkeleton key={i} className="h-28" />)}</div>
      <LoadingSkeleton className="h-64" />
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, message, action }) {
  return (
    <div className="px-6 py-14 text-center">
      <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-ink-100 text-ink-500"><Icon className="size-6" aria-hidden="true" /></span>
      <h3 className="text-base font-semibold text-ink-900">{title}</h3>
      {message && <p className="mx-auto mt-1 max-w-md text-sm text-ink-600">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong while loading this data.', onRetry }) {
  return (
    <div role="alert" className="px-6 py-12 text-center">
      <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-danger-50 text-danger-600"><AlertTriangle className="size-6" aria-hidden="true" /></span>
      <p className="mx-auto max-w-md text-sm text-ink-800">{message}</p>
      {onRetry && <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}><RefreshCw className="size-4" aria-hidden="true" /> Try again</Button>}
    </div>
  );
}
