import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { DoctorsSection } from '../components/common/Sections';
import { WhyChoose } from '../components/home/HomeSections';
import Button from '../components/ui/Button';
import { PageHero, Section } from '../components/ui/Section';
import Seo from '../components/ui/Seo';
import { useSite } from '../contexts/SiteContext';

export default function AboutPage() {
  const { content } = useSite();
  const about = content.main.about;
  return (
    <>
      <Seo title="About us" description="About Shree Aadhitya Ayurvedic Hospital and Shree Aadhitya Dental Hospital." path="/about" />
      <PageHero eyebrow="About" title={about.title} />
      <Section>
        <div className="mx-auto max-w-3xl">
          <p className="text-lg leading-relaxed whitespace-pre-line text-ink-700">{about.body}</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Link to="/ayurveda" className="group rounded-xl border border-ayur-100 bg-ayur-50 p-6 hover:shadow-md">
              <h2 className="font-sans text-lg font-semibold text-ayur-800">Ayurvedic Hospital</h2>
              <p className="mt-1 text-sm text-ink-600">Consultations and traditional therapies.</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-ayur-700">Visit <ArrowRight className="size-4" aria-hidden="true" /></span>
            </Link>
            <Link to="/dental" className="group rounded-xl border border-dental-100 bg-dental-50 p-6 hover:shadow-md">
              <h2 className="font-sans text-lg font-semibold text-dental-800">Dental Hospital</h2>
              <p className="mt-1 text-sm text-ink-600">Preventive, restorative and cosmetic dental care.</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-dental-700">Visit <ArrowRight className="size-4" aria-hidden="true" /></span>
            </Link>
          </div>
        </div>
      </Section>
      <WhyChoose />
      <DoctorsSection limit={4} muted showAll />
      <Section>
        <div className="text-center">
          <Button to="/appointments" size="lg">Book an appointment</Button>
        </div>
      </Section>
    </>
  );
}
