import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, ShoppingBag } from 'lucide-react';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../config/constants';
import { usePagedQuery } from '../hooks/usePagedQuery';
import { orderConstraints } from '../services/orderService';
import { IconButton } from '../components/ui/Button';
import { Card, PageHeader } from '../components/ui/DataDisplay';
import DataTable, { LoadMore } from '../components/ui/DataTable';
import { FilterBar, FilterSelect, SearchInput } from '../components/ui/Filters';
import { StatusBadge } from '../components/ui/Badges';
import { EmptyState } from '../components/ui/States';
import { formatCurrency, formatPhone, formatTimestamp, titleCase } from '../utils/format';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ search: '', status: '', payment: '' });
  const list = usePagedQuery('orders', orderConstraints({ status: filters.status }), [filters.status]);
  const set = (k) => (val) => setFilters((f) => ({ ...f, [k]: val }));

  const rows = useMemo(() => {
    const s = filters.search.trim().toLowerCase();
    return list.items.filter((o) => (!filters.payment || o.paymentStatus === filters.payment)
      && (!s || `${o.orderNumber} ${o.customer?.name} ${o.customer?.phone}`.toLowerCase().includes(s)));
  }, [list.items, filters]);

  const columns = [
    { key: 'no', header: 'Order', render: (o) => <Link to={`/orders/${o.id}`} onClick={(e) => e.stopPropagation()} className="font-mono text-xs font-semibold text-dental-700 hover:underline">{o.orderNumber}</Link> },
    { key: 'customer', header: 'Customer', render: (o) => <span className="font-medium text-ink-900">{o.customer?.name}</span> },
    { key: 'phone', header: 'Phone', render: (o) => formatPhone(o.customer?.phone) },
    { key: 'date', header: 'Date', render: (o) => <span className="whitespace-nowrap">{formatTimestamp(o.createdAt)}</span> },
    { key: 'items', header: 'Items', className: 'tabular-nums', render: (o) => o.itemCount ?? o.items?.length },
    { key: 'total', header: 'Total', className: 'tabular-nums font-medium', render: (o) => formatCurrency(o.total) },
    { key: 'payment', header: 'Payment', render: (o) => <StatusBadge status={o.paymentStatus} /> },
    { key: 'status', header: 'Status', render: (o) => <StatusBadge status={o.orderStatus} /> },
    { key: 'actions', header: <span className="sr-only">Actions</span>, className: 'text-right', render: (o) => <IconButton label={`View order ${o.orderNumber}`} onClick={(e) => { e.stopPropagation(); navigate(`/orders/${o.id}`); }}><Eye className="size-4" /></IconButton> },
  ];

  return (
    <>
      <PageHeader title="Orders" description="Store orders placed on the website. Review and confirm them to reserve stock." />
      <Card padded={false}>
        <FilterBar active={Object.values(filters).some(Boolean)} onClear={() => setFilters({ search: '', status: '', payment: '' })}>
          <SearchInput className="w-full sm:w-64" value={filters.search} onChange={set('search')} placeholder="Order no., name or phone" label="Search orders" />
          <FilterSelect label="Order statuses" value={filters.status} onChange={set('status')} options={ORDER_STATUSES.map((s) => ({ value: s, label: titleCase(s) }))} />
          <FilterSelect label="Payment statuses" value={filters.payment} onChange={set('payment')} options={PAYMENT_STATUSES.map((s) => ({ value: s, label: titleCase(s) }))} />
        </FilterBar>
        <DataTable caption="Orders" columns={columns} rows={rows} loading={list.loading} error={list.error} onRetry={list.reload} onRowClick={(o) => navigate(`/orders/${o.id}`)}
          empty={<EmptyState icon={ShoppingBag} title={list.items.length ? 'No orders match your filters' : 'No orders yet'} message={list.items.length ? 'Try clearing a filter or load more orders.' : 'Orders placed on the website will appear here.'} />} />
        {!list.loading && !list.error && <LoadMore shown={rows.length} hasMore={list.hasMore} loading={list.loadingMore} onLoadMore={list.loadMore} noun="orders" />}
      </Card>
    </>
  );
}
