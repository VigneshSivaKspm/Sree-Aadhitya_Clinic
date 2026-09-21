import { Link, useParams } from 'react-router-dom';
import { CalendarCheck, Check, ChevronRight, Clock } from 'lucide-react';
import { CallButton, WhatsAppButton } from '../components/common/ContactActions';
import { ServiceCard, DoctorCard } from '../components/practice/Cards';
import { Disclaimer } from '../components/practice/PracticeSections';
import Button from '../components/ui/Button';
import Seo from '../components/ui/Seo';
import SmartImage from '../components/ui/SmartImage';
import { ErrorState, PageSkeleton } from '../components/ui/States';
import { PRACTICES } from '../config/site';
import { toneFor } from '../config/theme';
import { useDoctors, useService, useServices } from '../hooks/useCatalog';
import NotFoundPage from './NotFoundPage';

export default function ServiceDetailPage({ practice }) {
  const { slug } = useParams();
  const p = PRACTICES[practice];
  const t = toneFor(practice);
  const q = useService(practice, slug);
  const doctorsQ = useDoctors(practice);
  const servicesQ = useServices(practice);

  if (q.loading) return <PageSkeleton />;
  if (q.error) return <div className="container-page py-16"><ErrorState message={q.error} onRetry={q.reload} /></div>;
  if (!q.data) return <NotFoundPage title="Treatment not found" message="This treatment may have been removed or is no longer available." backTo={p.servicesPath} backLabel="All treatments" />;

  const s = q.data;
  const doctors = (doctorsQ.data || []).filter((d) => !s.doctorIds?.length || s.doctorIds.includes(d.id)).slice(0, 4);
  const related = (servicesQ.data || []).filter((x) => x.id !== s.id).slice(0, 3);

  return (
    <>
      <Seo title={s.seoTitle || `${s.name} — ${p.shortName}`} description={s.seoDescription || s.shortDescription} path={`${p.servicesPath}/${s.slug}`} image={s.image} />

      <div className={`border-b ${t.softBorder} ${t.soft}`}>
        <div className="container-page py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-ink-500">
            <Link to={p.path} className="hover:underline">{p.shortName}</Link>
            <ChevronRight className="size-4" aria-hidden="true" />
            <Link to={p.servicesPath} className="hover:underline">Treatments</Link>
            <ChevronRight className="size-4" aria-hidden="true" />
            <span className="text-ink-800" aria-current="page">{s.name}</span>
          </nav>
          <h1 className="max-w-3xl text-4xl font-semibold sm:text-5xl">{s.name}</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-600">{s.shortDescription}</p>
          {s.isDemo && <p className="mt-4 inline-block rounded bg-gold-500/15 px-2.5 py-1 text-sm font-medium text-gold-600">Sample content — placeholder text</p>}
        </div>
      </div>

      <div className="container-page grid gap-12 py-12 lg:grid-cols-[1fr_340px]">
        <article>
          <SmartImage src={s.image} alt={s.image ? s.name : ''} kind={practice} className="mb-8 aspect-[16/9] w-full rounded-2xl" iconClass="size-20" />
          <h2 className="text-2xl font-semibold">About this treatment</h2>
          <p className="mt-4 leading-relaxed whitespace-pre-line text-ink-700">{s.fullDescription || s.shortDescription}</p>

          {s.benefits?.length > 0 && (
            <>
              <h2 className="mt-10 text-2xl font-semibold">What to expect</h2>
              <ul className="mt-4 space-y-3">
                {s.benefits.map((b) => (
                  <li key={b} className="flex gap-3 text-ink-700"><Check className={`mt-0.5 size-5 shrink-0 ${t.text}`} aria-hidden="true" />{b}</li>
                ))}
              </ul>
            </>
          )}
          <Disclaimer />
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-ink-100 bg-white p-6 shadow-sm">
            <h2 className="font-sans text-lg font-semibold">Book this treatment</h2>
            {s.duration && (
              <p className="mt-3 flex items-center gap-2 text-sm text-ink-600"><Clock className="size-4" aria-hidden="true" /> Typical duration: {s.duration}</p>
            )}
            <div className="mt-5 space-y-3">
              <Button to={`/appointments?practice=${practice}&service=${s.id}`} tone={practice} size="lg" className="w-full">
                <CalendarCheck className="size-5" aria-hidden="true" /> Book appointment
              </Button>
              <CallButton practice={practice} className="w-full" />
              <WhatsAppButton practice={practice} className="w-full" message={`Hello, I would like to know more about ${s.name} at ${p.name}.`} />
            </div>
          </div>
        </aside>
      </div>

      {doctors.length > 0 && (
        <section className="border-t border-ink-100 bg-white py-14">
          <div className="container-page">
            <h2 className="mb-8 text-2xl font-semibold">Doctors</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{doctors.map((d) => <DoctorCard key={d.id} doctor={d} />)}</div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="py-14">
          <div className="container-page">
            <h2 className="mb-8 text-2xl font-semibold">Other treatments</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{related.map((r) => <ServiceCard key={r.id} service={r} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}
