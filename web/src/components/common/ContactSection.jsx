import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { BRAND, PRACTICES } from '../../config/site';
import { toneFor } from '../../config/theme';
import { useSite } from '../../contexts/SiteContext';
import { mapsSearchHref, telHref } from '../../utils/contact';
import { Section, SectionHeading } from '../ui/Section';
import { CallButton, WhatsAppButton } from './ContactActions';

function Row({ icon: Icon, label, children, tone }) {
  const t = toneFor(tone);
  return (
    <div className="flex gap-4">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${t.icon}`}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-medium text-ink-500">{label}</p>
        <div className="mt-0.5 text-base text-ink-900">{children}</div>
      </div>
    </div>
  );
}

/** Contact details + map. `practice` picks practice-specific overrides when present. */
export default function ContactSection({ practice, id = 'contact', muted = false }) {
  const { contactFor } = useSite();
  const c = contactFor(practice);
  const tone = practice || 'main';
  const title = practice ? PRACTICES[practice].name : BRAND.fullName;

  return (
    <Section id={id} muted={muted} tone={practice}>
      <SectionHeading tone={tone} eyebrow="Contact" title="Visit or get in touch" description={title} />
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <Row icon={MapPin} label="Address" tone={tone}>
            <a href={mapsSearchHref(c.address)} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {c.address}
            </a>
          </Row>
          <Row icon={Phone} label="Phone" tone={tone}>
            <a href={telHref(c.phone)} className="hover:underline">{c.phone}</a>
          </Row>
          <Row icon={Mail} label="Email" tone={tone}>
            <a href={`mailto:${c.email}`} className="break-all hover:underline">{c.email}</a>
          </Row>
          <Row icon={Clock} label="Working hours" tone={tone}>
            <span className="whitespace-pre-line">{c.workingHours}</span>
          </Row>
          <div className="flex flex-wrap gap-3 pt-2">
            <CallButton practice={practice} variant="primary" />
            <WhatsAppButton practice={practice} />
          </div>
        </div>

        <div className="min-h-64 overflow-hidden rounded-xl border border-ink-200 bg-ink-50">
          {c.mapUrl ? (
            <iframe title={`Map showing ${title}`} src={c.mapUrl} className="h-full min-h-72 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          ) : (
            <div className="flex h-full min-h-72 flex-col items-center justify-center gap-2 p-6 text-center text-ink-500">
              <MapPin className="size-8" aria-hidden="true" />
              <p className="text-sm">Map location will appear here once it is added from the admin panel.</p>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
