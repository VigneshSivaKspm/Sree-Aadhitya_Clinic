import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Check, HeartHandshake, Leaf, ShieldCheck, Smile, Stethoscope, UserRound } from 'lucide-react';
import { BRAND, PRACTICES } from '../../config/site';
import { toneFor } from '../../config/theme';
import { useSite } from '../../contexts/SiteContext';
import { useServices } from '../../hooks/useCatalog';
import { ServiceCard } from '../practice/Cards';
import Button from '../ui/Button';
import { Section, SectionHeading } from '../ui/Section';
import { AsyncBlock } from '../common/Sections';
import { CardGridSkeleton, DemoNotice } from '../ui/States';

const ICONS = { stethoscope: Stethoscope, heart: HeartHandshake, building: Building2, user: UserRound, shield: ShieldCheck };

export function HomeHero() {
  const { content } = useSite();
  const hero = content.main.hero;
  return (
    <section className="relative overflow-hidden bg-sand-100">
      <div className="container-page grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        <div>
          <p className="mb-4 text-xs font-semibold tracking-[0.16em] text-gold-600 uppercase">{hero.eyebrow}</p>
          <h1 className="text-3xl leading-[1.12] font-semibold text-balance break-words sm:text-4xl lg:text-[2.75rem]">{hero.title}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-600">{hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/ayurveda" tone="ayurveda" size="lg"><Leaf className="size-5" aria-hidden="true" /> Explore Ayurveda</Button>
            <Button to="/dental" tone="dental" size="lg"><Smile className="size-5" aria-hidden="true" /> Explore Dental</Button>
            <Button to="/appointments" variant="outline" size="lg">Book Appointment</Button>
          </div>
        </div>

        {hero.image ? (
          <img src={hero.image} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover shadow-lg" loading="eager" />
        ) : (
          <div className="grid grid-cols-2 gap-4" aria-hidden="true">
            <div className="flex aspect-[3/4] flex-col justify-end rounded-2xl bg-gradient-to-b from-ayur-600 to-ayur-800 p-5 text-white">
              <Leaf className="mb-auto size-12 opacity-80" strokeWidth={1.25} />
              <p className="font-serif text-xl leading-tight">Ayurvedic Hospital</p>
            </div>
            <div className="mt-10 flex aspect-[3/4] flex-col justify-end rounded-2xl bg-gradient-to-b from-dental-500 to-dental-800 p-5 text-white">
              <Smile className="mb-auto size-12 opacity-80" strokeWidth={1.25} />
              <p className="font-serif text-xl leading-tight">Dental Hospital</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

const PRACTICE_POINTS = {
  ayurveda: ['Consultations with Ayurvedic physicians', 'Traditional therapies planned individually', 'Ayurvedic products available online'],
  dental: ['Check-ups and preventive care', 'Restorative and cosmetic treatments', 'Care for children and adults'],
};

function PracticeCard({ practice }) {
  const p = PRACTICES[practice];
  const t = toneFor(practice);
  const Icon = practice === 'ayurveda' ? Leaf : Smile;
  return (
    <article className={`flex flex-col rounded-2xl border p-7 sm:p-9 ${t.softBorder} ${t.soft}`}>
      <span className={`mb-6 flex size-14 items-center justify-center rounded-xl ${t.solid.split(' hover')[0]}`}>
        <Icon className="size-7" aria-hidden="true" />
      </span>
      <h3 className="text-2xl font-semibold sm:text-3xl">{p.name}</h3>
      <p className="mt-2 text-ink-600">{p.tagline}</p>
      <ul className="mt-6 space-y-2.5 text-sm text-ink-700">
        {PRACTICE_POINTS[practice].map((point) => (
          <li key={point} className="flex gap-2.5"><Check className={`mt-0.5 size-4 shrink-0 ${t.text}`} aria-hidden="true" />{point}</li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button to={p.path} tone={practice}>Visit {practice === 'ayurveda' ? 'Ayurveda' : 'Dental'} <ArrowRight className="size-4" aria-hidden="true" /></Button>
        <Button to={`/appointments?practice=${practice}`} variant="outline" tone={practice}>Book</Button>
      </div>
    </article>
  );
}

export function PracticeSelection() {
  return (
    <Section>
      <SectionHeading align="center" eyebrow="Our practices" title="Choose the care you need" description="Two hospitals with their own doctors, treatments and appointment booking." />
      <div className="grid gap-6 lg:grid-cols-2">
        <PracticeCard practice="ayurveda" />
        <PracticeCard practice="dental" />
      </div>
    </Section>
  );
}

function ServiceColumn({ practice }) {
  const q = useServices(practice);
  const featured = q.data ? [...q.data].sort((a, b) => Number(!!b.featured) - Number(!!a.featured)).slice(0, 3) : q.data;
  const t = toneFor(practice);
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h3 className={`font-sans text-sm font-semibold tracking-wide uppercase ${t.text}`}>{PRACTICES[practice].shortName}</h3>
        <Link to={PRACTICES[practice].servicesPath} className={`text-sm font-medium ${t.text} hover:underline`}>View all</Link>
      </div>
      <AsyncBlock query={{ ...q, data: featured }} skeleton={<CardGridSkeleton count={3} cols="grid-cols-1" imageClass="h-28" />}>
        {(items) => <div className="grid gap-4">{items.map((s) => <ServiceCard key={s.id} service={s} compact />)}</div>}
      </AsyncBlock>
    </div>
  );
}

export function ServicesPreview() {
  const a = useServices('ayurveda');
  const d = useServices('dental');
  const demo = [...(a.data || []), ...(d.data || [])].some((s) => s.isDemo);
  return (
    <Section muted>
      <SectionHeading eyebrow="Treatments" title="Popular services" description="A selection of treatments from both hospitals." />
      <DemoNotice show={demo} />
      <div className="grid gap-10 lg:grid-cols-2">
        <ServiceColumn practice="ayurveda" />
        <ServiceColumn practice="dental" />
      </div>
    </Section>
  );
}

export function WhyChoose() {
  const { content } = useSite();
  return (
    <Section>
      <SectionHeading align="center" eyebrow={`Why ${BRAND.short}`} title="Care built around you" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {content.main.whyChoose.map((item) => {
          const Icon = ICONS[item.icon] || ShieldCheck;
          return (
            <div key={item.title} className="rounded-xl border border-ink-100 bg-white p-6">
              <span className="mb-4 flex size-11 items-center justify-center rounded-lg bg-ink-100 text-ink-800"><Icon className="size-5" aria-hidden="true" /></span>
              <h3 className="font-sans text-base font-semibold text-ink-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{item.text}</p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
