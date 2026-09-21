import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';
import Button from './Button';

export function LoadingSkeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

/** Grid of card skeletons used while lists load. */
export function CardGridSkeleton({ count = 3, cols = 'sm:grid-cols-2 lg:grid-cols-3', imageClass = 'h-48' }) {
  return (
    <div className={`grid gap-6 ${cols}`} role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-ink-100 bg-white">
          <LoadingSkeleton className={`${imageClass} rounded-none`} />
          <div className="space-y-3 p-5">
            <LoadingSkeleton className="h-5 w-2/3" />
            <LoadingSkeleton className="h-4 w-full" />
            <LoadingSkeleton className="h-4 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="container-page py-16" role="status" aria-label="Loading page">
      <LoadingSkeleton className="mb-6 h-10 w-1/2" />
      <LoadingSkeleton className="mb-3 h-4 w-full" />
      <LoadingSkeleton className="mb-3 h-4 w-5/6" />
      <LoadingSkeleton className="h-64 w-full" />
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, message, action }) {
  return (
    <div className="rounded-xl border border-dashed border-ink-200 bg-white px-6 py-12 text-center">
      <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-ink-100 text-ink-500">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h3 className="font-sans text-base font-semibold text-ink-900">{title}</h3>
      {message && <p className="mx-auto mt-1.5 max-w-md text-sm text-ink-600">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong while loading this content.', onRetry }) {
  return (
    <div role="alert" className="rounded-xl border border-danger-600/20 bg-danger-50 px-6 py-10 text-center">
      <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-white text-danger-600">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </span>
      <p className="mx-auto max-w-md text-sm text-ink-800">{message}</p>
      {onRetry && (
        <div className="mt-5">
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="size-4" aria-hidden="true" /> Try again
          </Button>
        </div>
      )}
    </div>
  );
}

/** Small notice shown above lists that contain placeholder (demo) content. */
export function DemoNotice({ show = true }) {
  if (!show) return null;
  return (
    <p className="mb-6 rounded-md border border-gold-500/30 bg-gold-500/10 px-4 py-2.5 text-sm text-ink-800">
      <strong className="font-semibold">Sample content.</strong> This section is showing placeholder content until real
      details are added from the admin panel.
    </p>
  );
}
