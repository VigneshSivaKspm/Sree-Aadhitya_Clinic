import { Check, XCircle } from 'lucide-react';
import { formatCurrency, formatTimestamp } from '../../utils/format';

const STEPS = [
  ['pending', 'Order received'],
  ['confirmed', 'Confirmed'],
  ['processing', 'Being prepared'],
  ['shipped', 'Shipped'],
  ['delivered', 'Delivered'],
];

const PAYMENT_LABELS = { pending: 'Payment pending', paid: 'Paid', failed: 'Payment failed', refunded: 'Refunded' };

/** Public order-status card (built from the orderTracking record — no personal details). */
export default function OrderStatus({ tracking }) {
  const cancelled = tracking.orderStatus === 'cancelled';
  const current = STEPS.findIndex(([k]) => k === tracking.orderStatus);

  return (
    <div className="rounded-xl border border-ink-100 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-ink-500 uppercase">Order</p>
          <p className="font-mono text-lg font-semibold text-ink-900">{tracking.orderNumber}</p>
          <p className="mt-1 text-sm text-ink-600">Placed {formatTimestamp(tracking.createdAt)}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">{formatCurrency(tracking.total)}</p>
          <p className="text-sm text-ink-600">{PAYMENT_LABELS[tracking.paymentStatus] || tracking.paymentStatus}</p>
        </div>
      </div>

      {cancelled ? (
        <p className="mt-6 flex items-center gap-2 rounded-md bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700"><XCircle className="size-5" aria-hidden="true" /> This order was cancelled.</p>
      ) : (
        <ol className="mt-6 grid gap-3 sm:grid-cols-5" aria-label="Order progress">
          {STEPS.map(([key, label], i) => {
            const done = i <= current;
            return (
              <li key={key} className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2" aria-current={i === current ? 'step' : undefined}>
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${done ? 'bg-ayur-700 text-white' : 'bg-ink-100 text-ink-500'}`}>
                  {done ? <Check className="size-4" aria-hidden="true" /> : i + 1}
                </span>
                <span className={`text-sm ${done ? 'font-medium text-ink-900' : 'text-ink-500'}`}>{label}</span>
              </li>
            );
          })}
        </ol>
      )}

      {tracking.shipping?.carrier && (
        <p className="mt-4 rounded-md bg-ink-50 px-4 py-3 text-sm text-ink-700">
          Shipped via <strong>{tracking.shipping.carrier}</strong>
          {tracking.shipping.trackingNumber && <> — tracking no. <span className="font-mono">{tracking.shipping.trackingNumber}</span></>}
        </p>
      )}

      {tracking.items?.length > 0 && (
        <ul className="mt-6 divide-y divide-ink-100 border-t border-ink-100 text-sm">
          {tracking.items.map((i, idx) => (
            <li key={idx} className="flex justify-between py-2.5"><span>{i.name}</span><span className="text-ink-500">× {i.quantity}</span></li>
          ))}
        </ul>
      )}
    </div>
  );
}
