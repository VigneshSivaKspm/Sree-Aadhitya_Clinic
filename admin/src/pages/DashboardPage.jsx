import { Link } from 'react-router-dom';
import { AlertTriangle, CalendarCheck, CalendarClock, CalendarDays, CheckCircle2, Package, ShoppingBag, ShoppingCart } from 'lucide-react';
import { DEFAULT_SETTINGS } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';
import { Card, PageHeader, StatCard } from '../components/ui/DataDisplay';
import { PracticeBadge, StatusBadge } from '../components/ui/Badges';
import { EmptyState, ErrorState, LoadingSkeleton } from '../components/ui/States';
import { useAsync } from '../hooks/useAsync';
import { getSettings } from '../services/contentService';
import { scopeConstraint } from '../services/crud';
import { dashboardCounts, lowStockProducts, recent } from '../services/reportService';
import { formatCurrency, formatDate, formatNumber, formatTime, formatTimestamp } from '../utils/format';

function ListSkeleton() {
  return <div className="space-y-3 p-5" role="status" aria-label="Loading">{[0, 1, 2, 3].map((i) => <LoadingSkeleton key={i} className="h-10" />)}</div>;
}

export default function DashboardPage() {
  const { practiceScope, can, profile } = useAuth();
  const store = can('orders');
  const settings = useAsync(getSettings, []);
  const threshold = settings.data?.lowStockThreshold ?? DEFAULT_SETTINGS.lowStockThreshold;
  const ready = !settings.loading;

  const counts = useAsync(() => dashboardCounts({ practiceScope, storeAccess: store, threshold }), [practiceScope, store, threshold], { enabled: ready });
  const appts = useAsync(() => recent('appointments', 6, scopeConstraint(practiceScope)), [practiceScope]);
  const orders = useAsync(() => recent('orders', 6), [], { enabled: store });
  const lowStock = useAsync(() => lowStockProducts(threshold, 6), [threshold], { enabled: store && ready });

  const c = counts.data || {};
  const cLoading = counts.loading || !ready;

  return (
    <>
      <PageHeader
        title={`Welcome${profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}`}
        description={practiceScope ? `Showing ${practiceScope === 'dental' ? 'Dental' : 'Ayurveda'} practice data.` : 'Combined overview across both practices and the store.'}
      />

      {counts.error && <div className="mb-6 rounded-xl border border-ink-200 bg-white"><ErrorState message={counts.error} onRetry={counts.reload} /></div>}

      <h2 className="sr-only">Appointments summary</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today’s appointments" value={formatNumber(c.today)} icon={CalendarDays} tone="blue" to="/appointments" loading={cLoading} />
        <StatCard label="Pending" value={formatNumber(c.pending)} icon={CalendarClock} tone="amber" to="/appointments" loading={cLoading} hint="Awaiting confirmation" />
        <StatCard label="Confirmed" value={formatNumber(c.confirmed)} icon={CalendarCheck} tone="green" to="/appointments" loading={cLoading} />
        <StatCard label="Completed" value={formatNumber(c.completed)} icon={CheckCircle2} tone="neutral" to="/appointments" loading={cLoading} />
      </div>

      {store && (
        <>
          <h2 className="sr-only">Store summary</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total orders" value={formatNumber(c.orders)} icon={ShoppingBag} tone="blue" to="/orders" loading={cLoading} />
            <StatCard label="Pending orders" value={formatNumber(c.pendingOrders)} icon={ShoppingCart} tone="amber" to="/orders" loading={cLoading} />
            <StatCard label="Products" value={formatNumber(c.products)} icon={Package} tone="green" to="/products" loading={cLoading} />
            <StatCard label="Low-stock products" value={formatNumber(c.lowStock)} icon={AlertTriangle} tone={c.lowStock ? 'red' : 'neutral'} to="/inventory" loading={cLoading} hint={`At or below ${threshold}`} />
          </div>
        </>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card title="Recent appointments" padded={false} actions={<Link to="/appointments" className="text-sm font-medium text-dental-700 hover:underline">View all</Link>}>
          {appts.loading ? <ListSkeleton /> : appts.error ? <ErrorState message={appts.error} onRetry={appts.reload} />
            : !appts.data?.length ? <EmptyState icon={CalendarDays} title="No appointments yet" message="New requests from the website will appear here." />
            : (
              <ul className="divide-y divide-ink-100">
                {appts.data.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-900">{a.patientName}</p>
                      <p className="truncate text-xs text-ink-500">{a.serviceName || 'General consultation'} · {formatDate(a.preferredDate)}, {formatTime(a.preferredTime)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">{!practiceScope && <PracticeBadge practice={a.practiceType} />}<StatusBadge status={a.status} /></div>
                  </li>
                ))}
              </ul>
            )}
        </Card>

        {store ? (
          <div className="space-y-6">
            <Card title="Recent orders" padded={false} actions={<Link to="/orders" className="text-sm font-medium text-dental-700 hover:underline">View all</Link>}>
              {orders.loading ? <ListSkeleton /> : orders.error ? <ErrorState message={orders.error} onRetry={orders.reload} />
                : !orders.data?.length ? <EmptyState icon={ShoppingBag} title="No orders yet" message="Store orders will appear here." />
                : (
                  <ul className="divide-y divide-ink-100">
                    {orders.data.map((o) => (
                      <li key={o.id}>
                        <Link to={`/orders/${o.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-ink-50">
                          <div className="min-w-0">
                            <p className="truncate font-mono text-sm font-medium text-ink-900">{o.orderNumber}</p>
                            <p className="truncate text-xs text-ink-500">{o.customer?.name} · {formatTimestamp(o.createdAt)}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-3"><span className="text-sm font-medium tabular-nums">{formatCurrency(o.total)}</span><StatusBadge status={o.orderStatus} /></div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
            </Card>

            <Card title="Low-stock alerts" padded={false} actions={<Link to="/inventory" className="text-sm font-medium text-dental-700 hover:underline">Inventory</Link>}>
              {lowStock.loading ? <ListSkeleton /> : lowStock.error ? <ErrorState message={lowStock.error} onRetry={lowStock.reload} />
                : !lowStock.data?.length ? <EmptyState icon={CheckCircle2} title="Stock levels look fine" message={`No products at or below ${threshold} units.`} />
                : (
                  <ul className="divide-y divide-ink-100">
                    {lowStock.data.map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div className="min-w-0"><p className="truncate text-sm font-medium text-ink-900">{p.name}</p><p className="text-xs text-ink-500">{p.sku}</p></div>
                        <span className={`text-sm font-semibold tabular-nums ${p.stockQuantity === 0 ? 'text-danger-600' : 'text-gold-600'}`}>{p.stockQuantity === 0 ? 'Out of stock' : `${p.stockQuantity} left`}</span>
                      </li>
                    ))}
                  </ul>
                )}
            </Card>
          </div>
        ) : (
          <Card title="Quick links">
            <ul className="space-y-2 text-sm">
              <li><Link to="/doctors" className="font-medium text-dental-700 hover:underline">Manage doctors</Link></li>
              <li><Link to="/services" className="font-medium text-dental-700 hover:underline">Manage treatments</Link></li>
              <li><Link to="/content" className="font-medium text-dental-700 hover:underline">Edit website content</Link></li>
              <li><Link to="/reports" className="font-medium text-dental-700 hover:underline">View reports</Link></li>
            </ul>
          </Card>
        )}
      </div>
    </>
  );
}
