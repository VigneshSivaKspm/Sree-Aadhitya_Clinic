import { useMemo, useState } from 'react';
import { orderBy } from 'firebase/firestore';
import { Eye, Inbox } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { usePagedQuery } from '../hooks/usePagedQuery';
import { enquiryService, scopeConstraint } from '../services/crud';
import Button, { IconButton } from '../components/ui/Button';
import { Card, DetailRow, PageHeader } from '../components/ui/DataDisplay';
import DataTable, { LoadMore } from '../components/ui/DataTable';
import { FilterBar, FilterSelect, SearchInput } from '../components/ui/Filters';
import Modal from '../components/ui/Modal';
import { PracticeBadge, StatusBadge } from '../components/ui/Badges';
import { EmptyState } from '../components/ui/States';
import { formatPhone, formatTimestamp, truncateText } from '../utils/format';
import { getErrorMessage, logError } from '../utils/errors';

export default function EnquiriesPage() {
  const { practiceScope, user } = useAuth();
  const toast = useToast();
  const list = usePagedQuery('enquiries', [...scopeConstraint(practiceScope), orderBy('createdAt', 'desc')], [practiceScope]);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(false);
  const selected = list.items.find((e) => e.id === selectedId);

  const rows = useMemo(() => {
    const s = filters.search.trim().toLowerCase();
    return list.items.filter((e) => (!filters.status || e.status === filters.status) && (!s || `${e.name} ${e.phone} ${e.message}`.toLowerCase().includes(s)));
  }, [list.items, filters]);

  const setStatus = async (status) => {
    setBusy(true);
    try {
      await enquiryService.update(selected.id, { status }, user);
      list.patchItem(selected.id, { status });
      toast.success(status === 'handled' ? 'Marked as handled.' : 'Marked as new.');
    } catch (err) {
      logError('enquiry-status', err);
      toast.error(getErrorMessage(err, 'Could not update the enquiry.'));
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'date', header: 'Received', render: (e) => <span className="whitespace-nowrap">{formatTimestamp(e.createdAt)}</span> },
    { key: 'name', header: 'Name', render: (e) => <span className="font-medium text-ink-900">{e.name}</span> },
    { key: 'phone', header: 'Phone', render: (e) => formatPhone(e.phone) },
    { key: 'about', header: 'About', render: (e) => <PracticeBadge practice={e.practiceType} /> },
    { key: 'message', header: 'Message', render: (e) => <span className="line-clamp-1 max-w-xs text-ink-600">{truncateText(e.message, 80)}</span> },
    { key: 'status', header: 'Status', render: (e) => <StatusBadge status={e.status} /> },
    { key: 'actions', header: <span className="sr-only">Actions</span>, className: 'text-right', render: (e) => <IconButton label={`View enquiry from ${e.name}`} onClick={(ev) => { ev.stopPropagation(); setSelectedId(e.id); }}><Eye className="size-4" /></IconButton> },
  ];

  return (
    <>
      <PageHeader title="Enquiries" description="Messages sent from the website contact form." />
      <Card padded={false}>
        <FilterBar active={!!(filters.search || filters.status)} onClear={() => setFilters({ search: '', status: '' })}>
          <SearchInput className="w-full sm:w-64" value={filters.search} onChange={(val) => setFilters((f) => ({ ...f, search: val }))} placeholder="Name, phone or message" label="Search enquiries" />
          <FilterSelect label="Statuses" value={filters.status} onChange={(val) => setFilters((f) => ({ ...f, status: val }))} options={[{ value: 'new', label: 'New' }, { value: 'handled', label: 'Handled' }]} />
        </FilterBar>
        <DataTable caption="Enquiries" columns={columns} rows={rows} loading={list.loading} error={list.error} onRetry={list.reload} onRowClick={(e) => setSelectedId(e.id)}
          empty={<EmptyState icon={Inbox} title={list.items.length ? 'No enquiries match your filters' : 'No enquiries yet'} message={list.items.length ? undefined : 'Messages from the contact form will appear here.'} />} />
        {!list.loading && !list.error && <LoadMore shown={rows.length} hasMore={list.hasMore} loading={list.loadingMore} onLoadMore={list.loadMore} noun="enquiries" />}
      </Card>

      {selected && (
        <Modal open onClose={() => setSelectedId(null)} title={`Enquiry from ${selected.name}`} description={`Received ${formatTimestamp(selected.createdAt)}`}
          footer={<><Button variant="secondary" onClick={() => setSelectedId(null)}>Close</Button>{selected.status === 'new' ? <Button loading={busy} onClick={() => setStatus('handled')}>Mark as handled</Button> : <Button variant="secondary" loading={busy} onClick={() => setStatus('new')}>Mark as new</Button>}</>}>
          <dl className="divide-y divide-ink-100">
            <DetailRow label="Status"><StatusBadge status={selected.status} /></DetailRow>
            <DetailRow label="About"><PracticeBadge practice={selected.practiceType} /></DetailRow>
            <DetailRow label="Phone"><a className="text-dental-700 hover:underline" href={`tel:+91${selected.phone}`}>{formatPhone(selected.phone)}</a></DetailRow>
            <DetailRow label="Email">{selected.email && <a className="text-dental-700 hover:underline" href={`mailto:${selected.email}`}>{selected.email}</a>}</DetailRow>
            <DetailRow label="Message"><span className="whitespace-pre-line">{selected.message}</span></DetailRow>
          </dl>
        </Modal>
      )}
    </>
  );
}
