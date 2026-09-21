import { CalendarCheck, Leaf, Smile } from 'lucide-react';
import { PRACTICES } from '../../config/site';
import { toneFor } from '../../config/theme';
import { useSite } from '../../contexts/SiteContext';
import AppointmentForm from '../appointment/AppointmentForm';
import { CallButton, WhatsAppButton } from '../common/ContactActions';
import Button from '../ui/Button';
import { Section, SectionHeading } from '../ui/Section';
import SmartImage from '../ui/SmartImage';

export function PracticeHero({ practice }) {
  const { content } = useSite();
  const hero = content[practice].hero;
  const t = toneFor(practice);
  const Icon = practice === 'ayurveda' ? Leaf : Smile;
  return (
    <section className={`${t.dark} relative overflow-hidden`}>
      <div className="container-page grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-4 text-xs font-semibold tracking-[0.16em] text-white/70 uppercase">{PRACTICES[practice].tagline}</p>
          <h1 className="text-4xl leading-[1.1] font-semibold text-balance text-white sm:text-5xl">{hero.title}</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">{hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to={`/appointments?practice=${practice}`} variant="light" size="lg"><CalendarCheck className="size-5" aria-hidden="true" /> Book Appointment</Button>
            <CallButton practice={practice} size="lg" className="!border-white/60 !text-white hover:!bg-white/10" />
            <WhatsAppButton practice={practice} size="lg" className="!border-white/60 !text-white hover:!bg-white/10" />
          </div>
        </div>
        {hero.image ? (
          <img src={hero.image} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover" loading="eager" />
        ) : (
          <div className="hidden aspect-[4/3] items-center justify-center rounded-2xl bg-white/10 lg:flex" aria-hidden="true">
            <Icon className="size-24 text-white/40" strokeWidth={1} />
          </div>
        )}
      </div>
    </section>
  );
}

export function PracticeAbout({ practice, muted }) {
  const { content } = useSite();
  const about = content[practice].about;
  return (
    <Section id="about" muted={muted} tone={practice}>
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <SmartImage src={about.image} alt={about.image ? about.title : ''} kind={practice} className="aspect-[4/3] w-full rounded-2xl" iconClass="size-20" />
        <div>
          <p className={`mb-2 text-xs font-semibold tracking-[0.14em] uppercase ${toneFor(practice).eyebrow}`}>About the hospital</p>
          <h2 className="text-3xl font-semibold sm:text-4xl">{about.title}</h2>
          <p className="mt-4 text-base leading-relaxed whitespace-pre-line text-ink-600">{about.body}</p>
        </div>
      </div>
    </Section>
  );
}

export function AppointmentSection({ practice, muted = true }) {
  return (
    <Section id="appointment" muted={muted} tone={practice}>
      <SectionHeading tone={practice} align="center" eyebrow="Appointments" title="Book an appointment" description="Choose a treatment and doctor, and tell us when suits you. We’ll contact you to confirm." />
      <div className="mx-auto max-w-3xl">
        <AppointmentForm practice={practice} lockPractice />
      </div>
    </Section>
  );
}

export function Disclaimer() {
  const { settings } = useSite();
  return <p className="mt-8 rounded-md bg-ink-50 px-4 py-3 text-xs leading-relaxed text-ink-600">{settings.disclaimer}</p>;
}
