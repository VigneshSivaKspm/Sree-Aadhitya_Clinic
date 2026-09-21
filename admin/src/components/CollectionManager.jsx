import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { scopeConstraint } from '../services/crud';
import Button, { IconButton } from './ui/Button';
import { Card } from './ui/DataDisplay';
import DataTable from './ui/DataTable';
import { SelectField, TextAreaField, TextField, Toggle } from './ui/FormField';
import Modal, { ConfirmDialog } from './ui/Modal';
import { Badge, PracticeBadge } from './ui/Badges';
import { EmptyState } from './ui/States';
import { getErrorMessage, logError } from '../utils/errors';
import { hasErrors, v } from '../utils/validators';

/** Field types: text | textarea | number | select | toggle. Validation is derived from the config. */
function validate(fields, values) {
  return Object.fromEntries(fields.map((f) => {
    const val = values[f.key];
    let err = '';
    if (f.type === 'select') err = f.required && !val ? `${f.label} is required.` : '';
    else if (f.type === 'number') err = v.integer(val, { label: f.label, min: f.min ?? 0, max: f.max ?? 999, required: f.required });
    else if (f.type === 'toggle') err = '';
    else err = v.text(val, { label: f.label, min: f.min || 0, max: f.max || 200, required: f.required });
    return [f.key, err];
  }));
}

function ItemForm({ item, fields, blank, noun, service, onClose, onSaved }) {
  const { user } = useAuth();
  const toast = useToast();
  const [values, setValues] = useState(item ? { ...blank, ...item } : blank);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const errors = validate(fields, values);

  const save = async (e) => {
    e.preventDefault();
    if (busy) return;
    setSubmitted(true);
    if (hasErrors(errors)) return;
    setBusy(true);
    try {
      const data = Object.fromEntries(fields.map((f) => [f.key, f.type === 'number' ? Number(values[f.key]) : typeof values[f.key] === 'string' ? values[f.key].trim() : values[f.key]]));
      if (item) await service.update(item.id, data, user);
      else await service.create(data, user);
      toast.success(`${noun} ${item ? 'updated' : 'added'}.`);
      onSaved();
    } catch (err) {
      logError('collection-save', err);
      toast.error(getErrorMessage(err, `Could not save the ${noun.toLowerCase()}.`));
      setBusy(false);
    }
  };

  const shared = (f) => ({ label: f.label, required: f.required, hint: f.hint, value: values[f.key] ?? '', error: submitted ? errors[f.key] : '', onChange: (e) => setValues((s) => ({ ...s, [f.key]: e.target.value })) });

  return (
    <Modal open onClose={busy ? () => {} : onClose} dismissible={!busy} title={item ? `Edit ${noun.toLowerCase()}` : `Add ${noun.toLowerCase()}`}
      footer={<><Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button><Button type="submit" form="collection-form" loading={busy}>Save</Button></>}>
      <form id="collection-form" onSubmit={save} noValidate className="space-y-5">
        {fields.map((f) => {
          if (f.type === 'toggle') return <Toggle key={f.key} label={f.label} description={f.hint} checked={!!values[f.key]} onChange={(val) => setValues((s) => ({ ...s, [f.key]: val }))} />;
          if (f.type === 'select') return <SelectField key={f.key} {...shared(f)} disabled={!!item && f.lockOnEdit}>{f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</SelectField>;
          if (f.type === 'textarea') return <TextAreaField key={f.key} {...shared(f)} rows={f.rows || 4} maxLength={f.max} />;
          if (f.type === 'number') return <TextField key={f.key} {...shared(f)} type="number" min={f.min ?? 0} max={f.max ?? 999} />;
          return <TextField key={f.key} {...shared(f)} maxLength={f.max} />;
        })}
      </form>
    </Modal>
  );
}

/** Generic list + modal CRUD for small, scope-based content collections (testimonials, FAQs). */
export default function CollectionManager({ service, noun, plural, fields, blank, columns, note }) {
  const { practiceScope } = useAuth();
  const toast = useToast();
  const q = useAsync(() => service.list(scopeConstraint(practiceScope)), [practiceScope, service]);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const rows = useMemo(() => [...(q.data || [])].sort((a, b) => String(a.practiceType).localeCompare(String(b.practiceType)) || (a.displayOrder ?? 999) - (b.displayOrder ?? 999)), [q.data]);
  const initial = { ...blank, ...(practiceScope ? { practiceType: practiceScope } : {}) };

  const remove = async () => {
    setBusy(true);
    try {
      await service.remove(deleting.id);
      q.setData((list) => list.filter((x) => x.id !== deleting.id));
      toast.success(`${noun} deleted.`);
      setDeleting(null);
    } catch (err) {
      logError('collection-delete', err);
      toast.error(getErrorMessage(err, `Could not delete the ${noun.toLowerCase()}.`));
    } finally {
      setBusy(false);
    }
  };

  const cols = [
    { key: 'practice', header: 'Shown on', render: (r) => <PracticeBadge practice={r.practiceType} /> },
    ...columns,
    { key: 'status', header: 'Status', render: (r) => <Badge tone={r.active ? 'green' : 'neutral'}>{r.active ? 'Active' : 'Hidden'}</Badge> },
    { key: 'actions', header: <span className="sr-only">Actions</span>, className: 'text-right whitespace-nowrap', render: (r) => (
      <>
        <IconButton label={`Edit ${noun.toLowerCase()}`} onClick={() => setEditing(r)}><Pencil className="size-4" /></IconButton>
        <IconButton label={`Delete ${noun.toLowerCase()}`} variant="danger" onClick={() => setDeleting(r)}><Trash2 className="size-4" /></IconButton>
      </>) },
  ];

  return (
    <Card title={plural} description={note} padded={false} actions={<Button size="sm" onClick={() => setEditing('new')}><Plus className="size-4" aria-hidden="true" /> Add {noun.toLowerCase()}</Button>}>
      <DataTable caption={plural} columns={cols} rows={rows} loading={q.loading} error={q.error} onRetry={q.reload}
        empty={<EmptyState title={`No ${plural.toLowerCase()} yet`} action={<Button onClick={() => setEditing('new')}>Add {noun.toLowerCase()}</Button>} />} />
      {editing && <ItemForm item={editing === 'new' ? null : editing} fields={fields} blank={initial} noun={noun} service={service} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); q.reload(); }} />}
      <ConfirmDialog open={!!deleting} danger busy={busy} title={`Delete ${noun.toLowerCase()}?`} confirmLabel="Delete" onCancel={() => setDeleting(null)} onConfirm={remove} message="This will permanently remove it from the website. To hide it temporarily, set it to hidden instead." />
    </Card>
  );
}
