import { useState } from 'react';
import { PackageSearch, Search } from 'lucide-react';
import OrderStatus from '../components/shop/OrderStatus';
import Button from '../components/ui/Button';
import { TextField } from '../components/ui/FormField';
import { PageHero } from '../components/ui/Section';
import Seo from '../components/ui/Seo';
import { EmptyState } from '../components/ui/States';
import { getOrderTracking } from '../services/orderService';
import { formatCurrency, formatTimestamp } from '../utils/format';
import { getErrorMessage, logError } from '../utils/errors';
import { getSavedOrders } from '../utils/storage';

export default function OrdersPage() {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [saved] = useState(getSavedOrders);

  const lookup = async (value) => {
    if (busy) return;
    const c = value.trim().toUpperCase();
    setError('');
    setResult(null);
    if (!/^AAH-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(c)) {
      setError('Enter your order number in the format AAH-XXXX-XXXX-XXXX.');
      return;
    }
    setBusy(true);
    try {
      const tracking = await getOrderTracking(c);
      tracking ? setResult(tracking) : setError('We couldn’t find an order with that number. Please check it and try again.');
    } catch (err) {
      logError('order-lookup', err);
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Seo title="Track your order" path="/orders" noindex />
      <PageHero tone="ayurveda" eyebrow="Shop" title="Track your order" description="Enter the order number you received after placing your order." />
      <div className="container-page py-10">
        <div className="mx-auto max-w-2xl space-y-8">
          <form onSubmit={(e) => { e.preventDefault(); lookup(code); }} noValidate className="rounded-xl border border-ink-100 bg-white p-6">
            <TextField label="Order number" tone="ayurveda" value={code} onChange={(e) => setCode(e.target.value)} placeholder="AAH-XXXX-XXXX-XXXX" autoCapitalize="characters" spellCheck={false} error={error} />
            <Button type="submit" tone="ayurveda" loading={busy} className="mt-4"><Search className="size-4" aria-hidden="true" /> Find order</Button>
          </form>

          {result && <OrderStatus tracking={result} />}

          <section aria-labelledby="saved-heading">
            <h2 id="saved-heading" className="mb-4 font-sans text-lg font-semibold">Orders placed on this device</h2>
            {saved.length === 0 ? (
              <EmptyState icon={PackageSearch} title="No orders yet" message="Orders you place on this device will appear here." action={<Button to="/shop" tone="ayurveda">Browse the shop</Button>} />
            ) : (
              <ul className="divide-y divide-ink-100 rounded-xl border border-ink-100 bg-white">
                {saved.map((o) => (
                  <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-mono text-sm font-semibold">{o.id}</p>
                      <p className="text-sm text-ink-600">{o.itemCount} item{o.itemCount === 1 ? '' : 's'} · {formatCurrency(o.total)} · {formatTimestamp(o.createdAt)}</p>
                    </div>
                    <Button size="sm" variant="outline" tone="ayurveda" onClick={() => { setCode(o.id); lookup(o.id); }}>View status</Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
