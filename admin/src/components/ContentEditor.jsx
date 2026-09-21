import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { CONTENT_DEFAULTS, CONTENT_SCHEMA } from '../config/contentSchema';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { getSiteContent, mergeDefaults, saveSiteContent } from '../services/contentService';
import { deleteImageByUrl } from '../services/storageService';
import Button from './ui/Button';
import { Card } from './ui/DataDisplay';
import { SelectField, TextAreaField, TextField } from './ui/FormField';
import ImageUploader from './ui/ImageUploader';
import { ErrorState, PageSkeleton } from './ui/States';
import { getErrorMessage, logError } from '../utils/errors';
import { getIn, setIn, v } from '../utils/validators';

const collectImages = (schema, data) =>
  schema.flatMap((sec) => {
    const value = getIn(data, sec.path, sec.type === 'list' ? [] : {});
    const rows = sec.type === 'list' ? value : [value];
    return rows.flatMap((row) => sec.fields.filter((f) => f.type === 'image').map((f) => row?.[f.key]).filter(Boolean));
  });

function validateField(f, value) {
  const label = f.label.replace(/\s*\(.*\)/, '');
  if (f.type === 'phone') return v.phone(value);
  if (f.type === 'email') return v.email(value);
  if (f.type === 'url') return v.url(value);
  if (f.type === 'image' || f.type === 'select') return '';
  return v.text(value, { label, max: f.max || 200, required: f.required });
}

function Field({ field, value, error, onChange, folder, originals, toast }) {
  const common = { label: field.label, value: value ?? '', error, hint: field.hint, required: field.required };
  if (field.type === 'textarea') return <TextAreaField {...common} rows={field.rows || 3} maxLength={field.max} className="sm:col-span-2" onChange={(e) => onChange(e.target.value)} />;
  if (field.type === 'select') return <SelectField {...common} onChange={(e) => onChange(e.target.value)}>{field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</SelectField>;
  if (field.type === 'image') {
    return (
      <div className="sm:col-span-2">
        <ImageUploader label={field.label} folder={folder} value={value ? [value] : []} originalUrls={originals} onChange={(urls) => onChange(urls[0] || '')} onNotify={(m, t) => toast[t === 'error' ? 'error' : 'success'](m)} />
      </div>
    );
  }
  return <TextField {...common} maxLength={field.max} type={field.type === 'email' ? 'email' : 'text'} onChange={(e) => onChange(e.target.value)} />;
}

/** Schema-driven editor for siteContent/{scope}. Effective (default-merged) values are shown and saved. */
export default function ContentEditor({ scope }) {
  const { user } = useAuth();
  const toast = useToast();
  const q = useAsync(() => getSiteContent(scope), [scope]);
  if (q.loading) return <PageSkeleton />;
  if (q.error) return <ErrorState message={q.error} onRetry={q.reload} />;
  return <EditorForm key={scope} scope={scope} remote={q.data || {}} user={user} toast={toast} />;
}

function EditorForm({ scope, remote, user, toast }) {
  const schema = CONTENT_SCHEMA[scope];
  const initial = useMemo(() => mergeDefaults(CONTENT_DEFAULTS[scope], remote), [scope, remote]);
  const originals = useMemo(() => collectImages(schema, initial), [schema, initial]);
  const [data, setData] = useState(initial);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const errorFor = (sec, field, rowIndex) => {
    const value = sec.type === 'list' ? data[sec.path]?.[rowIndex]?.[field.key] : getIn(data, `${sec.path}.${field.key}`);
    return validateField(field, value);
  };
  const allErrors = schema.flatMap((sec) => (sec.type === 'list' ? (data[sec.path] || []).flatMap((_, i) => sec.fields.map((f) => errorFor(sec, f, i))) : sec.fields.map((f) => errorFor(sec, f)))).filter(Boolean);

  const save = async (e) => {
    e.preventDefault();
    if (busy) return;
    setSubmitted(true);
    if (allErrors.length) { toast.error('Please fix the highlighted fields.'); return; }
    setBusy(true);
    try {
      const payload = Object.fromEntries(schema.map((sec) => [sec.path, data[sec.path] ?? (sec.type === 'list' ? [] : {})]));
      await saveSiteContent(scope, payload, user);
      collectImages(schema, initial).filter((u) => !collectImages(schema, payload).includes(u)).forEach(deleteImageByUrl);
      toast.success('Content saved. It is now live on the website.');
    } catch (err) {
      logError('content-save', err);
      toast.error(getErrorMessage(err, 'Could not save the content.'));
    } finally {
      setBusy(false);
    }
  };

  const updateList = (sec, fn) => setData((d) => ({ ...d, [sec.path]: fn([...(d[sec.path] || [])]) }));

  return (
    <form onSubmit={save} noValidate className="space-y-6">
      {schema.map((sec) => (
        <Card key={sec.path} title={sec.title} description={sec.description}>
          {sec.type === 'list' ? (
            <div className="space-y-5">
              {(data[sec.path] || []).map((row, i) => (
                <fieldset key={i} className="rounded-lg border border-ink-200 p-4">
                  <legend className="px-2 text-sm font-medium text-ink-700">{sec.itemLabel} {i + 1}</legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {sec.fields.map((f) => (
                      <Field key={f.key} field={f} value={row[f.key]} error={submitted ? errorFor(sec, f, i) : ''} folder={`site/${scope}`} originals={originals} toast={toast}
                        onChange={(val) => updateList(sec, (list) => { list[i] = { ...list[i], [f.key]: val }; return list; })} />
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" className="mt-3" onClick={() => updateList(sec, (list) => list.filter((_, idx) => idx !== i))}><Trash2 className="size-4" aria-hidden="true" /> Remove {sec.itemLabel.toLowerCase()}</Button>
                </fieldset>
              ))}
              {(data[sec.path] || []).length < sec.max && (
                <Button variant="secondary" size="sm" onClick={() => updateList(sec, (list) => [...list, Object.fromEntries(sec.fields.map((f) => [f.key, f.type === 'select' ? f.options[0].value : '']))])}><Plus className="size-4" aria-hidden="true" /> Add {sec.itemLabel.toLowerCase()}</Button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {sec.fields.map((f) => (
                <Field key={f.key} field={f} value={getIn(data, `${sec.path}.${f.key}`)} error={submitted ? errorFor(sec, f) : ''} folder={`site/${scope}`} originals={originals} toast={toast}
                  onChange={(val) => setData((d) => setIn(d, `${sec.path}.${f.key}`, val))} />
              ))}
            </div>
          )}
        </Card>
      ))}
      <div className="sticky bottom-0 -mx-4 flex justify-end border-t border-ink-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Button type="submit" loading={busy}>Save changes</Button>
      </div>
    </form>
  );
}
