import { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Copy } from 'lucide-react';
import { CallButton, WhatsAppButton } from '../components/common/ContactActions';
import OrderStatus from '../components/shop/OrderStatus';
import Button from '../components/ui/Button';
import Seo from '../components/ui/Seo';
import { ErrorState, PageSkeleton } from '../components/ui/States';
import { useSite } from '../contexts/SiteContext';
import { useAsync } from '../hooks/useAsync';
import { getOrderTracking } from '../services/orderService';
import { formatCurrency } from '../utils/format';

export default function OrderSuccessPage() {
  const { state } = useLocation();
  const [params] = useSearchParams();
  const code = params.get('code') || state?.order?.id || '';
  const order = state?.order?.id === code ? state.order : null;
  const { settings } = useSite();
  const [copied, setCopied] = useState(false);

  // Fallback after a refresh: read the public status record.
  const q = useAsync(() => getOrderTracking(code), [code], { enabled: !order && !!code });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  if (!code) {
    return (
      <div className="container-page py-20 text-center">
        <p className="mb-4 text-ink-600">No order to show.</p>
        <Button to="/shop" tone="ayurveda">Go to the shop</Button>
      </div>
    );
  }
  if (!order && q.loading) return <PageSkeleton />;
  if (!order && q.error) return <div className="container-page py-16"><ErrorState message={q.error} onRetry={q.reload} /></div>;

  const paymentLabel = settings.paymentMethods.find((m) => m.key === order?.paymentMethod)?.label;

  return (
    <>
      <Seo title="Order received" path="/order-success" noindex />
      <div className="container-page py-14">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-ayur-100 text-ayur-700"><CheckCircle2 className="size-8" aria-hidden="true" /></span>
            <h1 className="text-3xl font-semibold sm:text-4xl">Order received</h1>
            <p className="mx-auto mt-3 max-w-md text-ink-600">Thank you. We have received your order and it is <strong>awaiting confirmation</strong>. Our team will contact you to confirm it and arrange payment and delivery.</p>
          </div>

          <div className="mt-8 rounded-xl border border-ink-100 bg-white p-6 text-center">
            <p className="text-sm text-ink-500">Your order number</p>
            <p className="mt-1 font-mono text-2xl font-semibold tracking-wide text-ink-900">{code}</p>
            <button type="button" onClick={copy} className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-ayur-700 hover:underline">
              <Copy className="size-4" aria-hidden="true" /> {copied ? 'Copied' : 'Copy order number'}
            </button>
            <p className="mt-3 text-xs text-ink-500">Keep this number safe — you can use it to <Link to="/orders" className="underline">track your order</Link>.</p>
          </div>

          <div className="mt-6">
            {order ? (
              <div className="rounded-xl border border-ink-100 bg-white p-6">
                <h2 className="font-sans text-lg font-semibold">Summary</h2>
                <ul className="mt-3 divide-y divide-ink-100 text-sm">
                  {order.items.map((i) => (
                    <li key={i.productId} className="flex justify-between py-2.5"><span>{i.name} <span className="text-ink-500">× {i.quantity}</span></span><span className="tabular-nums">{formatCurrency(i.total)}</span></li>
                  ))}
                </ul>
                <dl className="mt-3 space-y-1.5 border-t border-ink-100 pt-3 text-sm">
                  <div className="flex justify-between"><dt className="text-ink-600">Subtotal</dt><dd className="tabular-nums">{formatCurrency(order.subtotal)}</dd></div>
                  <div className="flex justify-between"><dt className="text-ink-600">Shipping</dt><dd className="tabular-nums">{order.shippingFee ? formatCurrency(order.shippingFee) : 'Free'}</dd></div>
                  <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatCurrency(order.total)}</dd></div>
                  {paymentLabel && <div className="flex justify-between pt-2"><dt className="text-ink-600">Payment</dt><dd>{paymentLabel} (pending)</dd></div>}
                </dl>
              </div>
            ) : (
              q.data ? <OrderStatus tracking={q.data} /> : <ErrorState message="We couldn’t find that order." />
            )}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <CallButton practice="ayurveda" />
            <WhatsAppButton practice="ayurveda" message={`Hello, my order number is ${code}. I have a question about my order.`} />
            <Button to="/shop" variant="ghost" tone="ayurveda">Continue shopping</Button>
          </div>
        </div>
      </div>
    </>
  );
}
