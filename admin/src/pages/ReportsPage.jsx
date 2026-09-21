import { useState } from 'react';
import { APPOINTMENT_STATUSES, DEFAULT_SETTINGS, ORDER_STATUSES } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { getSettings } from '../services/contentService';
import { appointmentBreakdown, lowStockProducts, orderBreakdown, practicesFor, topProducts } from '../services/reportService';
import { Card, PageHeader, StatCard } from '../components/ui/DataDisplay';
import { ErrorState, LoadingSkeleton } from '../components/ui/States';
import { formatCurrency, formatNumber, rangeStart, titleCase } from '../utils/format';
import { IndianRupee, ShoppingBag } from 'lucide-react';

const RANGES = [
  { value: 'all', label: 'All time' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'month', label: 'This month' },
  { value: 'year', label: 'This year' },
];

const STATUS_COLOR = { pending: 'bg-gold-500', confirmed: 'bg-dental-500', completed: 'bg-ayur-500', cancelled: 'bg-danger-600', rescheduled: 'bg-ink-400', processing: 'bg-dental-500', shipped: 'bg-dental-600', delivered: 'bg-ayur-500' };

/** Horizontal bar with the number always printed beside it (colour is never the only cue). */
function BarRow({ label, value, max, color }) {
  const pct = max ? Math.max((value / max) * 100, value ? 2 : 0) : 0;
  return (
    <div className="grid grid-cols-[110px_1fr_48px] items-center gap-3 text-sm">
      <span className="text-ink-700">{label}</span>
      <div className="h-2.5 overflow-hidden rounded-full bg-ink-100" role="presentation"><div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} /></div>
      <span className="text-right font-medium text-ink-900 tabular-nums">{formatNumber(value)}</span>
    </div>
  );
}

const Block = ({ q, children, rows = 5 }) => (q.loading ? <div className="space-y-3" role="status" aria-label="Loading">{Array.from({ length: rows }, (_, i) => <LoadingSkeleton key={i} className="h-5" />)}</div> : q.error ? <ErrorState message={q.error} onRetry={q.reload} /> : children(q.data));

export default function ReportsPage() {
  const { practiceScope, can } = useAuth();
  const store = can('orders');
  const [range, setRange] = useState('30d');
  const start = rangeStart(range);
  const settings = useAsync(getSettings, []);
  const threshold = settings.data?.lowStockThreshold ?? DEFAULT_SETTINGS.lowStockThreshold;

  const appts = useAsync(() => appointmentBreakdown(practiceScope, start), [practiceScope, range]);
  const orders = useAsync(() => orderBreakdown(start), [range], { enabled: store });
  const top = useAsync(() => topProducts(start), [range], { enabled: store });
  const low = useAsync(() => lowStockProducts(threshold, 15), [threshold], { enabled: store && !settings.loading });

  const practices = practicesFor(practiceScope);
  const totalAppts = appts.data ? practices.reduce((n, p) => n + (appts.data[p]?.total || 0), 0) : 0;
  const maxPractice = appts.data ? Math.max(...practices.map((p) => appts.data[p]?.total || 0), 1) : 1;

  return (
    <>
      <PageHeader title="Reports" description="Figures are calculated by Firestore aggregation, so they stay fast as data grows."
        actions={(
          <div>
            <label htmlFor="range" className="sr-only">Date range</label>
            <select id="range" value={range} onChange={(e) => setRange(e.target.value)} className="h-10 rounded-md border border-ink-300 bg-white px-3 text-sm focus:border-dental-600 focus:ring-2 focus:ring-dental-100 focus:outline-none">
              {RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        )} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Appointment requests" description={`${formatNumber(totalAppts)} in this period, by date received`}>
          <Block q={appts}>
            {(data) => (
              <div className="space-y-6">
                {!practiceScope && (
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-semibold tracking-wide text-ink-500 uppercase">By practice</h3>
                    {practices.map((p) => <BarRow key={p} label={titleCase(p)} value={data[p]?.total || 0} max={maxPractice} color={p === 'dental' ? 'bg-dental-500' : 'bg-ayur-500'} />)}
                  </div>
                )}
                {practices.map((p) => {
                  const max = Math.max(...APPOINTMENT_STATUSES.map((s) => data[p]?.[s] || 0), 1);
                  return (
                    <div key={p} className="space-y-2.5">
                      <h3 className="text-xs font-semibold tracking-wide text-ink-500 uppercase">{titleCase(p)} by status</h3>
                      {APPOINTMENT_STATUSES.map((s) => <BarRow key={s} label={titleCase(s)} value={data[p]?.[s] || 0} max={max} color={STATUS_COLOR[s]} />)}
                    </div>
                  );
                })}
              </div>
            )}
          </Block>
        </Card>

        {store && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard label="Orders" value={formatNumber(orders.data?.total)} icon={ShoppingBag} tone="blue" loading={orders.loading} />
              <StatCard label="Revenue" value={formatCurrency(orders.data?.revenue)} icon={IndianRupee} tone="green" loading={orders.loading} hint="Confirmed, processing, shipped, delivered" />
            </div>
            <Card title="Orders by status">
              <Block q={orders}>
                {(data) => {
                  const max = Math.max(...ORDER_STATUSES.map((s) => data.byStatus[s]), 1);
                  return <div className="space-y-2.5">{ORDER_STATUSES.map((s) => <BarRow key={s} label={titleCase(s)} value={data.byStatus[s]} max={max} color={STATUS_COLOR[s] || 'bg-gold-500'} />)}</div>;
                }}
              </Block>
            </Card>
          </div>
        )}
      </div>

      {store && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card title="Top products" description="By revenue from confirmed orders" padded={false}>
            <Block q={top}>
              {(data) => !data.rows.length ? <p className="p-5 text-sm text-ink-500">No sales in this period.</p> : (
                <>
                  <div className="overflow-x-auto"><table className="w-full text-left text-sm">
                    <thead className="border-b border-ink-200 bg-ink-50 text-xs font-semibold tracking-wide text-ink-600 uppercase"><tr><th className="px-4 py-2.5">Product</th><th className="px-4 py-2.5 text-right">Units</th><th className="px-4 py-2.5 text-right">Revenue</th></tr></thead>
                    <tbody className="divide-y divide-ink-100">{data.rows.map((r) => <tr key={r.productId}><td className="px-4 py-2.5 font-medium text-ink-900">{r.name}</td><td className="px-4 py-2.5 text-right tabular-nums">{r.quantity}</td><td className="px-4 py-2.5 text-right tabular-nums">{formatCurrency(r.revenue)}</td></tr>)}</tbody>
                  </table></div>
                  {data.capped && <p className="border-t border-ink-100 px-4 py-2.5 text-xs text-ink-500">Based on the latest {data.ordersConsidered} orders in this period.</p>}
                </>
              )}
            </Block>
          </Card>

          <Card title="Low-stock products" description={`At or below ${threshold} units`} padded={false}>
            <Block q={low}>
              {(rows) => !rows.length ? <p className="p-5 text-sm text-ink-500">No low-stock products.</p> : (
                <ul className="divide-y divide-ink-100">{rows.map((p) => <li key={p.id} className="flex items-center justify-between px-4 py-2.5 text-sm"><span className="font-medium text-ink-900">{p.name}</span><span className={`font-semibold tabular-nums ${p.stockQuantity === 0 ? 'text-danger-600' : 'text-gold-600'}`}>{p.stockQuantity === 0 ? 'Out of stock' : `${p.stockQuantity} left`}</span></li>)}</ul>
              )}
            </Block>
          </Card>
        </div>
      )}
    </>
  );
}
