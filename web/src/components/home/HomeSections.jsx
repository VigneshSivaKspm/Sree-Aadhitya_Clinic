import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
  Leaf,
  ShieldCheck,
  Smile,
  Sparkles,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { BRAND, PRACTICES } from "../../config/site";
import { toneFor } from "../../config/theme";
import { useSite } from "../../contexts/SiteContext";
import { useServices } from "../../hooks/useCatalog";
import { ServiceCard } from "../practice/Cards";
import Button from "../ui/Button";
import { Section, SectionHeading } from "../ui/Section";
import { AsyncBlock } from "../common/Sections";
import { CardGridSkeleton, DemoNotice } from "../ui/States";

const ICONS = {
  stethoscope: Stethoscope,
  heart: HeartHandshake,
  building: Building2,
  user: UserRound,
  shield: ShieldCheck,
};

const SLIDE_DURATION = 3000; // ms

const HERO_SLIDES = [
  {
    id: "ayurveda",
    practice: "ayurveda",
    tabLabel: "Ayurvedic Hospital",
    eyebrow: "Traditional Siddha & Ayurvedic Medicine",
    title: "Root-Cause Healing with Classical Ayurveda & Siddha",
    subtitle:
      "Personalised consultations with Ayurvedic physicians, authentic Panchakarma programmes, and time-tested herbal remedies in a tranquil clinical setting.",
    image: "/ayurveda-hero.png",
    alt: "Ayurvedic therapy room with wooden massage table, linen, and floating marigold petals",
    badgeText: "Authentic Holistic Care",
    highlights: [
      "Physician-Guided Therapies",
      "Panchakarma Programmes",
      "Herbal Pharmacy Online",
    ],
    primaryBtn: {
      to: "/ayurveda",
      label: "Explore Ayurveda",
      tone: "ayurveda",
    },
    secondaryBtn: {
      to: "/appointments?practice=ayurveda",
      label: "Book Appointment",
      tone: "ayurveda",
    },
    pillBg: "bg-ayur-700 text-white shadow-md shadow-ayur-900/20",
    pillInactive: "text-ink-700 hover:bg-ayur-100/70",
    badgeStyle: "bg-ayur-100 text-ayur-800 border-ayur-200",
    gradientAura: "from-ayur-600/10 via-ayur-500/5 to-transparent",
  },
  {
    id: "dental",
    practice: "dental",
    tabLabel: "Dental Hospital",
    eyebrow: "Advanced Multispeciality Dentistry",
    title: "Gentle, Modern Dental Care Designed for Every Smile",
    subtitle:
      "Comprehensive dental healthcare from routine preventive check-ups and gentle root canals to cosmetic smile design and implants in a spotless environment.",
    image: "/dental-hero.png",
    alt: "Modern, spotless dental treatment room with comfortable dental chair and daylight",
    badgeText: "Modern Advanced Clinic",
    highlights: [
      "Rigorous Multi-Step Sterilisation",
      "Child-Friendly Dental Care",
      "Cosmetic & Implant Specialists",
    ],
    primaryBtn: {
      to: "/dental",
      label: "Explore Dental",
      tone: "dental",
    },
    secondaryBtn: {
      to: "/appointments?practice=dental",
      label: "Book Appointment",
      tone: "dental",
    },
    pillBg: "bg-dental-600 text-white shadow-md shadow-dental-900/20",
    pillInactive: "text-ink-700 hover:bg-dental-100/70",
    badgeStyle: "bg-dental-100 text-dental-800 border-dental-200",
    gradientAura: "from-dental-600/10 via-dental-500/5 to-transparent",
  },
];

export function HomeHero() {
  const [activeIdx, setActiveIdx] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const activeSlide = HERO_SLIDES[activeIdx];
  const Icon = activeSlide.practice === "ayurveda" ? Leaf : Smile;

  const nextSlide = useCallback(() => {
    setActiveIdx((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setActiveIdx(
      (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length,
    );
  }, []);

  const goToSlide = (idx) => {
    setActiveIdx(idx);
  };

  // Auto-scrolling: changes automatically every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, [activeIdx]);

  // Touch gesture handling
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  return (
    <section
      className="relative overflow-hidden bg-sand-100 transition-colors duration-700"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Care practices overview"
    >
      {/* Background ambient radial aura */}
      <div
        className={`pointer-events-none absolute -top-24 left-1/2 -z-0 h-[520px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b ${activeSlide.gradientAura} blur-3xl transition-all duration-700`}
        aria-hidden="true"
      />

      <div className="container-page relative z-10 py-10 sm:py-14 lg:py-20">
        {/* Top Header: Practice Selector Tabs & Controls */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Practice Switcher Tabs */}
          <div
            role="tablist"
            aria-label="Practice slides"
            className="inline-flex w-fit items-center rounded-full border border-ink-200/80 bg-white/80 p-1.5 backdrop-blur-md"
          >
            {HERO_SLIDES.map((slide, idx) => {
              const isActive = idx === activeIdx;
              const TabIcon = slide.practice === "ayurveda" ? Leaf : Smile;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => goToSlide(idx)}
                  className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wide uppercase transition-all duration-300 sm:px-5 sm:text-sm ${
                    isActive ? slide.pillBg : slide.pillInactive
                  }`}
                >
                  <TabIcon className="size-4 shrink-0" aria-hidden="true" />
                  <span>{slide.tabLabel}</span>
                  {isActive && (
                    <span className="hidden sm:inline-block size-1.5 rounded-full bg-white/80 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Carousel controls: Prev & Next */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={prevSlide}
              className="flex size-9 items-center justify-center rounded-full border border-ink-200 bg-white/90 text-ink-700 shadow-sm transition hover:bg-white hover:text-ink-900 focus:ring-2 focus:ring-ink-300"
              aria-label="Previous slide"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="flex size-9 items-center justify-center rounded-full border border-ink-200 bg-white/90 text-ink-700 shadow-sm transition hover:bg-white hover:text-ink-900 focus:ring-2 focus:ring-ink-300"
              aria-label="Next slide"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Hero Main Content Grid */}
        <div
          key={activeSlide.id}
          className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14"
        >
          {/* Left Text & CTAs */}
          <div className="flex flex-col">
            {/* Eyebrow badge */}
            <div className="mb-4 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase ${activeSlide.badgeStyle}`}
              >
                <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                {activeSlide.eyebrow}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl leading-[1.12] font-semibold text-balance text-ink-950 sm:text-4xl lg:text-[2.85rem]">
              {activeSlide.title}
            </h1>

            {/* Subtitle */}
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-700 sm:text-lg">
              {activeSlide.subtitle}
            </p>

            {/* Highlight pills */}
            <ul className="mt-6 flex flex-wrap gap-2.5 text-xs font-medium text-ink-800 sm:text-sm">
              {activeSlide.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200/70 bg-white/70 px-3 py-1.5 backdrop-blur-sm"
                >
                  <Check
                    className="size-3.5 text-gold-600 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Button
                to={activeSlide.primaryBtn.to}
                tone={activeSlide.primaryBtn.tone}
                size="lg"
                className="group shadow-md"
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                {activeSlide.primaryBtn.label}
                <ArrowRight
                  className="size-4 shrink-0 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Button>
              <Button
                to={activeSlide.secondaryBtn.to}
                variant="outline"
                tone={activeSlide.secondaryBtn.tone}
                size="lg"
              >
                <CalendarCheck className="size-4 shrink-0" aria-hidden="true" />
                {activeSlide.secondaryBtn.label}
              </Button>
            </div>
          </div>

          {/* Right Image Display Card */}
          <div className="relative">
            <div className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white p-2 shadow-xl ring-1 ring-ink-900/5">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-ink-100">
                <img
                  src={activeSlide.image}
                  alt={activeSlide.alt}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/40 via-transparent to-transparent" />
              </div>

              {/* Floating feature badge */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-xl border border-white/40 bg-white/90 p-4 shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex size-10 items-center justify-center rounded-lg ${
                      activeSlide.practice === "ayurveda"
                        ? "bg-ayur-700 text-white"
                        : "bg-dental-600 text-white"
                    }`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold tracking-wider text-ink-500 uppercase">
                      {activeSlide.tabLabel}
                    </p>
                    <p className="text-sm font-semibold text-ink-900">
                      {activeSlide.badgeText}
                    </p>
                  </div>
                </div>

                <Link
                  to={activeSlide.primaryBtn.to}
                  className={`inline-flex items-center gap-1 text-xs font-semibold ${
                    activeSlide.practice === "ayurveda"
                      ? "text-ayur-700 hover:text-ayur-800"
                      : "text-dental-700 hover:text-dental-800"
                  } hover:underline`}
                >
                  <span>Learn more</span>
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const PRACTICE_POINTS = {
  ayurveda: [
    "Led by Dr. M. S. Rajamohan, MD (Siddha) NIS",
    "Specialized pediatric, spine, joint & gastrointestinal care",
    "Traditional herbal & cosmetic products online",
  ],
  dental: [
    "Check-ups and preventive care",
    "Restorative and cosmetic treatments",
    "Care for children and adults",
  ],
};

function PracticeCard({ practice }) {
  const p = PRACTICES[practice];
  const t = toneFor(practice);
  const Icon = practice === "ayurveda" ? Leaf : Smile;
  return (
    <article
      className={`flex flex-col rounded-2xl border p-7 sm:p-9 ${t.softBorder} ${t.soft}`}
    >
      <span
        className={`mb-6 flex size-14 items-center justify-center rounded-xl ${t.solid.split(" hover")[0]}`}
      >
        <Icon className="size-7" aria-hidden="true" />
      </span>
      <h3 className="text-2xl font-semibold sm:text-3xl">{p.name}</h3>
      <p className="mt-2 text-ink-600">{p.tagline}</p>
      <ul className="mt-6 space-y-2.5 text-sm text-ink-700">
        {PRACTICE_POINTS[practice].map((point) => (
          <li key={point} className="flex gap-2.5">
            <Check
              className={`mt-0.5 size-4 shrink-0 ${t.text}`}
              aria-hidden="true"
            />
            {point}
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button to={p.path} tone={practice}>
          Visit {practice === "ayurveda" ? "Siddha & Ayurveda" : "Dental"}{" "}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
        <Button
          to={`/appointments?practice=${practice}`}
          variant="outline"
          tone={practice}
        >
          Book
        </Button>
      </div>
    </article>
  );
}

export function PracticeSelection() {
  return (
    <Section>
      <SectionHeading
        align="center"
        eyebrow="Our practices"
        title="Choose the care you need"
        description="Two hospitals with their own doctors, treatments and appointment booking."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <PracticeCard practice="ayurveda" />
        <PracticeCard practice="dental" />
      </div>
    </Section>
  );
}

function ServiceColumn({ practice }) {
  const q = useServices(practice);
  const featured = q.data
    ? [...q.data]
        .sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
        .slice(0, 3)
    : q.data;
  const t = toneFor(practice);
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h3
          className={`font-sans text-sm font-semibold tracking-wide uppercase ${t.text}`}
        >
          {PRACTICES[practice].shortName}
        </h3>
        <Link
          to={PRACTICES[practice].servicesPath}
          className={`text-sm font-medium ${t.text} hover:underline`}
        >
          View all
        </Link>
      </div>
      <AsyncBlock
        query={{ ...q, data: featured }}
        skeleton={
          <CardGridSkeleton count={3} cols="grid-cols-1" imageClass="h-28" />
        }
      >
        {(items) => (
          <div className="grid gap-4">
            {items.map((s) => (
              <ServiceCard key={s.id} service={s} compact />
            ))}
          </div>
        )}
      </AsyncBlock>
    </div>
  );
}

export function ServicesPreview() {
  const a = useServices("ayurveda");
  const d = useServices("dental");
  const demo = [...(a.data || []), ...(d.data || [])].some((s) => s.isDemo);
  return (
    <Section muted>
      <SectionHeading
        eyebrow="Treatments"
        title="Popular services"
        description="A selection of treatments from both hospitals."
      />
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
      <SectionHeading
        align="center"
        eyebrow={`Why ${BRAND.short}`}
        title="Care built around you"
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {content.main.whyChoose.map((item) => {
          const Icon = ICONS[item.icon] || ShieldCheck;
          return (
            <div
              key={item.title}
              className="rounded-xl border border-ink-100 bg-white p-6"
            >
              <span className="mb-4 flex size-11 items-center justify-center rounded-lg bg-ink-100 text-ink-800">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="font-sans text-base font-semibold text-ink-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {item.text}
              </p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
