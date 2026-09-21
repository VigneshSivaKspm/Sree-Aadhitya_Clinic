import { useMemo, useState } from 'react';
import { Leaf, Smile } from 'lucide-react';
import { PRACTICES } from '../../config/site';
import { toneFor } from '../../config/theme';
import { useSite } from '../../contexts/SiteContext';
import { useDoctors, useServices } from '../../hooks/useCatalog';
import { createAppointment } from '../../services/appointmentService';
import { addDaysISO, nowMinutesIST, todayISO } from '../../utils/format';
import { getErrorMessage, logError } from '../../utils/errors';
import { slotsBetween } from '../../utils/pricing';
import { hasErrors, validators } from '../../utils/validators';
import Button from '../ui/Button';
import { CheckboxField, SelectField, TextAreaField, TextField } from '../ui/FormField';
import { DemoNotice } from '../ui/States';
import AppointmentSuccess from './AppointmentSuccess';

const PRACTICE_ICONS = { ayurveda: Leaf, dental: Smile };

function validate(v, slots, maxDaysAhead) {
  return {
    practiceType: v.practiceType ? '' : 'Please choose a practice.',
    patientName: validators.name(v.patientName, 'Patient name'),
    phone: validators.phone(v.phone),
    email: validators.email(v.email),
    preferredDate: validators.appointmentDate(v.preferredDate, maxDaysAhead),
    preferredTime: validators.appointmentTime(v.preferredTime, v.preferredDate, slots),
    notes: validators.text(v.notes, { label: 'Notes', max: 1000 }),
    consent: v.consent ? '' : 'Please agree to be contacted about this appointment.',
  };
}

/**
 * Appointment booking form. `practice` sets the starting practice; `lockPractice`
 * hides the practice switcher (used on the practice landing pages).
 */
export default function AppointmentForm({ practice = 'ayurveda', lockPractice = false, initialServiceId = '', initialDoctorId = '' }) {
  const { settings } = useSite();
  const cfg = settings.appointments;
  const allSlots = useMemo(() => slotsBetween(cfg.startTime, cfg.endTime, cfg.slotMinutes), [cfg]);

  const [values, setValues] = useState({
    practiceType: practice,
    serviceId: initialServiceId,
    doctorId: initialDoctorId,
    patientName: '',
    phone: '',
    email: '',
    preferredDate: '',
    preferredTime: '',
    notes: '',
    consent: false,
  });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [booked, setBooked] = useState(null);

  const tone = values.practiceType;
  const doctorsQ = useDoctors(values.practiceType);
  const servicesQ = useServices(values.practiceType);
  const doctors = doctorsQ.data || [];
  const services = servicesQ.data || [];

  const selectedService = services.find((s) => s.id === values.serviceId);
  const doctorOptions = selectedService?.doctorIds?.length ? doctors.filter((d) => selectedService.doctorIds.includes(d.id)) : doctors;

  const today = todayISO();
  const maxDate = addDaysISO(today, cfg.maxDaysAhead);
  const slots = values.preferredDate === today ? allSlots.filter((s) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3)) > nowMinutesIST()) : allSlots;

  const errors = validate(values, allSlots, cfg.maxDaysAhead);
  const show = (field) => (touched[field] || submitted ? errors[field] : '');

  const set = (field, value) =>
    setValues((v) => {
      const next = { ...v, [field]: value };
      if (field === 'serviceId') {
        const svc = services.find((s) => s.id === value);
        if (svc?.doctorIds?.length && next.doctorId && !svc.doctorIds.includes(next.doctorId)) next.doctorId = '';
      }
      if (field === 'practiceType') {
        next.serviceId = '';
        next.doctorId = '';
      }
      return next;
    });
  const bind = (field) => ({
    value: values[field],
    onChange: (e) => set(field, e.target.value),
    onBlur: () => setTouched((x) => ({ ...x, [field]: true })),
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitted(true);
    setSubmitError('');
    if (hasErrors(errors)) {
      setTimeout(() => document.querySelector('form [aria-invalid="true"]')?.focus(), 0);
      return;
    }
    setSubmitting(true);
    try {
      const doctor = doctors.find((d) => d.id === values.doctorId);
      const result = await createAppointment({
        ...values,
        doctorName: doctor?.name || '',
        serviceName: selectedService?.name || '',
      });
      setBooked(result);
    } catch (err) {
      logError('appointment', err);
      setSubmitError(getErrorMessage(err, 'We couldn’t submit your appointment request. Please try again, or call us to book.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (booked) {
    return (
      <AppointmentSuccess
        appointment={booked}
        onReset={() => {
          setBooked(null);
          setSubmitted(false);
          setTouched({});
          setValues((v) => ({ ...v, preferredDate: '', preferredTime: '', notes: '', consent: false }));
        }}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm sm:p-8" aria-label="Appointment booking form">
      {!lockPractice && (
        <fieldset className="mb-6">
          <legend className="mb-2 text-sm font-medium text-ink-800">Choose a practice</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.values(PRACTICES).map((p) => {
              const Icon = PRACTICE_ICONS[p.key];
              const pt = toneFor(p.key);
              const selected = values.practiceType === p.key;
              return (
                <label key={p.key} className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink-700 ${selected ? `${pt.soft} border-current ${pt.text}` : 'border-ink-200 hover:bg-ink-50'}`}>
                  <input type="radio" name="practiceType" value={p.key} checked={selected} onChange={() => set('practiceType', p.key)} className="sr-only" />
                  <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${pt.icon}`}><Icon className="size-5" aria-hidden="true" /></span>
                  <span className="text-sm font-semibold text-ink-900">{p.name}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <DemoNotice show={[...doctors, ...services].some((x) => x.isDemo)} />

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField label="Service / treatment" tone={tone} value={values.serviceId} onChange={(e) => set('serviceId', e.target.value)} disabled={servicesQ.loading} hint={servicesQ.error || undefined}>
          <option value="">{servicesQ.loading ? 'Loading…' : 'Not sure / general consultation'}</option>
          {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </SelectField>

        <SelectField label="Doctor" tone={tone} value={values.doctorId} onChange={(e) => set('doctorId', e.target.value)} disabled={doctorsQ.loading} hint={doctorsQ.error || undefined}>
          <option value="">{doctorsQ.loading ? 'Loading…' : 'First available doctor'}</option>
          {doctorOptions.map((d) => <option key={d.id} value={d.id}>{d.name}{d.specialization ? ` — ${d.specialization}` : ''}</option>)}
        </SelectField>

        <TextField label="Patient name" required tone={tone} autoComplete="name" maxLength={100} {...bind('patientName')} error={show('patientName')} />
        <TextField label="Mobile number" required tone={tone} type="tel" inputMode="numeric" autoComplete="tel" placeholder="10-digit mobile number" {...bind('phone')} error={show('phone')} />
        <TextField label="Email (optional)" tone={tone} type="email" autoComplete="email" className="sm:col-span-2" {...bind('email')} error={show('email')} />

        <TextField label="Preferred date" required tone={tone} type="date" min={today} max={maxDate} {...bind('preferredDate')} error={show('preferredDate')} />
        <SelectField label="Preferred time" required tone={tone} {...bind('preferredTime')} error={show('preferredTime')} hint={values.preferredDate && !slots.length ? 'No more slots today. Please choose another date.' : undefined}>
          <option value="">Select a time</option>
          {slots.map((s) => {
            const [h, m] = s.split(':').map(Number);
            return <option key={s} value={s}>{`${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`}</option>;
          })}
        </SelectField>

        <TextAreaField label="Message or notes (optional)" tone={tone} className="sm:col-span-2" rows={3} maxLength={1000} placeholder="Briefly tell us the reason for your visit. Please do not include detailed medical records." {...bind('notes')} error={show('notes')} />
      </div>

      <CheckboxField
        className="mt-5"
        tone={tone}
        checked={values.consent}
        onChange={(e) => set('consent', e.target.checked)}
        label="I agree that the hospital may contact me on the details above about this appointment request."
        error={show('consent')}
      />

      {submitError && (
        <p role="alert" className="mt-5 rounded-md border border-danger-600/20 bg-danger-50 px-4 py-3 text-sm text-danger-700">{submitError}</p>
      )}

      <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-500">Your request is not confirmed until our team contacts you.</p>
        <Button type="submit" tone={tone} size="lg" loading={submitting} className="w-full sm:w-auto">
          {submitting ? 'Submitting…' : 'Request appointment'}
        </Button>
      </div>
    </form>
  );
}
