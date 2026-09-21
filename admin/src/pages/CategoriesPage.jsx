import { useMemo, useState } from 'react';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { categoryService, productCrud } from '../services/crud';
import { deleteImageByUrl } from '../services/storageService';
import Button, { IconButton } from '../components/ui/Button';
import { Card, PageHeader } from '../components/ui/DataDisplay';
import DataTable from '../components/ui/DataTable';
import { SearchInput } from '../components/ui/Filters';
import { FilterBar } from '../components/ui/Filters';
import { TextAreaField, TextField, Toggle } from '../components/ui/FormField';
import ImageUploader from '../components/ui/ImageUploader';
import Modal, { ConfirmDialog } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badges';
import { EmptyState } from '../components/ui/States';
import { AppError, getErrorMessage, logError } from '../utils/errors';
import { hasErrors, slugify, v } from '../utils/validators';

const blank = { name: '', slug: '', description: '', displayOrder: 1, active: true, image: '' };

function validate(f) {
  return {
    name: v.text(f.name, { label: 'Name', min: 2, max: 80, required: true }),
    slug: v.slug(f.slug),
    description: v.text(f.description, { label: 'Description', max: 300 }),
    displayOrder: v.integer(f.displayOrder, { label: 'Display order', min: 0, max: 999, required: true }),
  };
}

function CategoryForm({ category, onClose, onSaved }) {
  const { user } = useAuth();
  const toast = useToast();
  const [values, setValues] = useState(category ? { ...blank, ...category } : blank);
  const [slugTouched, setSlugTouched] = useState(!!category);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const original = category?.image || '';
  const errors = validate(values);
  const set = (k) => (val) => setValues((f) => ({ ...f, [k]: val }));
  const bind = (k) => ({ value: values[k] ?? '', onChange: (e) => set(k)(e.target.value), error: submitted ? errors[k] : '' });

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
      if (await categoryService.isTaken('slug', values.slug, { excludeId: category?.id })) {
        toast.error('Another category already uses that slug.');
        setBusy(false);
        return;
      }
      const data = { name: values.name.trim(), slug: values.slug, description: values.description.trim(), displayOrder: Number(values.displayOrder), active: values.active, image: values.image || '' };
      if (category) await categoryService.update(category.id, data, user);
      else await categoryService.create(data, user);
      if (original && original !== data.image) deleteImageByUrl(original);
      toast.success(category ? 'Category updated.' : 'Category added.');
      onSaved();
    } catch (err) {
      logError('category-save', err);
      toast.error(getErrorMessage(err, 'Could not save the category.'));
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={busy ? () => {} : cancel} dismissible={!busy} title={category ? 'Edit category' : 'Add category'}
      footer={<><Button variant="secondary" onClick={cancel} disabled={busy}>Cancel</Button><Button type="submit" form="category-form" loading={busy}>{category ? 'Save changes' : 'Add category'}</Button></>}>
      <form id="category-form" onSubmit={save} noValidate className="space-y-5">
        <TextField label="Name" required maxLength={80} {...bind('name')} onChange={(e) => setValues((f) => ({ ...f, name: e.target.value, slug: slugTouched ? f.slug : slugify(e.target.value) }))} />
        <TextField label="Slug (URL)" required {...bind('slug')} onChange={(e) => { setSlugTouched(true); set('slug')(slugify(e.target.value)); }} />
        <TextAreaField label="Description" rows={3} maxLength={300} {...bind('description')} />
        <TextField label="Display order" type="number" min={0} max={999} required {...bind('displayOrder')} />
        <ImageUploader label="Image (optional)" folder="categories" value={values.image ? [values.image] : []} originalUrls={original ? [original] : []} onChange={(urls) => set('image')(urls[0] || '')} onNotify={(m, t) => toast[t === 'error' ? 'error' : 'success'](m)} />
        <Toggle label="Active" description="Inactive categories are hidden from the shop." checked={values.active} onChange={set('active')} />
      </form>
    </Modal>
  );
}

export default function CategoriesPage() {
  const toast = useToast();
  const q = useAsync(() => categoryService.list(), []);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const rows = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (q.data || []).filter((c) => !s || `${c.name} ${c.slug}`.toLowerCase().includes(s)).sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999) || a.name.localeCompare(b.name));
  }, [q.data, search]);

  const remove = async () => {
    setBusy(true);
    try {
      // Safety: never orphan products that still reference this category.
      if (await productCrud.isTaken('categoryId', deleting.id)) {
        throw new AppError('This category still has products. Move or delete those products first, or set the category to inactive instead.', 'in-use');
      }
      await categoryService.remove(deleting.id);
      if (deleting.image) deleteImageByUrl(deleting.image);
      q.setData((list) => list.filter((c) => c.id !== deleting.id));
      toast.success('Category deleted.');
      setDeleting(null);
    } catch (err) {
      logError('category-delete', err);
      toast.error(getErrorMessage(err, 'Could not delete the category.'));
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'name', header: 'Category', render: (c) => (
      <div className="flex items-center gap-3">
        {c.image ? <img src={c.image} alt="" className="size-10 rounded-md object-cover" /> : <span className="flex size-10 items-center justify-center rounded-md bg-ink-100 text-ink-500"><Tags className="size-5" aria-hidden="true" /></span>}
        <div><p className="font-medium text-ink-900">{c.name}</p><p className="font-mono text-xs text-ink-500">/{c.slug}</p></div>
      </div>) },
    { key: 'desc', header: 'Description', render: (c) => <span className="line-clamp-1 max-w-xs text-ink-600">{c.description || '—'}</span> },
    { key: 'order', header: 'Order', render: (c) => c.displayOrder ?? '—' },
    { key: 'status', header: 'Status', render: (c) => <Badge tone={c.active ? 'green' : 'neutral'}>{c.active ? 'Active' : 'Inactive'}</Badge> },
    { key: 'actions', header: <span className="sr-only">Actions</span>, className: 'text-right whitespace-nowrap', render: (c) => (
      <>
        <IconButton label={`Edit ${c.name}`} onClick={() => setEditing(c)}><Pencil className="size-4" /></IconButton>
        <IconButton label={`Delete ${c.name}`} variant="danger" onClick={() => setDeleting(c)}><Trash2 className="size-4" /></IconButton>
      </>) },
  ];

  return (
    <>
      <PageHeader title="Product categories" description="Group products in the Ayurvedic store." actions={<Button onClick={() => setEditing('new')}><Plus className="size-4" aria-hidden="true" /> Add category</Button>} />
      <Card padded={false}>
        <FilterBar><SearchInput className="w-full sm:w-64" value={search} onChange={setSearch} placeholder="Search categories" label="Search categories" /></FilterBar>
        <DataTable caption="Product categories" columns={columns} rows={rows} loading={q.loading} error={q.error} onRetry={q.reload}
          empty={<EmptyState icon={Tags} title={q.data?.length ? 'No categories match your search' : 'No categories yet'} message={q.data?.length ? undefined : 'Create a category before adding products.'} action={!q.data?.length && <Button onClick={() => setEditing('new')}>Add category</Button>} />} />
      </Card>
      {editing && <CategoryForm category={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); q.reload(); }} />}
      <ConfirmDialog open={!!deleting} danger busy={busy} title="Delete category?" confirmLabel="Delete" onCancel={() => setDeleting(null)} onConfirm={remove}
        message={`This will permanently remove “${deleting?.name || 'this category'}”. Categories that still contain products can’t be deleted.`} />
    </>
  );
}
