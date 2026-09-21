import { useMemo, useState } from 'react';
import { DEFAULT_SETTINGS } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { getSettings, mergeDefaults, saveSettings } from '../services/contentService';
import Button from '../components/ui/Button';
import { Card, PageHeader } from '../components/ui/DataDisplay';
import { TextAreaField, TextField, Toggle } from '../components/ui/FormField';
import { ErrorState, PageSkeleton } from '../components/ui/States';
import { getErrorMessage, logError } from '../utils/errors';
import { getIn, hasErrors, setIn, v } from '../utils/validators';

function validate(s) {
  return {
    'contact.phone': v.phone(s.contact.phone, { required: true }),
    'contact.whatsapp': v.phone(s.contact.whatsapp),
    'contact.email': v.email(s.contact.email, { required: true }),
    'contact.address': v.text(s.contact.address, { label: 'Address', max: 300, required: true }),
    'contact.workingHours': v.text(s.contact.workingHours, { label: 'Working hours', max: 200 }),
    'contact.mapUrl': v.url(s.contact.mapUrl),
    'social.instagram': v.url(s.social.instagram),
    'social.facebook': v.url(s.social.facebook),
    'social.youtube': v.url(s.social.youtube),
    'shipping.flatFee': v.price(s.shipping.flatFee, { label: 'Shipping fee', allowZero: true }),
    'shipping.freeAbove': v.price(s.shipping.freeAbove, { label: 'Free-shipping threshold', required: false, allowZero: true }),
    lowStockThreshold: v.integer(s.lowStockThreshold, { label: 'Low-stock threshold', min: 0, max: 100000, required: true }),
    'appointments.startTime': v.time(s.appointments.startTime),
    'appointments.endTime': v.time(s.appointments.endTime),
    'appointments.slotMinutes': v.integer(s.appointments.slotMinutes, { label: 'Slot length', min: 10, max: 240, required: true }),
    'appointments.maxDaysAhead': v.integer(s.appointments.maxDaysAhead, { label: 'Booking window', min: 1, max: 365, required: true }),
    disclaimer: v.text(s.disclaimer, { label: 'Disclaimer', max: 800 }),
  };
}

function SettingsForm({ remote }) {
  const { user } = useAuth();
  const toast = useToast();
  const initial = useMemo(() => mergeDefaults(DEFAULT_SETTINGS, remote), [remote]);
  const [s, setS] = useState(initial);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const errors = validate(s);
  const set = (path, value) => setS((cur) => setIn(cur, path, value));
  const f = (path, extra = {}) => ({ value: getIn(s, path), onChange: (e) => set(path, e.target.value), error: submitted ? errors[path] : '', ...extra });

  const save = async (e) => {
    e.preventDefault();
    if (busy) return;
    setSubmitted(true);
    if (hasErrors(errors)) { toast.error('Please fix the highlighted fields.'); return; }
    setBusy(true);
    try {
      await saveSettings({
        contact: s.contact, social: s.social,
        shipping: { enabled: !!s.shipping.enabled, flatFee: Number(s.shipping.flatFee) || 0, freeAbove: s.shipping.freeAbove === '' ? 0 : Number(s.shipping.freeAbove) },
        lowStockThreshold: Number(s.lowStockThreshold),
        appointments: { startTime: s.appointments.startTime, endTime: s.appointments.endTime, slotMinutes: Number(s.appointments.slotMinutes), maxDaysAhead: Number(s.appointments.maxDaysAhead) },
        disclaimer: s.disclaimer.trim(),
      }, user);
      toast.success('Settings saved.');
    } catch (err) {
      logError('settings-save', err);
      toast.error(getErrorMessage(err, 'Could not save settings.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} noValidate className="space-y-6">
      <Card title="Group contact details" description="Used across the website. Each practice can override these under Website content.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Phone" required type="tel" {...f('contact.phone')} />
          <TextField label="WhatsApp number" type="tel" {...f('contact.whatsapp')} />
          <TextField label="Email" required type="email" className="sm:col-span-2" {...f('contact.email')} />
          <TextAreaField label="Address" required rows={2} className="sm:col-span-2" {...f('contact.address')} />
          <TextAreaField label="Working hours" rows={2} className="sm:col-span-2" {...f('contact.workingHours')} />
          <TextField label="Google Maps embed URL" className="sm:col-span-2" hint="In Google Maps: Share → Embed a map → copy the src link." {...f('contact.mapUrl')} />
        </div>
      </Card>

      <Card title="Social links" description="Leave empty to hide.">
        <div className="grid gap-5 sm:grid-cols-3">
          <TextField label="Instagram" placeholder="https://" {...f('social.instagram')} />
          <TextField label="Facebook" placeholder="https://" {...f('social.facebook')} />
          <TextField label="YouTube" placeholder="https://" {...f('social.youtube')} />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Shipping">
          <div className="space-y-5">
            <Toggle label="Charge shipping" checked={!!s.shipping.enabled} onChange={(val) => set('shipping.enabled', val)} />
            <TextField label="Flat shipping fee (₹)" type="number" min="0" step="0.01" disabled={!s.shipping.enabled} {...f('shipping.flatFee')} />
            <TextField label="Free shipping above (₹)" type="number" min="0" step="0.01" disabled={!s.shipping.enabled} hint="Set 0 for no free-shipping threshold." {...f('shipping.freeAbove')} />
          </div>
        </Card>
        <Card title="Inventory">
          <TextField label="Low-stock threshold (units)" type="number" min="0" step="1" hint="Products at or below this level are flagged as low stock." {...f('lowStockThreshold')} />
        </Card>
      </div>

      <Card title="Appointment booking" description="Controls the time slots and dates offered on the website.">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <TextField label="First slot" type="time" {...f('appointments.startTime')} />
          <TextField label="Last slot" type="time" {...f('appointments.endTime')} />
          <TextField label="Slot length (minutes)" type="number" min="10" max="240" {...f('appointments.slotMinutes')} />
          <TextField label="Bookable days ahead" type="number" min="1" max="365" {...f('appointments.maxDaysAhead')} />
        </div>
      </Card>

      <Card title="Medical information disclaimer" description="Shown on treatment pages and in the footer.">
        <TextAreaField label="Disclaimer text" rows={3} maxLength={800} {...f('disclaimer')} />
      </Card>

      <div className="sticky bottom-0 -mx-4 flex justify-end border-t border-ink-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6"><Button type="submit" loading={busy}>Save settings</Button></div>
    </form>
  );
}

export default function SettingsPage() {
  const q = useAsync(getSettings, []);
  return (
    <>
      <PageHeader title="Settings" description="Site-wide configuration. Stored in Firestore (settings/general) and readable by the public website — never enter secrets here." />
      {q.loading ? <PageSkeleton /> : q.error ? <ErrorState message={q.error} onRetry={q.reload} /> : <SettingsForm remote={q.data || {}} />}
    </>
  );
}
