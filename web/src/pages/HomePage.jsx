import { HomeHero, PracticeSelection, ServicesPreview, WhyChoose } from '../components/home/HomeSections';
import { AppointmentBand, DoctorsSection, StorePreview, TestimonialsSection } from '../components/common/Sections';
import ContactSection from '../components/common/ContactSection';
import Seo from '../components/ui/Seo';
import { useSite } from '../contexts/SiteContext';

export default function HomePage() {
  const { content } = useSite();
  const cta = content.main.appointmentCta;
  return (
    <>
      <Seo
        description="Shree Aadhitya Ayurvedic Hospital and Shree Aadhitya Dental Hospital — book appointments online, explore treatments and shop Ayurvedic products."
        path="/"
      />
      <HomeHero />
      <PracticeSelection />
      <ServicesPreview />
      <WhyChoose />
      <DoctorsSection limit={4} muted showAll />
      <AppointmentBand title={cta.title} text={cta.text} />
      <StorePreview />
      <TestimonialsSection scope="main" />
      <ContactSection muted />
    </>
  );
}
