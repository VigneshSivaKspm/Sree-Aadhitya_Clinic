import {
  HomeHero,
  PracticeSelection,
  ServicesPreview,
  WhyChoose,
} from "../components/home/HomeSections";
import {
  AppointmentBand,
  DoctorsSection,
  StorePreview,
  TestimonialsSection,
} from "../components/common/Sections";
import ContactSection from "../components/common/ContactSection";
import { BRAND } from "../config/site";
import Seo from "../components/ui/Seo";
import { useSite } from "../contexts/SiteContext";

export default function HomePage() {
  const { content } = useSite();
  const cta = content.main.appointmentCta;
  return (
    <>
      <Seo
        description={`${BRAND.fullName} — book appointments online, explore Siddha and dental treatments and shop Ayurvedic products.`}
        path="/"
        image="/og-main.png"
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
