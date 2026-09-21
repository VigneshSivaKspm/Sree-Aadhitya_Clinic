import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import ContactSection from '../components/common/ContactSection';
import Button from '../components/ui/Button';
import { SelectField, TextAreaField, TextField } from '../components/ui/FormField';
import { PageHero, Section, SectionHeading } from '../components/ui/Section';
import { BRAND } from '../config/site';
import Seo from '../components/ui/Seo';
import { createEnquiry } from '../services/enquiryService';
import { getErrorMessage, logError } from '../utils/errors';
import { hasErrors, validators } from '../utils/validators';

const initial = { practiceType: 'general', name: '', phone: '', email: '', message: '' };

function EnquiryForm() {
  const [values, setValues] = useState(initial);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const errors = {
    name: validators.name(values.name),
    phone: validators.phone(values.phone),
    email: validators.email(values.email),
    message: validators.text(values.message, { label: 'Message', min: 5, max: 1500, required: true }),
  };
  const show = (f) => (touched[f] || submitted ? errors[f] : '');
  const bind = (f) => ({
    value: values[f],
    onChange: (e) => setValues((v) => ({ ...v, [f]: e.target.value })),
    onBlur: () => setTouched((t) => ({ ...t, [f]: true })),
    error: show(f),
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setSubmitted(true);
    setError('');
    if (hasErrors(errors)) {
      setTimeout(() => document.querySelector('form [aria-invalid="true"]')?.focus(), 0);
      return;
    }
    setBusy(true);
    try {
      await createEnquiry(values);
      setDone(true);
    } catch (err) {
      logError('enquiry', err);
      setError(getErrorMessage(err, 'We couldn’t send your message. Please try again or call us.'));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div role="status" className="rounded-xl border border-ink-100 bg-white p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 size-10 text-ayur-600" aria-hidden="true" />
        <h3 className="font-sans text-lg font-semibold">Message sent</h3>
        <p className="mt-2 text-sm text-ink-600">Thank you. Our team will get back to you on the mobile number provided.</p>
        <Button variant="ghost" className="mt-4" onClick={() => { setValues(initial); setTouched({}); setSubmitted(false); setDone(false); }}>Send another message</Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-xl border border-ink-100 bg-white p-6 sm:p-8" aria-label="Enquiry form">
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField label="Enquiry about" className="sm:col-span-2" value={values.practiceType} onChange={(e) => setValues((v) => ({ ...v, practiceType: e.target.value }))}>
          <option value="general">General</option>
          <option value="ayurveda">Ayurvedic Hospital</option>
          <option value="dental">Dental Hospital</option>
        </SelectField>
        <TextField label="Your name" required autoComplete="name" {...bind('name')} />
        <TextField label="Mobile number" required type="tel" inputMode="numeric" autoComplete="tel" {...bind('phone')} />
        <TextField label="Email (optional)" type="email" autoComplete="email" className="sm:col-span-2" {...bind('email')} />
        <TextAreaField label="Message" required rows={5} maxLength={1500} className="sm:col-span-2" placeholder="How can we help? Please do not include detailed medical records." {...bind('message')} />
      </div>
      {error && <p role="alert" className="mt-5 rounded-md border border-danger-600/20 bg-danger-50 px-4 py-3 text-sm text-danger-700">{error}</p>}
      <Button type="submit" size="lg" loading={busy} className="mt-6 w-full sm:w-auto">{busy ? 'Sending…' : 'Send message'}</Button>
    </form>
  );
}

export default function ContactPage() {
  return (
    <>
      <Seo title="Contact us" description={`Contact ${BRAND.fullName}.`} path="/contact" />
      <PageHero eyebrow="Contact" title="We’d love to hear from you" description="Send us an enquiry, or call or message us directly. For appointments, please use the booking form." />
      <Section>
        <div className="mx-auto max-w-2xl">
          <SectionHeading eyebrow="Enquiry" title="Send us a message" />
          <EnquiryForm />
        </div>
      </Section>
      <ContactSection muted />
    </>
  );
}
