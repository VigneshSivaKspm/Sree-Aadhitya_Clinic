import { useMemo, useState } from 'react';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { Users } from 'lucide-react';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { scopeConstraint } from '../services/crud';
import { Card, PageHeader } from '../components/ui/DataDisplay';
import DataTable from '../components/ui/DataTable';
import { FilterBar, SearchInput } from '../components/ui/Filters';
import Modal from '../components/ui/Modal';
import { PracticeBadge, StatusBadge } from '../components/ui/Badges';
import { EmptyState } from '../components/ui/States';
import { appointmentReference, formatCurrency, formatDate, formatPhone, formatShortDate, formatTime, toDate } from '../utils/format';

const MAX = 500;
const load = async (name, constraints) => (await getDocs(query(collection(db, name), ...constraints, orderBy('createdAt', 'desc'), limit(MAX)))).docs.map((d) => ({ id: d.id, ...d.data() }));
const latest = (a, b) => (toDate(a)?.getTime() || 0) - (toDate(b)?.getTime() || 0);

/** Groups appointment requests by mobile number into patient rows. */
function groupPatients(appts) {
  const map = new Map();
  appts.forEach((a) => {
    const row = map.get(a.phone) || { key: a.phone, phone: a.phone, name: a.patientName, email: a.email, practices: new Set(), records: [], last: a.createdAt };
    row.records.push(a);
    row.practices.add(a.practiceType);
    if (latest(a.createdAt, row.last) >= 0) { row.last = a.createdAt; row.name = a.patientName; row.email = a.email || row.email; }
    map.set(a.phone, row);
  });
  return [...map.values()].sort((a, b) => latest(b.last, a.last));
}

function groupCustomers(orders) {
  const map = new Map();
  orders.forEach((o) => {
    const phone = o.customer?.phone;
    const row = map.get(phone) || { key: phone, phone, name: o.customer?.name, email: o.customer?.email, city: o.deliveryAddress?.city, records: [], spent: 0, last: o.createdAt };
    row.records.push(o);
    if (o.orderStatus !== 'cancelled') row.spent += Number(o.total) || 0;
    if (latest(o.createdAt, row.last) >= 0) { row.last = o.createdAt; row.name = o.customer?.name; row.email = o.customer?.email || row.email; row.city = o.deliveryAddress?.city; }
    map.set(phone, row);
  });
  return [...map.values()].sort((a, b) => latest(b.last, a.last));
}

function PersonModal({ person, kind, onClose }) {
  return (
    <Modal open onClose={onClose} size="md" title={person.name} description={`${formatPhone(person.phone)}${person.email ? ` · ${person.email}` : ''}`}>
      <h3 className="mb-2 text-sm font-semibold text-ink-900">{kind === 'patients' ? 'Appointment requests' : 'Orders'} ({person.records.length})</h3>
      <ul className="divide-y divide-ink-100 rounded-lg border border-ink-100">
        {person.records.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
            {kind === 'patients' ? (
              <>
                <div><p className="font-medium text-ink-900">{r.serviceName || 'General consultation'}</p><p className="text-xs text-ink-500">{formatDate(r.preferredDate)}, {formatTime(r.preferredTime)} · {appointmentReference(r.id)}</p></div>
                <div className="flex gap-2"><PracticeBadge practice={r.practiceType} /><StatusBadge status={r.status} /></div>
              </>
            ) : (
              <>
                <div><p className="font-mono text-xs font-semibold text-ink-900">{r.orderNumber}</p><p className="text-xs text-ink-500">{formatShortDate(r.createdAt)}</p></div>
                <div className="flex items-center gap-2"><span className="tabular-nums">{formatCurrency(r.total)}</span><StatusBadge status={r.orderStatus} /></div>
              </>
            )}
          </li>
        ))}
      </ul>
    </Modal>
  );
}

export default function PeoplePage() {
  const { practiceScope, can } = useAuth();
  const storeAccess = can('orders');
  const [tab, setTab] = useState('patients');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const appts = useAsync(() => load('appointments', scopeConstraint(practiceScope)), [practiceScope], { enabled: tab === 'patients' });
  const orders = useAsync(() => load('orders', []), [], { enabled: tab === 'customers' && storeAccess });

  const source = tab === 'patients' ? appts : orders;
  const rows = useMemo(() => {
    const grouped = tab === 'patients' ? groupPatients(appts.data || []) : groupCustomers(orders.data || []);
    const s = search.trim().toLowerCase();
    return grouped.filter((r) => !s || `${r.name} ${r.phone} ${r.email || ''}`.toLowerCase().includes(s));
  }, [tab, appts.data, orders.data, search]);

  const patientCols = [
    { key: 'name', header: 'Patient', render: (r) => <span className="font-medium text-ink-900">{r.name}</span> },
    { key: 'phone', header: 'Phone', render: (r) => formatPhone(r.phone) },
    { key: 'email', header: 'Email', render: (r) => r.email || '—' },
    ...(practiceScope ? [] : [{ key: 'practice', header: 'Practice', render: (r) => <div className="flex gap-1">{[...r.practices].map((p) => <PracticeBadge key={p} practice={p} />)}</div> }]),
    { key: 'count', header: 'Requests', className: 'tabular-nums', render: (r) => r.records.length },
    { key: 'last', header: 'Last request', render: (r) => formatShortDate(r.last) },
  ];
  const customerCols = [
    { key: 'name', header: 'Customer', render: (r) => <span className="font-medium text-ink-900">{r.name}</span> },
    { key: 'phone', header: 'Phone', render: (r) => formatPhone(r.phone) },
    { key: 'email', header: 'Email', render: (r) => r.email || '—' },
    { key: 'city', header: 'City', render: (r) => r.city || '—' },
    { key: 'count', header: 'Orders', className: 'tabular-nums', render: (r) => r.records.length },
    { key: 'spent', header: 'Total spent', className: 'tabular-nums', render: (r) => formatCurrency(r.spent) },
    { key: 'last', header: 'Last order', render: (r) => formatShortDate(r.last) },
  ];

  const tabBtn = (key, label) => (
    <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => { setTab(key); setSearch(''); }}
      className={`rounded-md px-4 py-2 text-sm font-medium ${tab === key ? 'bg-ink-900 text-white' : 'text-ink-700 hover:bg-ink-100'}`}>{label}</button>
  );

  return (
    <>
      <PageHeader title="Customers / Patients" description={tab === 'patients' ? 'People who requested appointments, grouped by mobile number.' : 'Store customers, grouped by mobile number.'} />
      <div role="tablist" aria-label="People" className="mb-4 flex gap-2">
        {tabBtn('patients', 'Patients')}
        {storeAccess && tabBtn('customers', 'Store customers')}
      </div>
      <Card padded={false}>
        <FilterBar><SearchInput className="w-full sm:w-72" value={search} onChange={setSearch} placeholder="Name, phone or email" label="Search people" /></FilterBar>
        <DataTable caption={tab === 'patients' ? 'Patients' : 'Customers'} columns={tab === 'patients' ? patientCols : customerCols} rows={rows} loading={source.loading} error={source.error} onRetry={source.reload} rowKey={(r) => r.key} onRowClick={setSelected}
          empty={<EmptyState icon={Users} title={search ? 'No one matches your search' : 'Nothing here yet'} message={search ? undefined : 'Records appear once appointments or orders are received.'} />} />
        {!source.loading && !source.error && (source.data?.length || 0) >= MAX && <p className="border-t border-ink-100 px-4 py-3 text-xs text-ink-500">Based on the latest {MAX} records.</p>}
      </Card>
      <p className="mt-3 text-xs text-ink-500">Contact details are shown only to staff with access to the relevant practice. Do not share this information outside the hospital.</p>
      {selected && <PersonModal person={selected} kind={tab} onClose={() => setSelected(null)} />}
    </>
  );
}
