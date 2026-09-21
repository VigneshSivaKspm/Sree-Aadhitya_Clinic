import { ArrowRight } from 'lucide-react';
import { toneFor } from '../../config/theme';
import { useDoctors, useFaqs, useProducts, useServices, useTestimonials, useCategories } from '../../hooks/useCatalog';
import { DoctorCard, ServiceCard, TestimonialCard } from '../practice/Cards';
import { ProductGrid } from '../shop/ProductCard';
import Button from '../ui/Button';
import FAQAccordion from '../ui/FAQAccordion';
import { Section, SectionHeading } from '../ui/Section';
import { CardGridSkeleton, DemoNotice, EmptyState, ErrorState } from '../ui/States';

/** Renders loading / error / empty / content states for a data hook result. */
export function AsyncBlock({ query, empty, skeleton, children }) {
  if (query.loading) return skeleton || <CardGridSkeleton />;
  if (query.error) return <ErrorState message={query.error} onRetry={query.reload} />;
  if (!query.data || (Array.isArray(query.data) && query.data.length === 0)) return empty || <EmptyState title="Nothing here yet" />;
  return children(query.data);
}

const hasDemo = (list) => Array.isArray(list) && list.some((x) => x.isDemo);

export function DoctorsSection({ practice, limit, muted, title = 'Our doctors', eyebrow = 'Meet the team', showAll }) {
  const q = useDoctors(practice);
  const list = q.data ? (limit ? q.data.slice(0, limit) : q.data) : q.data;
  return (
    <Section muted={muted} tone={practice} id="doctors">
      <SectionHeading
        tone={practice || 'main'}
        eyebrow={eyebrow}
        title={title}
        action={showAll && <Button to="/doctors" variant="outline" tone={practice || 'main'}>All doctors <ArrowRight className="size-4" aria-hidden="true" /></Button>}
      />
      <DemoNotice show={hasDemo(q.data)} />
      <AsyncBlock query={{ ...q, data: list }} empty={<EmptyState title="Doctor profiles coming soon" message="Our doctors’ profiles will be listed here shortly." />}>
        {(items) => (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((d) => <DoctorCard key={d.id} doctor={d} />)}
          </div>
        )}
      </AsyncBlock>
    </Section>
  );
}

export function TreatmentsSection({ practice, limit = 6, muted, title, eyebrow = 'Treatments', description, featuredFirst = true }) {
  const q = useServices(practice);
  let list = q.data;
  if (list && featuredFirst) list = [...list].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  if (list && limit) list = list.slice(0, limit);
  return (
    <Section muted={muted} tone={practice} id="treatments">
      <SectionHeading
        tone={practice}
        eyebrow={eyebrow}
        title={title || (practice === 'dental' ? 'Dental treatments' : 'Ayurvedic treatments')}
        description={description}
        action={<Button to={`/${practice}/services`} variant="outline" tone={practice}>View all treatments <ArrowRight className="size-4" aria-hidden="true" /></Button>}
      />
      <DemoNotice show={hasDemo(q.data)} />
      <AsyncBlock query={{ ...q, data: list }} empty={<EmptyState title="Treatments coming soon" message="Our list of treatments will appear here shortly." />}>
        {(items) => (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => <ServiceCard key={s.id} service={s} />)}
          </div>
        )}
      </AsyncBlock>
    </Section>
  );
}

export function StorePreview({ muted = true, limit = 4 }) {
  const products = useProducts();
  const categories = useCategories();
  const featured = products.data ? [...products.data].sort((a, b) => Number(!!b.featured) - Number(!!a.featured)).slice(0, limit) : products.data;
  return (
    <Section muted={muted} tone="ayurveda" id="store">
      <SectionHeading
        tone="ayurveda"
        eyebrow="Ayurvedic store"
        title="Featured products"
        description="Herbal and Ayurvedic products, delivered to your door."
        action={<Button to="/shop" variant="outline" tone="ayurveda">Visit the shop <ArrowRight className="size-4" aria-hidden="true" /></Button>}
      />
      <DemoNotice show={hasDemo(products.data)} />
      <AsyncBlock
        query={{ ...products, data: featured }}
        skeleton={<CardGridSkeleton count={4} cols="grid-cols-2 lg:grid-cols-4" imageClass="aspect-square h-auto" />}
        empty={<EmptyState title="Store opening soon" message="Our products will be listed here shortly." />}
      >
        {(items) => <ProductGrid products={items} categories={categories.data || []} />}
      </AsyncBlock>
    </Section>
  );
}

/** scope: 'main' | 'ayurveda' | 'dental'. Renders nothing when there are no testimonials. */
export function TestimonialsSection({ scope = 'main', muted }) {
  const q = useTestimonials(scope);
  if (!q.loading && !q.error && (!q.data || q.data.length === 0)) return null;
  return (
    <Section muted={muted} tone={scope} id="testimonials">
      <SectionHeading tone={scope} eyebrow="Patient feedback" title="What patients say" />
      <DemoNotice show={hasDemo(q.data)} />
      <AsyncBlock query={q} skeleton={<CardGridSkeleton count={3} imageClass="h-24" />}>
        {(items) => (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.slice(0, 6).map((t) => <TestimonialCard key={t.id} testimonial={t} />)}
          </div>
        )}
      </AsyncBlock>
    </Section>
  );
}

export function FaqSection({ practice, muted }) {
  const q = useFaqs(practice);
  if (!q.loading && !q.error && (!q.data || q.data.length === 0)) return null;
  return (
    <Section muted={muted} tone={practice} id="faqs">
      <div className="mx-auto max-w-3xl">
        <SectionHeading tone={practice} eyebrow="FAQs" title="Frequently asked questions" align="center" />
        <DemoNotice show={hasDemo(q.data)} />
        <AsyncBlock query={q} skeleton={<CardGridSkeleton count={1} cols="grid-cols-1" imageClass="h-32" />}>
          {(items) => <FAQAccordion items={items} />}
        </AsyncBlock>
      </div>
    </Section>
  );
}

export function AppointmentBand({ practice, title, text }) {
  const t = toneFor(practice);
  return (
    <section className={`${t.dark} py-14 sm:py-16`}>
      <div className="container-page flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">{title}</h2>
          <p className="mt-3 text-base text-white/80">{text}</p>
        </div>
        <Button to={practice ? `/appointments?practice=${practice}` : '/appointments'} variant="light" size="lg">
          Book appointment <ArrowRight className="size-5" aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
