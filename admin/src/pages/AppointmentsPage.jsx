import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Eye } from 'lucide-react';
import { APPOINTMENT_STATUSES, APPOINTMENT_TRANSITIONS, PRACTICE_OPTIONS } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { usePagedQuery } from '../hooks/usePagedQuery';
import { appointmentConstraints, changeAppointmentStatus, listAppointmentHistory } from '../services/appointmentService';
import { doctorService, scopeConstraint, serviceService } from '../services/crud';
import Button, { IconButton } from '../components/ui/Button';
import { Card, DetailRow, PageHeader } from '../components/ui/DataDisplay';
import DataTable, { LoadMore } from '../components/ui/DataTable';
import { FilterBar, FilterDate, FilterSelect, SearchInput } from '../components/ui/Filters';
import { SelectField, TextAreaField, TextField } from '../components/ui/FormField';
import Modal, { ConfirmDialog } from '../components/ui/Modal';
import { PracticeBadge, StatusBadge } from '../components/ui/Badges';
import { EmptyState } from '../components/ui/States';
import { appointmentReference, formatDate, formatPhone, formatTime, formatTimestamp, titleCase, todayISO } from '../utils/format';
import { getErrorMessage, logError } from '../utils/errors';
import { v } from '../utils/validators';

const ACTION_LABEL = { confirmed: 'Confirm', completed: 'Mark completed', cancelled: 'Cancel appointment', rescheduled: 'Reschedule' };
const CONFIRM_COPY = {
  confirmed: 'The patient will be expected at the preferred date and time. Make sure you have contacted them.',
  completed: 'Mark this appointment as completed?',
  cancelled: 'This will cancel the appointment. This can’t be undone.',
};

function StatusActions({ appt, onDone }) {
  const { user, profile } = useAuth();
  const toast = useToast();
  const [pending, setPending] = useState(null); // status awaiting confirmation
  const [note, setNote] = useState('');
  const [resched, setResched] = useState({ date: '', time: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const options = APPOINTMENT_TRANSITIONS[appt.status] || [];

  const open = (status) => {
    setPending(status);
    setNote('');
    setErrors({});
    setResched({ date: appt.preferredDate, time: appt.preferredTime });
  };

  const submit = async () => {
    if (busy) return;
    if (pending === 'rescheduled') {
      const e = { date: v.date(resched.date, { notPast: true, label: 'New date' }), time: v.time(resched.time) };
      if (e.date || e.time) return setErrors(e);
    }
    setBusy(true);
    try {
      const patch = await changeAppointmentStatus(appt, pending, { note: note.trim(), preferredDate: resched.date, preferredTime: resched.time }, user, profile);
      toast.success(`Appointment ${pending}.`);
      onDone({ status: pending, ...(pending === 'rescheduled' ? { preferredDate: resched.date, preferredTime: resched.time, rescheduledFrom: patch.rescheduledFrom } : {}), lastStatusNote: note.trim() });
      setPending(null);
    } catch (err) {
      logError('appointment-status', err);
      toast.error(getErrorMessage(err, 'Could not update the appointment.'));
    } finally {
      setBusy(false);
    }
  };

  if (!options.length) return <p className="text-sm text-ink-500">This appointment is {appt.status}; no further actions are available.</p>;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {options.map((s) => (
          <Button key={s} size="sm" variant={s === 'cancelled' ? 'dangerOutline' : s === 'confirmed' ? 'primary' : 'secondary'} onClick={() => open(s)}>{ACTION_LABEL[s]}</Button>
        ))}
      </div>

      {pending === 'rescheduled' ? (
        <Modal open size="sm" onClose={() => setPending(null)} title="Reschedule appointment" description="The previous slot is kept in the history."
          footer={<><Button variant="secondary" onClick={() => setPending(null)} disabled={busy}>Cancel</Button><Button onClick={submit} loading={busy}>Save new time</Button></>}>
          <div className="space-y-4">
            <TextField label="New date" type="date" min={todayISO()} required value={resched.date} onChange={(e) => setResched((r) => ({ ...r, date: e.target.value }))} error={errors.date} data-autofocus />
            <TextField label="New time" type="time" required value={resched.time} onChange={(e) => setResched((r) => ({ ...r, time: e.target.value }))} error={errors.time} />
            <TextAreaField label="Note (optional)" rows={2} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </Modal>
      ) : (
        <ConfirmDialog open={!!pending} danger={pending === 'cancelled'} busy={busy} title={pending ? ACTION_LABEL[pending] : ''} confirmLabel={pending ? ACTION_LABEL[pending] : ''} cancelLabel="Keep as is"
          message={CONFIRM_COPY[pending]} onConfirm={submit} onCancel={() => setPending(null)}>
          <TextAreaField label="Note (optional)" rows={2} maxLength={300} className="mt-4" value={note} onChange={(e) => setNote(e.target.value)} />
        </ConfirmDialog>
      )}
    </>
  );
}

function AppointmentDetail({ appt, onClose, onChange }) {
  const history = useAsync(() => listAppointmentHistory(appt.id), [appt.id, appt.status, appt.preferredDate]);
  return (
    <Modal open onClose={onClose} size="lg" title={`Appointment ${appointmentReference(appt.id)}`} description={`Requested ${formatTimestamp(appt.createdAt)}`}>
      <div className="grid gap-6 md:grid-cols-2">
        <dl className="divide-y divide-ink-100">
          <DetailRow label="Status"><StatusBadge status={appt.status} /></DetailRow>
          <DetailRow label="Practice"><PracticeBadge practice={appt.practiceType} /></DetailRow>
          <DetailRow label="Patient">{appt.patientName}</DetailRow>
          <DetailRow label="Mobile"><a className="text-dental-700 hover:underline" href={`tel:+91${appt.phone}`}>{formatPhone(appt.phone)}</a></DetailRow>
          <DetailRow label="Email">{appt.email && <a className="text-dental-700 hover:underline" href={`mailto:${appt.email}`}>{appt.email}</a>}</DetailRow>
          <DetailRow label="Doctor">{appt.doctorName || 'First available'}</DetailRow>
          <DetailRow label="Service">{appt.serviceName || 'General consultation'}</DetailRow>
          <DetailRow label="Date">{formatDate(appt.preferredDate)}</DetailRow>
          <DetailRow label="Time">{formatTime(appt.preferredTime)}</DetailRow>
          {appt.rescheduledFrom && <DetailRow label="Previously">{formatDate(appt.rescheduledFrom.date)}, {formatTime(appt.rescheduledFrom.time)}</DetailRow>}
          <DetailRow label="Patient notes"><span className="whitespace-pre-line">{appt.notes}</span></DetailRow>
        </dl>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Actions</h3>
          <StatusActions appt={appt} onDone={onChange} />
          <h3 className="mt-8 mb-3 text-sm font-semibold text-ink-900">History</h3>
          {history.loading ? <p className="text-sm text-ink-500">Loading…</p> : history.error ? <p className="text-sm text-danger-600">{history.error}</p>
            : !history.data?.length ? <p className="text-sm text-ink-500">No status changes yet.</p>
            : (
              <ol className="space-y-3 border-l-2 border-ink-100 pl-4">
                {history.data.map((h) => (
                  <li key={h.id} className="text-sm">
                    <p className="font-medium text-ink-900">{titleCase(h.from)} → {titleCase(h.to)}</p>
                    <p className="text-xs text-ink-500">{formatTimestamp(h.at)} · {h.byName || 'Staff'}</p>
                    {h.newDate && <p className="text-xs text-ink-600">New slot: {formatDate(h.newDate)}, {formatTime(h.newTime)}</p>}
                    {h.note && <p className="mt-0.5 text-ink-700">“{h.note}”</p>}
                  </li>
                ))}
              </ol>
            )}
        </div>
      </div>
    </Modal>
  );
}

export default function AppointmentsPage() {
  const { practiceScope } = useAuth();
  const [filters, setFilters] = useState({ search: '', practice: '', status: '', doctor: '', service: '', date: '' });
  const [selectedId, setSelectedId] = useState(null);
  const set = (k) => (val) => setFilters((f) => ({ ...f, [k]: val }));

  const practice = practiceScope || filters.practice;
  const list = usePagedQuery('appointments', appointmentConstraints({ practice, status: filters.status }), [practice, filters.status]);

  const doctors = useAsync(() => doctorService.list(scopeConstraint(practiceScope)), [practiceScope]);
  const services = useAsync(() => serviceService.list(scopeConstraint(practiceScope)), [practiceScope]);

  // Reset doctor/service filters if the practice changes.
  useEffect(() => setFilters((f) => ({ ...f, doctor: '', service: '' })), [practice]);

  const rows = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return list.items.filter((a) => {
      if (filters.doctor && a.doctorId !== filters.doctor) return false;
      if (filters.service && a.serviceId !== filters.service) return false;
      if (filters.date && a.preferredDate !== filters.date) return false;
      if (q && !`${a.patientName} ${a.phone} ${a.email || ''} ${appointmentReference(a.id)} ${a.id}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [list.items, filters]);

  const selected = list.items.find((a) => a.id === selectedId);
  const active = Object.entries(filters).some(([k, val]) => val && !(k === 'practice' && practiceScope));
  const doctorOptions = (doctors.data || []).filter((d) => !practice || d.practiceType === practice).map((d) => ({ value: d.id, label: d.name }));
  const serviceOptions = (services.data || []).filter((s) => !practice || s.practiceType === practice).map((s) => ({ value: s.id, label: s.name }));

  const columns = [
    { key: 'id', header: 'ID', render: (a) => <span className="font-mono text-xs">{appointmentReference(a.id)}</span> },
    { key: 'patient', header: 'Patient', render: (a) => <div><p className="font-medium text-ink-900">{a.patientName}</p></div> },
    { key: 'phone', header: 'Phone', render: (a) => formatPhone(a.phone) },
    ...(practiceScope ? [] : [{ key: 'practice', header: 'Practice', render: (a) => <PracticeBadge practice={a.practiceType} /> }]),
    { key: 'doctor', header: 'Doctor', render: (a) => a.doctorName || <span className="text-ink-400">Any</span> },
    { key: 'service', header: 'Treatment', render: (a) => a.serviceName || <span className="text-ink-400">General</span> },
    { key: 'date', header: 'Date', render: (a) => <span className="whitespace-nowrap">{formatDate(a.preferredDate)}</span> },
    { key: 'time', header: 'Time', render: (a) => <span className="whitespace-nowrap">{formatTime(a.preferredTime)}</span> },
    { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
    { key: 'actions', header: <span className="sr-only">Actions</span>, className: 'text-right', render: (a) => <IconButton label={`View appointment ${appointmentReference(a.id)}`} onClick={(e) => { e.stopPropagation(); setSelectedId(a.id); }}><Eye className="size-4" /></IconButton> },
  ];

  return (
    <>
      <PageHeader title="Appointments" description="Review requests from the website and confirm, reschedule, complete or cancel them." />
      <Card padded={false}>
        <FilterBar active={active} onClear={() => setFilters({ search: '', practice: '', status: '', doctor: '', service: '', date: '' })}>
          <SearchInput className="w-full sm:w-64" value={filters.search} onChange={set('search')} placeholder="Name, phone or reference" label="Search appointments" />
          {!practiceScope && <FilterSelect label="Practices" value={filters.practice} onChange={set('practice')} options={PRACTICE_OPTIONS} />}
          <FilterSelect label="Statuses" value={filters.status} onChange={set('status')} options={APPOINTMENT_STATUSES.map((s) => ({ value: s, label: titleCase(s) }))} />
          <FilterSelect label="Doctors" value={filters.doctor} onChange={set('doctor')} options={doctorOptions} />
          <FilterSelect label="Services" value={filters.service} onChange={set('service')} options={serviceOptions} />
          <FilterDate label="Appointment date" value={filters.date} onChange={set('date')} />
        </FilterBar>
        <DataTable caption="Appointments" columns={columns} rows={rows} loading={list.loading} error={list.error} onRetry={list.reload} onRowClick={(a) => setSelectedId(a.id)}
          empty={<EmptyState icon={CalendarDays} title={list.items.length ? 'No appointments match your filters' : 'No appointments yet'} message={list.items.length ? 'Try clearing a filter, or load more records.' : 'Requests submitted on the website will appear here.'} />} />
        {!list.loading && !list.error && <LoadMore shown={rows.length} hasMore={list.hasMore} loading={list.loadingMore} onLoadMore={list.loadMore} noun={rows.length === list.items.length ? 'appointments' : `of ${list.items.length} loaded`} />}
      </Card>

      {selected && <AppointmentDetail appt={selected} onClose={() => setSelectedId(null)} onChange={(patch) => list.patchItem(selected.id, patch)} />}
    </>
  );
}
