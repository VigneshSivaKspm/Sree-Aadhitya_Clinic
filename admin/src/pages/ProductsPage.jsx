import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ExternalLink, Package, Pencil, Plus, Power, Trash2 } from 'lucide-react';
import { DEFAULT_SETTINGS, WEB_URL } from '../config/constants';
import { useToast } from '../contexts/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { usePagedQuery } from '../hooks/usePagedQuery';
import { orderBy } from 'firebase/firestore';
import { categoryService, productCrud } from '../services/crud';
import { getSettings } from '../services/contentService';
import { deleteImages } from '../services/storageService';
import Button, { IconButton } from '../components/ui/Button';
import { Card, PageHeader } from '../components/ui/DataDisplay';
import DataTable, { LoadMore } from '../components/ui/DataTable';
import { FilterBar, FilterSelect, SearchInput } from '../components/ui/Filters';
import { ConfirmDialog } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badges';
import { EmptyState } from '../components/ui/States';
import { formatCurrency } from '../utils/format';
import { getErrorMessage, logError } from '../utils/errors';
import { useAuth } from '../contexts/AuthContext';

const CONSTRAINTS = [orderBy('createdAt', 'desc')];

export function StockBadge({ product, threshold }) {
  const qty = Number(product.stockQuantity) || 0;
  if (qty <= 0) return <Badge tone="red">Out of stock</Badge>;
  if (qty <= threshold) return <Badge tone="amber">Low · {qty}</Badge>;
  return <Badge tone="green">{qty} in stock</Badge>;
}

export default function ProductsPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const list = usePagedQuery('products', CONSTRAINTS, []);
  const categories = useAsync(() => categoryService.list(), []);
  const settings = useAsync(getSettings, []);
  const threshold = settings.data?.lowStockThreshold ?? DEFAULT_SETTINGS.lowStockThreshold;

  const [filters, setFilters] = useState({ search: '', category: '', status: '' });
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (val) => setFilters((f) => ({ ...f, [k]: val }));
  const catName = (id) => categories.data?.find((c) => c.id === id)?.name || '—';

  const rows = useMemo(() => {
    const s = filters.search.trim().toLowerCase();
    return list.items.filter((p) => (!filters.category || p.categoryId === filters.category)
      && (!filters.status || (filters.status === 'active') === !!p.active)
      && (!s || `${p.name} ${p.sku || ''} ${p.slug}`.toLowerCase().includes(s)));
  }, [list.items, filters]);

  const toggleActive = async (p) => {
    try {
      await productCrud.update(p.id, { active: !p.active }, user);
      list.patchItem(p.id, { active: !p.active });
      toast.success(p.active ? 'Product hidden from the shop.' : 'Product is now visible in the shop.');
    } catch (err) {
      logError('product-toggle', err);
      toast.error(getErrorMessage(err, 'Could not update the product.'));
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await productCrud.remove(deleting.id);
      await deleteImages(deleting.images);
      list.removeItem(deleting.id);
      toast.success('Product deleted.');
      setDeleting(null);
    } catch (err) {
      logError('product-delete', err);
      toast.error(getErrorMessage(err, 'Could not delete the product.'));
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'product', header: 'Product', render: (p) => (
      <div className="flex items-center gap-3">
        {p.images?.[0] ? <img src={p.images[0]} alt="" className="size-11 rounded-md object-cover" /> : <span className="flex size-11 items-center justify-center rounded-md bg-ink-100 text-ink-500"><Package className="size-5" aria-hidden="true" /></span>}
        <div className="min-w-0"><Link to={`/products/${p.id}`} className="font-medium text-ink-900 hover:underline">{p.name}</Link><p className="font-mono text-xs text-ink-500">{p.sku || 'No SKU'}</p></div>
      </div>) },
    { key: 'category', header: 'Category', render: (p) => catName(p.categoryId) },
    { key: 'price', header: 'Price', render: (p) => <div className="tabular-nums"><span className="font-medium">{formatCurrency(p.price)}</span>{p.compareAtPrice > p.price && <s className="ml-1.5 text-xs text-ink-400">{formatCurrency(p.compareAtPrice)}</s>}</div> },
    { key: 'stock', header: 'Stock', render: (p) => <StockBadge product={p} threshold={threshold} /> },
    { key: 'status', header: 'Status', render: (p) => <div className="flex gap-1.5"><Badge tone={p.active ? 'green' : 'neutral'}>{p.active ? 'Active' : 'Hidden'}</Badge>{p.featured && <Badge tone="amber">Featured</Badge>}</div> },
    { key: 'actions', header: <span className="sr-only">Actions</span>, className: 'text-right whitespace-nowrap', render: (p) => (
      <>
        {WEB_URL && <a href={`${WEB_URL}/shop/product/${p.slug}`} target="_blank" rel="noopener noreferrer" aria-label={`View ${p.name} on the website`} title="View on website" className="inline-flex size-8 items-center justify-center rounded-md text-ink-600 hover:bg-ink-100"><ExternalLink className="size-4" /></a>}
        <IconButton label={p.active ? `Hide ${p.name}` : `Show ${p.name}`} onClick={() => toggleActive(p)}><Power className="size-4" /></IconButton>
        <IconButton label={`Edit ${p.name}`} onClick={() => navigate(`/products/${p.id}`)}><Pencil className="size-4" /></IconButton>
        <IconButton label={`Delete ${p.name}`} variant="danger" onClick={() => setDeleting(p)}><Trash2 className="size-4" /></IconButton>
      </>) },
  ];

  return (
    <>
      <PageHeader title="Products" description="Manage the Ayurvedic store catalogue." actions={<Button to="/products/new"><Plus className="size-4" aria-hidden="true" /> Add product</Button>} />
      <Card padded={false}>
        <FilterBar active={Object.values(filters).some(Boolean)} onClear={() => setFilters({ search: '', category: '', status: '' })}>
          <SearchInput className="w-full sm:w-64" value={filters.search} onChange={set('search')} placeholder="Name, SKU or slug" label="Search products" />
          <FilterSelect label="Categories" value={filters.category} onChange={set('category')} options={(categories.data || []).map((c) => ({ value: c.id, label: c.name }))} />
          <FilterSelect label="Statuses" value={filters.status} onChange={set('status')} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Hidden' }]} />
        </FilterBar>
        <DataTable caption="Products" columns={columns} rows={rows} loading={list.loading} error={list.error} onRetry={list.reload}
          empty={<EmptyState icon={Package} title={list.items.length ? 'No products match your filters' : 'No products yet'} message={list.items.length ? 'Try clearing a filter or load more products.' : 'Add your first product to start selling.'} action={!list.items.length && <Button to="/products/new">Add product</Button>} />} />
        {!list.loading && !list.error && <LoadMore shown={rows.length} hasMore={list.hasMore} loading={list.loadingMore} onLoadMore={list.loadMore} noun="products" />}
      </Card>
      <ConfirmDialog open={!!deleting} danger busy={busy} title="Delete product?" confirmLabel="Delete" onCancel={() => setDeleting(null)} onConfirm={remove}
        message={`This will permanently remove “${deleting?.name || 'this product'}” and its images. Past orders keep their own copy of the product name and price. To stop selling it without deleting, hide it instead.`} />
    </>
  );
}
