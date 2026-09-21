import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';
import { ORDER_TRANSITIONS, PAYMENT_METHOD_LABELS, PAYMENT_STATUSES } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { changeOrderStatus, changePaymentStatus, getOrder, saveShippingInfo } from '../services/orderService';
import Button from '../components/ui/Button';
import { Card, DetailRow, PageHeader } from '../components/ui/DataDisplay';
import { SelectField, TextField } from '../components/ui/FormField';
import { ConfirmDialog } from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/Badges';
import { ErrorState, PageSkeleton } from '../components/ui/States';
import { formatCurrency, formatPhone, formatTimestamp, titleCase } from '../utils/format';
import { getErrorMessage, logError } from '../utils/errors';
import { v } from '../utils/validators';

const ACTION = { confirmed: 'Confirm order', processing: 'Mark as processing', shipped: 'Mark as shipped', delivered: 'Mark as delivered', cancelled: 'Cancel order' };
const STOCK_NOTE = {
  confirmed: 'Confirming reserves stock: the ordered quantities are deducted from inventory now. The action fails if any product is short.',
  cancelled: 'If stock was already deducted for this order it will be returned to inventory.',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const q = useAsync(() => getOrder(id), [id]);
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const [payment, setPayment] = useState(null);
  const [ship, setShip] = useState(null);
  const [shipErrors, setShipErrors] = useState({});

  if (q.loading && !q.data) return <PageSkeleton />;
  if (q.error) return <ErrorState message={q.error} onRetry={q.reload} />;
  const order = q.data;
  if (!order) return <ErrorState message="This order could not be found." />;

  const options = ORDER_TRANSITIONS[order.orderStatus] || [];
  const paymentValue = payment ?? order.paymentStatus;
  const shipValue = ship ?? { carrier: order.shipping?.carrier || '', trackingNumber: order.shipping?.trackingNumber || '', note: order.shipping?.note || '' };
  const a = order.deliveryAddress || {};

  const run = async (label, fn) => {
    setBusy(true);
    try {
      await fn();
      toast.success(label);
      await q.reload();
    } catch (err) {
      logError('order-update', err);
      toast.error(getErrorMessage(err, 'Could not update the order.'));
    } finally {
      setBusy(false);
    }
  };

  const confirmStatus = async () => {
    const next = pending;
    setPending(null);
    await run(`Order marked ${next}.`, () => changeOrderStatus(order.id, next, user));
  };

  const savePayment = () => run('Payment status updated.', () => changePaymentStatus(order.id, paymentValue, user)).then(() => setPayment(null));

  const saveShipping = () => {
    const e = { carrier: v.text(shipValue.carrier, { label: 'Carrier', max: 80 }), trackingNumber: v.text(shipValue.trackingNumber, { label: 'Tracking number', max: 80 }), note: v.text(shipValue.note, { label: 'Note', max: 300 }) };
    setShipErrors(e);
    if (Object.values(e).some(Boolean)) return;
    return run('Shipping details saved.', () => saveShippingInfo(order.id, shipValue, user)).then(() => setShip(null));
  };

  return (
    <>
      <PageHeader
        back={<Link to="/orders" className="mb-2 inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900"><ArrowLeft className="size-4" aria-hidden="true" /> Orders</Link>}
        title={<span className="font-mono">{order.orderNumber}</span>}
        description={`Placed ${formatTimestamp(order.createdAt)}`}
        actions={<><StatusBadge status={order.orderStatus} /><StatusBadge status={order.paymentStatus} /></>}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card title="Items" padded={false}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="border-b border-ink-200 bg-ink-50 text-xs font-semibold tracking-wide text-ink-600 uppercase">
                  <tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">SKU</th><th className="px-4 py-3 text-right">Qty</th><th className="px-4 py-3 text-right">Unit price</th><th className="px-4 py-3 text-right">Total</th></tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {order.items.map((i, idx) => (
                    <tr key={`${i.productId}-${idx}`}>
                      <td className="px-4 py-3 font-medium text-ink-900">{i.name}</td>
                      <td className="px-4 py-3 font-mono text-xs">{i.sku || '—'}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{i.quantity}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(i.unitPrice)}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">{formatCurrency(i.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="ml-auto max-w-xs space-y-1.5 border-t border-ink-100 px-4 py-4 text-sm">
              <div className="flex justify-between"><dt className="text-ink-600">Subtotal</dt><dd className="tabular-nums">{formatCurrency(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-600">Shipping</dt><dd className="tabular-nums">{order.shippingFee ? formatCurrency(order.shippingFee) : 'Free'}</dd></div>
              <div className="flex justify-between border-t border-ink-100 pt-2 text-base font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatCurrency(order.total)}</dd></div>
            </dl>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card title="Customer">
              <dl className="divide-y divide-ink-100">
                <DetailRow label="Name">{order.customer?.name}</DetailRow>
                <DetailRow label="Phone"><a className="text-dental-700 hover:underline" href={`tel:+91${order.customer?.phone}`}>{formatPhone(order.customer?.phone)}</a></DetailRow>
                <DetailRow label="Email">{order.customer?.email && <a className="text-dental-700 hover:underline" href={`mailto:${order.customer.email}`}>{order.customer.email}</a>}</DetailRow>
              </dl>
            </Card>
            <Card title="Delivery address">
              <address className="text-sm leading-relaxed text-ink-800 not-italic">
                {a.addressLine}<br />{a.area}{a.landmark ? ` (near ${a.landmark})` : ''}<br />{a.city}, {a.district}<br />{a.state} — {a.postalCode}
              </address>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card title="Order status">
            <div className="flex items-center justify-between"><StatusBadge status={order.orderStatus} /><span className="text-xs text-ink-500">{order.stockDeducted ? 'Stock reserved' : 'Stock not yet reserved'}</span></div>
            {options.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {options.map((s) => <Button key={s} size="sm" variant={s === 'cancelled' ? 'dangerOutline' : s === 'confirmed' ? 'primary' : 'secondary'} onClick={() => setPending(s)} disabled={busy}>{ACTION[s]}</Button>)}
              </div>
            ) : <p className="mt-3 text-sm text-ink-500">This order is {order.orderStatus}; no further status changes are available.</p>}
            <p className="mt-4 flex gap-2 rounded-md bg-ink-50 p-3 text-xs text-ink-600"><Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />Prices on the order were entered by the customer’s browser and re-checked against the catalogue at checkout. Please review totals before confirming.</p>
          </Card>

          <Card title="Payment">
            <DetailRow label="Method">{PAYMENT_METHOD_LABELS[order.paymentMethod] || titleCase(order.paymentMethod)}</DetailRow>
            <div className="mt-3 flex items-end gap-2">
              <SelectField label="Payment status" className="flex-1" value={paymentValue} onChange={(e) => setPayment(e.target.value)}>
                {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
              </SelectField>
              <Button variant="secondary" onClick={savePayment} disabled={busy || paymentValue === order.paymentStatus} loading={busy && paymentValue !== order.paymentStatus}>Update</Button>
            </div>
          </Card>

          <Card title="Shipping information" description="Carrier and tracking number are shown to the customer.">
            <div className="space-y-4">
              <TextField label="Carrier" maxLength={80} value={shipValue.carrier} onChange={(e) => setShip({ ...shipValue, carrier: e.target.value })} error={shipErrors.carrier} />
              <TextField label="Tracking number" maxLength={80} value={shipValue.trackingNumber} onChange={(e) => setShip({ ...shipValue, trackingNumber: e.target.value })} error={shipErrors.trackingNumber} />
              <TextField label="Internal note" maxLength={300} value={shipValue.note} onChange={(e) => setShip({ ...shipValue, note: e.target.value })} error={shipErrors.note} hint="Not shown to the customer." />
              <Button variant="secondary" onClick={saveShipping} disabled={busy || ship === null}>Save shipping details</Button>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog open={!!pending} danger={pending === 'cancelled'} busy={busy} title={pending ? ACTION[pending] : ''} confirmLabel={pending ? ACTION[pending] : ''} cancelLabel="Keep as is"
        message={`Change order ${order.orderNumber} from ${order.orderStatus} to ${pending}?`} onConfirm={confirmStatus} onCancel={() => setPending(null)}>
        {STOCK_NOTE[pending] && <p className="mt-3 text-xs text-ink-600">{STOCK_NOTE[pending]}</p>}
      </ConfirmDialog>
    </>
  );
}
