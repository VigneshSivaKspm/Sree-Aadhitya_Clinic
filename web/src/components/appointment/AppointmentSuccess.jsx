import { CheckCircle2, Clock } from 'lucide-react';
import { PRACTICES } from '../../config/site';
import { toneFor } from '../../config/theme';
import { useSite } from '../../contexts/SiteContext';
import { appointmentReference, formatDate, formatPhone, formatTime } from '../../utils/format';
import { CallButton, WhatsAppButton } from '../common/ContactActions';
import Button from '../ui/Button';

const STATUS_COPY = {
  pending: { label: 'Awaiting confirmation', icon: Clock },
  confirmed: { label: 'Confirmed', icon: CheckCircle2 },
};

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-6 py-3 text-sm">
      <dt className="text-ink-500">{label}</dt>
      <dd className="text-right font-medium text-ink-900">{children}</dd>
    </div>
  );
}

/** Shown after a booking. Never claims "confirmed" unless the status really is confirmed. */
export default function AppointmentSuccess({ appointment, onReset }) {
  const { contactFor } = useSite();
  const contact = contactFor(appointment.practiceType);
  const t = toneFor(appointment.practiceType);
  const status = STATUS_COPY[appointment.status] || STATUS_COPY.pending;
  const StatusIcon = status.icon;
  const isConfirmed = appointment.status === 'confirmed';

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-ink-100 bg-white p-6 shadow-sm sm:p-8" role="status">
      <div className="text-center">
        <span className={`mx-auto mb-4 flex size-14 items-center justify-center rounded-full ${t.icon}`}>
          <CheckCircle2 className="size-8" aria-hidden="true" />
        </span>
        <h2 className="text-2xl font-semibold sm:text-3xl">{isConfirmed ? 'Appointment confirmed' : 'Request received'}</h2>
        <p className="mx-auto mt-2 max-w-md text-ink-600">
          {isConfirmed
            ? 'Your appointment is confirmed. Please arrive a few minutes early.'
            : 'Thank you. Your appointment request has been received and is awaiting confirmation. Our team will contact you on the mobile number provided.'}
        </p>
      </div>

      <dl className="mt-6 divide-y divide-ink-100 rounded-lg border border-ink-100 px-5">
        <Row label="Reference"><span className="font-mono tracking-wide">{appointmentReference(appointment.id)}</span></Row>
        <Row label="Practice">{PRACTICES[appointment.practiceType]?.name}</Row>
        <Row label="Doctor">{appointment.doctorName || 'First available doctor'}</Row>
        <Row label="Service">{appointment.serviceName || 'General consultation'}</Row>
        <Row label="Preferred date">{formatDate(appointment.preferredDate)}</Row>
        <Row label="Preferred time">{formatTime(appointment.preferredTime)}</Row>
        <Row label="Patient">{appointment.patientName}</Row>
        <Row label="Mobile">{formatPhone(appointment.phone)}</Row>
        <Row label="Status">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${isConfirmed ? 'bg-ayur-100 text-ayur-800' : 'bg-gold-500/15 text-gold-600'}`}>
            <StatusIcon className="size-3.5" aria-hidden="true" /> {status.label}
          </span>
        </Row>
      </dl>

      {!isConfirmed && (
        <p className="mt-4 text-sm text-ink-600">
          The date and time above are your <strong>preferred</strong> slot. We will let you know if any change is needed. Please keep your reference handy.
        </p>
      )}

      <div className="mt-6 rounded-lg bg-ink-50 p-4 text-sm text-ink-700">
        Need to change something? Contact us on <strong>{contact.phone}</strong> and quote your reference.
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <CallButton practice={appointment.practiceType} />
        <WhatsAppButton
          practice={appointment.practiceType}
          message={`Hello, my appointment reference is ${appointmentReference(appointment.id)}. I have a question about my booking.`}
        />
        {onReset && (
          <Button variant="ghost" tone={appointment.practiceType} onClick={onReset}>Book another</Button>
        )}
        <Button to="/" variant="ghost" tone="main">Back to home</Button>
      </div>
    </div>
  );
}
