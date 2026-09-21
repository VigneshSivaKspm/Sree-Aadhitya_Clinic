import { useMemo, useState } from 'react';
import { Boxes, Settings2 } from 'lucide-react';
import { orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { DEFAULT_SETTINGS } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { usePagedQuery } from '../hooks/usePagedQuery';
import { getSettings } from '../services/contentService';
import { listStockMovements, setStock } from '../services/stockService';
import Button, { IconButton } from '../components/ui/Button';
import { Card, PageHeader } from '../components/ui/DataDisplay';
import DataTable, { LoadMore } from '../components/ui/DataTable';
import { FilterBar, FilterSelect, SearchInput } from '../components/ui/Filters';
import { TextField } from '../components/ui/FormField';
import Modal from '../components/ui/Modal';
import { Badge } from '../components/ui/Badges';
import { EmptyState } from '../components/ui/States';
import { formatTimestamp } from '../utils/format';
import { getErrorMessage, logError } from '../utils/errors';
import { v } from '../utils/validators';
import { StockBadge } from './ProductsPage';

const CONSTRAINTS = [orderBy('stockQuantity', 'asc')];

function AdjustStock({ product, onClose, onSaved }) {
  const { user } = useAuth();
  const toast = useToast();
  const [qty, setQty] = useState(String(product.stockQuantity ?? 0));
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState(false);
  const history = useAsync(() => listStockMovements(product.id, 10), [product.id]);
  const error = v.stock(qty, 'Stock quantity');

  const save = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (error || busy) return;
    setBusy(true);
    try {
      const { next } = await setStock(product.id, Number(qty), reason.trim(), user);
      toast.success('Stock updated.');
      onSaved(next);
    } catch (err) {
      logError('stock', err);
      toast.error(getErrorMessage(err, 'Could not update stock.'));
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={busy ? () => {} : onClose} dismissible={!busy} title="Adjust stock" description={`${product.name}${product.sku ? ` · ${product.sku}` : ''}`}
      footer={<><Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button><Button type="submit" form="stock-form" loading={busy}>Save stock</Button></>}>
      <form id="stock-form" onSubmit={save} noValidate className="space-y-4">
        <p className="text-sm text-ink-600">Current stock: <strong className="text-ink-900">{product.stockQuantity ?? 0}</strong></p>
        <TextField label="New stock quantity" required type="number" min="0" step="1" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} error={touched ? error : ''} data-autofocus />
        <TextField label="Reason (optional)" placeholder="e.g. New batch received" maxLength={120} value={reason} onChange={(e) => setReason(e.target.value)} />
      </form>
      <h3 className="mt-6 mb-2 text-sm font-semibold text-ink-900">Recent movements</h3>
      {history.loading ? <p className="text-sm text-ink-500">Loading…</p> : history.error ? <p className="text-sm text-danger-600">{history.error}</p>
        : !history.data?.length ? <p className="text-sm text-ink-500">No stock movements recorded yet.</p>
        : (
          <ul className="divide-y divide-ink-100 rounded-lg border border-ink-100 text-sm">
            {history.data.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <div><p className="text-ink-800">{m.reason}</p><p className="text-xs text-ink-500">{formatTimestamp(m.at)}</p></div>
                <span className={`font-semibold tabular-nums ${m.delta < 0 ? 'text-danger-600' : 'text-ayur-700'}`}>{m.delta > 0 ? '+' : ''}{m.delta} <span className="font-normal text-ink-400">→ {m.next}</span></span>
              </li>
            ))}
          </ul>
        )}
    </Modal>
  );
}

export default function InventoryPage() {
  const list = usePagedQuery('products', CONSTRAINTS, [], { pageSize: 40 });
  const settings = useAsync(getSettings, []);
  const threshold = settings.data?.lowStockThreshold ?? DEFAULT_SETTINGS.lowStockThreshold;
  const [filters, setFilters] = useState({ search: '', state: '' });
  const [adjusting, setAdjusting] = useState(null);

  const rows = useMemo(() => {
    const s = filters.search.trim().toLowerCase();
    return list.items.filter((p) => {
      const qty = Number(p.stockQuantity) || 0;
      if (filters.state === 'out' && qty > 0) return false;
      if (filters.state === 'low' && !(qty > 0 && qty <= threshold)) return false;
      if (filters.state === 'ok' && qty <= threshold) return false;
      return !s || `${p.name} ${p.sku || ''}`.toLowerCase().includes(s);
    });
  }, [list.items, filters, threshold]);

  const columns = [
    { key: 'product', header: 'Product', render: (p) => <Link to={`/products/${p.id}`} className="font-medium text-ink-900 hover:underline">{p.name}</Link> },
    { key: 'sku', header: 'SKU', render: (p) => <span className="font-mono text-xs">{p.sku || '—'}</span> },
    { key: 'stock', header: 'Current stock', className: 'tabular-nums font-medium', render: (p) => p.stockQuantity ?? 0 },
    { key: 'state', header: 'Availability', render: (p) => <StockBadge product={p} threshold={threshold} /> },
    { key: 'listed', header: 'Listing', render: (p) => <Badge tone={p.active ? 'green' : 'neutral'}>{p.active ? 'Active' : 'Hidden'}</Badge> },
    { key: 'actions', header: <span className="sr-only">Actions</span>, className: 'text-right', render: (p) => <Button size="sm" variant="secondary" onClick={() => setAdjusting(p)} aria-label={`Adjust stock for ${p.name}`}><Settings2 className="size-4" aria-hidden="true" /> Adjust</Button> },
  ];

  return (
    <>
      <PageHeader title="Inventory" description={`Products at or below ${threshold} units are flagged as low stock. Change the threshold in Settings.`} />
      <Card padded={false}>
        <FilterBar active={Object.values(filters).some(Boolean)} onClear={() => setFilters({ search: '', state: '' })}>
          <SearchInput className="w-full sm:w-64" value={filters.search} onChange={(val) => setFilters((f) => ({ ...f, search: val }))} placeholder="Name or SKU" label="Search inventory" />
          <FilterSelect label="Availability" allLabel="Any" value={filters.state} onChange={(val) => setFilters((f) => ({ ...f, state: val }))} options={[{ value: 'out', label: 'Out of stock' }, { value: 'low', label: 'Low stock' }, { value: 'ok', label: 'Healthy stock' }]} />
        </FilterBar>
        <DataTable caption="Inventory" columns={columns} rows={rows} loading={list.loading} error={list.error} onRetry={list.reload}
          empty={<EmptyState icon={Boxes} title={list.items.length ? 'No products match your filters' : 'No products yet'} message={list.items.length ? undefined : 'Add products to track their stock.'} />} />
        {!list.loading && !list.error && <LoadMore shown={rows.length} hasMore={list.hasMore} loading={list.loadingMore} onLoadMore={list.loadMore} noun="products" />}
      </Card>
      {adjusting && <AdjustStock product={adjusting} onClose={() => setAdjusting(null)} onSaved={(next) => { list.patchItem(adjusting.id, { stockQuantity: next, inStock: next > 0 }); setAdjusting(null); }} />}
    </>
  );
}
