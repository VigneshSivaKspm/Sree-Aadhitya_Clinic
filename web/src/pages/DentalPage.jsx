import { Sparkles } from 'lucide-react';
import ContactSection from '../components/common/ContactSection';
import { DoctorsSection, FaqSection, TestimonialsSection, TreatmentsSection } from '../components/common/Sections';
import { AppointmentSection, Disclaimer, PracticeAbout, PracticeHero } from '../components/practice/PracticeSections';
import { Section, SectionHeading } from '../components/ui/Section';
import Seo from '../components/ui/Seo';
import { useSite } from '../contexts/SiteContext';

function Facilities() {
  const { content } = useSite();
  return (
    <Section id="facilities" tone="dental">
      <SectionHeading tone="dental" align="center" eyebrow="Facilities" title="Our facilities" />
      <div className="grid gap-6 md:grid-cols-3">
        {content.dental.facilities.map((f) => (
          <div key={f.title} className="rounded-xl border border-dental-100 bg-dental-50 p-6">
            <span className="mb-4 flex size-11 items-center justify-center rounded-lg bg-dental-100 text-dental-700"><Sparkles className="size-5" aria-hidden="true" /></span>
            <h3 className="font-sans text-base font-semibold text-ink-900">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{f.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export default function DentalPage() {
  const { content } = useSite();
  return (
    <>
      <Seo title="Dental Hospital" description={content.dental.hero.subtitle} path="/dental" />
      <PracticeHero practice="dental" />
      <PracticeAbout practice="dental" />
      <TreatmentsSection practice="dental" muted description="Dental care from routine check-ups to specialised treatments." />
      <DoctorsSection practice="dental" title="Our dental doctors" />
      <Facilities />
      <AppointmentSection practice="dental" />
      <TestimonialsSection scope="dental" />
      <FaqSection practice="dental" muted />
      <ContactSection practice="dental" />
      <div className="container-page pb-12"><Disclaimer /></div>
    </>
  );
}
