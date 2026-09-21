import { useMemo, useState } from 'react';
import { Pencil, Plus, Stethoscope, Trash2 } from 'lucide-react';
import { PRACTICE_OPTIONS } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { doctorService, scopeConstraint } from '../services/crud';
import { deleteImageByUrl } from '../services/storageService';
import Button, { IconButton } from '../components/ui/Button';
import { Card, PageHeader } from '../components/ui/DataDisplay';
import DataTable from '../components/ui/DataTable';
import { FilterBar, FilterSelect, SearchInput } from '../components/ui/Filters';
import { SelectField, TextAreaField, TextField, Toggle } from '../components/ui/FormField';
import ImageUploader from '../components/ui/ImageUploader';
import Modal, { ConfirmDialog } from '../components/ui/Modal';
import { Badge, PracticeBadge } from '../components/ui/Badges';
import { EmptyState } from '../components/ui/States';
import { getErrorMessage, logError } from '../utils/errors';
import { hasErrors, v } from '../utils/validators';

const blank = (practice) => ({ practiceType: practice || 'ayurveda', name: '', qualification: '', specialization: '', experience: '', bio: '', phone: '', email: '', displayOrder: 1, active: true, featured: false, image: '' });

function validate(f) {
  return {
    practiceType: v.select(f.practiceType, 'Practice'),
    name: v.text(f.name, { label: 'Name', min: 2, max: 100, required: true }),
    qualification: v.text(f.qualification, { label: 'Qualification', max: 150 }),
    specialization: v.text(f.specialization, { label: 'Specialization', max: 150 }),
    experience: v.text(f.experience, { label: 'Experience', max: 60 }),
    bio: v.text(f.bio, { label: 'Biography', max: 1500 }),
    phone: v.phone(f.phone),
    email: v.email(f.email),
    displayOrder: v.integer(f.displayOrder, { label: 'Display order', min: 0, max: 999, required: true }),
  };
}

function DoctorForm({ doctor, onClose, onSaved }) {
  const { user, practiceScope } = useAuth();
  const toast = useToast();
  const [values, setValues] = useState(() => (doctor ? { ...blank(), ...doctor } : blank(practiceScope)));
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const original = doctor?.image || '';
  const errors = validate(values);
  const set = (k) => (val) => setValues((f) => ({ ...f, [k]: val }));
  const bind = (k) => ({ value: values[k] ?? '', onChange: (e) => set(k)(e.target.value), error: submitted ? errors[k] : '' });

  const cancel = () => {
    if (values.image && values.image !== original) deleteImageByUrl(values.image); // discard unsaved upload
    onClose();
  };

  const save = async (e) => {
    e.preventDefault();
    if (busy) return;
    setSubmitted(true);
    if (hasErrors(errors)) return;
    setBusy(true);
    try {
      const data = {
        practiceType: values.practiceType,
        name: values.name.trim(), qualification: values.qualification.trim(), specialization: values.specialization.trim(),
        experience: values.experience.trim(), bio: values.bio.trim(), phone: values.phone.trim(), email: values.email.trim(),
        displayOrder: Number(values.displayOrder), active: values.active, featured: values.featured, image: values.image || '',
      };
      let id = doctor?.id;
      if (doctor) await doctorService.update(doctor.id, data, user);
      else id = await doctorService.create(data, user);
      if (original && original !== data.image) deleteImageByUrl(original); // replaced/removed image
      toast.success(doctor ? 'Doctor updated.' : 'Doctor added.');
      onSaved({ id, ...data });
    } catch (err) {
      logError('doctor-save', err);
      toast.error(getErrorMessage(err, 'Could not save the doctor.'));
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={busy ? () => {} : cancel} dismissible={!busy} size="lg" title={doctor ? 'Edit doctor' : 'Add doctor'}
      footer={<><Button variant="secondary" onClick={cancel} disabled={busy}>Cancel</Button><Button type="submit" form="doctor-form" loading={busy}>{doctor ? 'Save changes' : 'Add doctor'}</Button></>}>
      <form id="doctor-form" onSubmit={save} noValidate className="grid gap-5 sm:grid-cols-2">
        <SelectField label="Practice" required disabled={!!practiceScope || !!doctor} value={values.practiceType} onChange={(e) => set('practiceType')(e.target.value)} error={submitted ? errors.practiceType : ''}>
          {PRACTICE_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </SelectField>
        <TextField label="Name" required maxLength={100} {...bind('name')} />
        <TextField label="Qualification" placeholder="e.g. degree / diploma" maxLength={150} {...bind('qualification')} />
        <TextField label="Specialization" maxLength={150} {...bind('specialization')} />
        <TextField label="Experience" placeholder="e.g. 10 years" hint="Only enter confirmed information." maxLength={60} {...bind('experience')} />
        <TextField label="Display order" type="number" min={0} max={999} required hint="Lower numbers appear first." {...bind('displayOrder')} />
        <TextField label="Phone (optional)" type="tel" {...bind('phone')} />
        <TextField label="Email (optional)" type="email" {...bind('email')} />
        <TextAreaField label="Biography" className="sm:col-span-2" rows={4} maxLength={1500} {...bind('bio')} />
        <div className="sm:col-span-2">
          <ImageUploader label="Profile image" folder={`doctors/${values.practiceType}`} value={values.image ? [values.image] : []} originalUrls={original ? [original] : []}
            onChange={(urls) => set('image')(urls[0] || '')} onNotify={(m, t) => toast[t === 'error' ? 'error' : 'success'](m)} />
        </div>
        <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
          <Toggle label="Active" description="Inactive doctors are hidden from the website." checked={values.active} onChange={set('active')} />
          <Toggle label="Featured" description="Highlight on the website." checked={values.featured} onChange={set('featured')} />
        </div>
      </form>
    </Modal>
  );
}

export default function DoctorsPage() {
  const { practiceScope } = useAuth();
  const toast = useToast();
  const q = useAsync(() => doctorService.list(scopeConstraint(practiceScope)), [practiceScope]);
  const [filters, setFilters] = useState({ search: '', practice: '', status: '' });
  const [editing, setEditing] = useState(null); // doctor | 'new' | null
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (val) => setFilters((f) => ({ ...f, [k]: val }));

  const rows = useMemo(() => {
    const s = filters.search.trim().toLowerCase();
    return (q.data || [])
      .filter((d) => (!filters.practice || d.practiceType === filters.practice)
        && (!filters.status || (filters.status === 'active') === !!d.active)
        && (!s || `${d.name} ${d.specialization || ''} ${d.qualification || ''}`.toLowerCase().includes(s)))
      .sort((a, b) => a.practiceType.localeCompare(b.practiceType) || (a.displayOrder ?? 999) - (b.displayOrder ?? 999) || a.name.localeCompare(b.name));
  }, [q.data, filters]);

  const remove = async () => {
    setBusy(true);
    try {
      await doctorService.remove(deleting.id);
      if (deleting.image) deleteImageByUrl(deleting.image);
      q.setData((list) => list.filter((d) => d.id !== deleting.id));
      toast.success('Doctor deleted.');
      setDeleting(null);
    } catch (err) {
      logError('doctor-delete', err);
      toast.error(getErrorMessage(err, 'Could not delete the doctor.'));
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'doctor', header: 'Doctor', render: (d) => (
      <div className="flex items-center gap-3">
        {d.image ? <img src={d.image} alt="" className="size-10 rounded-full object-cover" /> : <span className="flex size-10 items-center justify-center rounded-full bg-ink-100 text-ink-500"><Stethoscope className="size-5" aria-hidden="true" /></span>}
        <div><p className="font-medium text-ink-900">{d.name}</p><p className="text-xs text-ink-500">{d.qualification}</p></div>
      </div>) },
    ...(practiceScope ? [] : [{ key: 'practice', header: 'Practice', render: (d) => <PracticeBadge practice={d.practiceType} /> }]),
    { key: 'spec', header: 'Specialization', render: (d) => d.specialization || '—' },
    { key: 'order', header: 'Order', render: (d) => d.displayOrder ?? '—' },
    { key: 'status', header: 'Status', render: (d) => <div className="flex gap-1.5"><Badge tone={d.active ? 'green' : 'neutral'}>{d.active ? 'Active' : 'Inactive'}</Badge>{d.featured && <Badge tone="amber">Featured</Badge>}</div> },
    { key: 'actions', header: <span className="sr-only">Actions</span>, className: 'text-right whitespace-nowrap', render: (d) => (
      <>
        <IconButton label={`Edit ${d.name}`} onClick={() => setEditing(d)}><Pencil className="size-4" /></IconButton>
        <IconButton label={`Delete ${d.name}`} variant="danger" onClick={() => setDeleting(d)}><Trash2 className="size-4" /></IconButton>
      </>) },
  ];

  return (
    <>
      <PageHeader title="Doctors" description="Doctors shown on the public website and offered in appointment booking." actions={<Button onClick={() => setEditing('new')}><Plus className="size-4" aria-hidden="true" /> Add doctor</Button>} />
      <Card padded={false}>
        <FilterBar active={Object.values(filters).some(Boolean)} onClear={() => setFilters({ search: '', practice: '', status: '' })}>
          <SearchInput className="w-full sm:w-64" value={filters.search} onChange={set('search')} placeholder="Search doctors" label="Search doctors" />
          {!practiceScope && <FilterSelect label="Practices" value={filters.practice} onChange={set('practice')} options={PRACTICE_OPTIONS} />}
          <FilterSelect label="Statuses" value={filters.status} onChange={set('status')} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
        </FilterBar>
        <DataTable caption="Doctors" columns={columns} rows={rows} loading={q.loading} error={q.error} onRetry={q.reload}
          empty={<EmptyState icon={Stethoscope} title={q.data?.length ? 'No doctors match your filters' : 'No doctors yet'} message={q.data?.length ? undefined : 'Add your first doctor to show them on the website.'} action={!q.data?.length && <Button onClick={() => setEditing('new')}>Add doctor</Button>} />} />
      </Card>

      {editing && <DoctorForm doctor={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); q.reload(); }} />}
      <ConfirmDialog open={!!deleting} danger busy={busy} title="Delete doctor?" confirmLabel="Delete" onCancel={() => setDeleting(null)} onConfirm={remove}
        message={`This will permanently remove ${deleting?.name || 'this doctor'}. Existing appointments keep the doctor’s name. To hide the doctor without losing the record, set them to inactive instead.`} />
    </>
  );
}
