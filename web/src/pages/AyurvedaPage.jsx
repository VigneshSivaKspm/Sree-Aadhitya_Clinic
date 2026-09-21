import ContactSection from '../components/common/ContactSection';
import { DoctorsSection, StorePreview, TestimonialsSection, TreatmentsSection, FaqSection } from '../components/common/Sections';
import { AppointmentSection, Disclaimer, PracticeAbout, PracticeHero } from '../components/practice/PracticeSections';
import Seo from '../components/ui/Seo';
import { useSite } from '../contexts/SiteContext';

export default function AyurvedaPage() {
  const { content } = useSite();
  return (
    <>
      <Seo title="Ayurvedic Hospital" description={content.ayurveda.hero.subtitle} path="/ayurveda" />
      <PracticeHero practice="ayurveda" />
      <PracticeAbout practice="ayurveda" />
      <TreatmentsSection practice="ayurveda" muted description="Traditional Ayurvedic consultations and therapies. Suitability is assessed by the physician." />
      <DoctorsSection practice="ayurveda" title="Our Ayurvedic doctors" />
      <AppointmentSection practice="ayurveda" />
      <StorePreview muted={false} />
      <TestimonialsSection scope="ayurveda" muted />
      <FaqSection practice="ayurveda" />
      <ContactSection practice="ayurveda" muted />
      <div className="container-page pb-12"><Disclaimer /></div>
    </>
  );
}
