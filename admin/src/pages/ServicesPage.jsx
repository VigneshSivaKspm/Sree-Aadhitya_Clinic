import { useMemo, useState } from 'react';
import { ClipboardList, Pencil, Plus, Trash2 } from 'lucide-react';
import { PRACTICE_OPTIONS } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { doctorService, scopeConstraint, serviceService } from '../services/crud';
import { deleteImageByUrl } from '../services/storageService';
import Button, { IconButton } from '../components/ui/Button';
import { Card, PageHeader } from '../components/ui/DataDisplay';
import DataTable from '../components/ui/DataTable';
import { FilterBar, FilterSelect, SearchInput } from '../components/ui/Filters';
import { CheckboxField, SelectField, TextAreaField, TextField, Toggle } from '../components/ui/FormField';
import ImageUploader from '../components/ui/ImageUploader';
import Modal, { ConfirmDialog } from '../components/ui/Modal';
import { Badge, PracticeBadge } from '../components/ui/Badges';
import { EmptyState } from '../components/ui/States';
import { getErrorMessage, logError } from '../utils/errors';
import { hasErrors, slugify, v } from '../utils/validators';

const blank = (practice) => ({ practiceType: practice || 'ayurveda', name: '', slug: '', shortDescription: '', fullDescription: '', benefitsText: '', duration: '', doctorIds: [], displayOrder: 1, featured: false, active: true, seoTitle: '', seoDescription: '', image: '' });

function validate(f) {
  return {
    practiceType: v.select(f.practiceType, 'Practice'),
    name: v.text(f.name, { label: 'Name', min: 2, max: 120, required: true }),
    slug: v.slug(f.slug),
    shortDescription: v.text(f.shortDescription, { label: 'Short description', min: 10, max: 220, required: true }),
    fullDescription: v.text(f.fullDescription, { label: 'Full description', max: 6000 }),
    benefitsText: v.text(f.benefitsText, { label: 'Benefits', max: 2000 }),
    duration: v.text(f.duration, { label: 'Duration', max: 60 }),
    displayOrder: v.integer(f.displayOrder, { label: 'Display order', min: 0, max: 999, required: true }),
    seoTitle: v.text(f.seoTitle, { label: 'SEO title', max: 70 }),
    seoDescription: v.text(f.seoDescription, { label: 'SEO description', max: 160 }),
  };
}

function ServiceForm({ service, onClose, onSaved }) {
  const { user, practiceScope } = useAuth();
  const toast = useToast();
  const initial = service ? { ...blank(), ...service, benefitsText: (service.benefits || []).join('\n'), doctorIds: service.doctorIds || [] } : blank(practiceScope);
  const [values, setValues] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(!!service);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const original = service?.image || '';
  const errors = validate(values);
  const doctors = useAsync(() => doctorService.list(scopeConstraint(practiceScope)), [practiceScope]);
  const practiceDoctors = (doctors.data || []).filter((d) => d.practiceType === values.practiceType);

  const set = (k) => (val) => setValues((f) => ({ ...f, [k]: val }));
  const bind = (k) => ({ value: values[k] ?? '', onChange: (e) => set(k)(e.target.value), error: submitted ? errors[k] : '' });
  const onName = (e) => setValues((f) => ({ ...f, name: e.target.value, slug: slugTouched ? f.slug : slugify(e.target.value) }));
  const toggleDoctor = (id, on) => set('doctorIds')(on ? [...values.doctorIds, id] : values.doctorIds.filter((x) => x !== id));

  const cancel = () => {
    if (values.image && values.image !== original) deleteImageByUrl(values.image);
    onClose();
  };

  const save = async (e) => {
    e.preventDefault();
    if (busy) return;
    setSubmitted(true);
    if (hasErrors(errors)) return;
    setBusy(true);
    try {
      if (await serviceService.isTaken('slug', values.slug, { practiceType: values.practiceType, excludeId: service?.id })) {
        toast.error('Another treatment in this practice already uses that slug. Please change it.');
        setBusy(false);
        return;
      }
      const data = {
        practiceType: values.practiceType,
        name: values.name.trim(), slug: values.slug.trim(),
        shortDescription: values.shortDescription.trim(), fullDescription: values.fullDescription.trim(),
        benefits: values.benefitsText.split('\n').map((b) => b.trim()).filter(Boolean),
        duration: values.duration.trim(), doctorIds: values.doctorIds.filter((id) => practiceDoctors.some((d) => d.id === id)),
        displayOrder: Number(values.displayOrder), featured: values.featured, active: values.active,
        seoTitle: values.seoTitle.trim(), seoDescription: values.seoDescription.trim(), image: values.image || '',
      };
      if (service) await serviceService.update(service.id, data, user);
      else await serviceService.create(data, user);
      if (original && original !== data.image) deleteImageByUrl(original);
      toast.success(service ? 'Treatment updated.' : 'Treatment added.');
      onSaved();
    } catch (err) {
      logError('service-save', err);
      toast.error(getErrorMessage(err, 'Could not save the treatment.'));
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={busy ? () => {} : cancel} dismissible={!busy} size="xl" title={service ? 'Edit treatment' : 'Add treatment'}
      footer={<><Button variant="secondary" onClick={cancel} disabled={busy}>Cancel</Button><Button type="submit" form="service-form" loading={busy}>{service ? 'Save changes' : 'Add treatment'}</Button></>}>
      <form id="service-form" onSubmit={save} noValidate className="grid gap-5 md:grid-cols-2">
        <SelectField label="Practice" required disabled={!!practiceScope || !!service} value={values.practiceType} onChange={(e) => setValues((f) => ({ ...f, practiceType: e.target.value, doctorIds: [] }))}>
          {PRACTICE_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </SelectField>
        <TextField label="Duration" placeholder="e.g. 45 minutes" maxLength={60} {...bind('duration')} />
        <TextField label="Name" required maxLength={120} {...bind('name')} onChange={onName} />
        <TextField label="Slug (URL)" required hint="Used in the web address, e.g. /dental/services/teeth-cleaning" {...bind('slug')} onChange={(e) => { setSlugTouched(true); set('slug')(slugify(e.target.value)); }} />
        <TextAreaField label="Short description" required className="md:col-span-2" rows={2} maxLength={220} hint={`${values.shortDescription.length}/220 · shown on cards`} {...bind('shortDescription')} />
        <TextAreaField label="Full description" className="md:col-span-2" rows={6} maxLength={6000} hint="Keep it informational. Avoid guarantees or claims of cure." {...bind('fullDescription')} />
        <TextAreaField label="Benefits / what to expect" className="md:col-span-2" rows={4} hint="One point per line." {...bind('benefitsText')} />

        <fieldset className="md:col-span-2">
          <legend className="mb-2 text-sm font-medium text-ink-800">Doctors who offer this treatment</legend>
          {doctors.loading ? <p className="text-sm text-ink-500">Loading doctors…</p>
            : !practiceDoctors.length ? <p className="text-sm text-ink-500">No doctors in this practice yet. Add doctors first.</p>
            : <div className="grid gap-2 sm:grid-cols-2">{practiceDoctors.map((d) => <CheckboxField key={d.id} label={d.name} checked={values.doctorIds.includes(d.id)} onChange={(on) => toggleDoctor(d.id, on)} />)}</div>}
          <p className="mt-1.5 text-xs text-ink-500">Leave all unchecked to allow every doctor in the practice.</p>
        </fieldset>

        <div className="md:col-span-2">
          <ImageUploader label="Image" folder={`services/${values.practiceType}`} value={values.image ? [values.image] : []} originalUrls={original ? [original] : []}
            onChange={(urls) => set('image')(urls[0] || '')} onNotify={(m, t) => toast[t === 'error' ? 'error' : 'success'](m)} />
        </div>

        <TextField label="SEO title" maxLength={70} hint="Optional. Up to 70 characters." {...bind('seoTitle')} />
        <TextField label="Display order" type="number" min={0} max={999} required {...bind('displayOrder')} />
        <TextAreaField label="SEO description" className="md:col-span-2" rows={2} maxLength={160} hint="Optional. Up to 160 characters." {...bind('seoDescription')} />

        <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
          <Toggle label="Active" description="Inactive treatments are hidden from the website." checked={values.active} onChange={set('active')} />
          <Toggle label="Featured" description="Shown first on the website." checked={values.featured} onChange={set('featured')} />
        </div>
      </form>
    </Modal>
  );
}

export default function ServicesPage() {
  const { practiceScope } = useAuth();
  const toast = useToast();
  const q = useAsync(() => serviceService.list(scopeConstraint(practiceScope)), [practiceScope]);
  const [filters, setFilters] = useState({ search: '', practice: '', status: '' });
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (val) => setFilters((f) => ({ ...f, [k]: val }));

  const rows = useMemo(() => {
    const s = filters.search.trim().toLowerCase();
    return (q.data || [])
      .filter((x) => (!filters.practice || x.practiceType === filters.practice) && (!filters.status || (filters.status === 'active') === !!x.active) && (!s || `${x.name} ${x.slug}`.toLowerCase().includes(s)))
      .sort((a, b) => a.practiceType.localeCompare(b.practiceType) || (a.displayOrder ?? 999) - (b.displayOrder ?? 999) || a.name.localeCompare(b.name));
  }, [q.data, filters]);

  const remove = async () => {
    setBusy(true);
    try {
      await serviceService.remove(deleting.id);
      if (deleting.image) deleteImageByUrl(deleting.image);
      q.setData((list) => list.filter((x) => x.id !== deleting.id));
      toast.success('Treatment deleted.');
      setDeleting(null);
    } catch (err) {
      logError('service-delete', err);
      toast.error(getErrorMessage(err, 'Could not delete the treatment.'));
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'name', header: 'Treatment', render: (s) => (
      <div className="flex items-center gap-3">
        {s.image ? <img src={s.image} alt="" className="size-10 rounded-md object-cover" /> : <span className="flex size-10 items-center justify-center rounded-md bg-ink-100 text-ink-500"><ClipboardList className="size-5" aria-hidden="true" /></span>}
        <div><p className="font-medium text-ink-900">{s.name}</p><p className="font-mono text-xs text-ink-500">/{s.slug}</p></div>
      </div>) },
    ...(practiceScope ? [] : [{ key: 'practice', header: 'Practice', render: (s) => <PracticeBadge practice={s.practiceType} /> }]),
    { key: 'duration', header: 'Duration', render: (s) => s.duration || '—' },
    { key: 'doctors', header: 'Doctors', render: (s) => (s.doctorIds?.length ? s.doctorIds.length : 'All') },
    { key: 'status', header: 'Status', render: (s) => <div className="flex gap-1.5"><Badge tone={s.active ? 'green' : 'neutral'}>{s.active ? 'Active' : 'Inactive'}</Badge>{s.featured && <Badge tone="amber">Featured</Badge>}</div> },
    { key: 'actions', header: <span className="sr-only">Actions</span>, className: 'text-right whitespace-nowrap', render: (s) => (
      <>
        <IconButton label={`Edit ${s.name}`} onClick={() => setEditing(s)}><Pencil className="size-4" /></IconButton>
        <IconButton label={`Delete ${s.name}`} variant="danger" onClick={() => setDeleting(s)}><Trash2 className="size-4" /></IconButton>
      </>) },
  ];

  return (
    <>
      <PageHeader title="Services / Treatments" description="Treatments shown on the public website and offered in appointment booking." actions={<Button onClick={() => setEditing('new')}><Plus className="size-4" aria-hidden="true" /> Add treatment</Button>} />
      <Card padded={false}>
        <FilterBar active={Object.values(filters).some(Boolean)} onClear={() => setFilters({ search: '', practice: '', status: '' })}>
          <SearchInput className="w-full sm:w-64" value={filters.search} onChange={set('search')} placeholder="Search treatments" label="Search treatments" />
          {!practiceScope && <FilterSelect label="Practices" value={filters.practice} onChange={set('practice')} options={PRACTICE_OPTIONS} />}
          <FilterSelect label="Statuses" value={filters.status} onChange={set('status')} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
        </FilterBar>
        <DataTable caption="Treatments" columns={columns} rows={rows} loading={q.loading} error={q.error} onRetry={q.reload}
          empty={<EmptyState icon={ClipboardList} title={q.data?.length ? 'No treatments match your filters' : 'No treatments yet'} message={q.data?.length ? undefined : 'Add treatments to show them on the website.'} action={!q.data?.length && <Button onClick={() => setEditing('new')}>Add treatment</Button>} />} />
      </Card>

      {editing && <ServiceForm service={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); q.reload(); }} />}
      <ConfirmDialog open={!!deleting} danger busy={busy} title="Delete treatment?" confirmLabel="Delete" onCancel={() => setDeleting(null)} onConfirm={remove}
        message={`This will permanently remove “${deleting?.name || 'this treatment'}” from the website. Existing appointments keep the treatment name. To hide it without deleting, set it to inactive instead.`} />
    </>
  );
}
