import { Link } from "react-router-dom";
import { BRAND } from "../../config/site";

/**
 * PLACEHOLDER logo — replace the marks below with the real brand assets once supplied.
 * practice: undefined (group) | 'ayurveda' | 'dental'
 */
export function LogoMark({ practice, className = "size-10" }) {
  let src = "/logo-main.png";
  let alt = "Sree Aadhityaa";
  if (practice === "ayurveda") {
    src = "/logo-ayurveda.png";
    alt = "Sree Aadhityaa Ayurveda";
  } else if (practice === "dental") {
    src = "/logo-dental.png";
    alt = "Sree Aadhityaa Dental";
  }
  return (
    <img
      src={src}
      alt={alt}
      className={`rounded-lg object-contain ${className}`}
      width={40}
      height={40}
    />
  );
}

export default function Logo({ practice, inverted = false, className = "" }) {
  const sub =
    practice === "ayurveda"
      ? "Ayurvedic Hospital"
      : practice === "dental"
        ? "Dental Hospital"
        : BRAND.descriptor;
  const subShort = practice ? sub : BRAND.shortDescriptor;
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-3 ${className}`}
      aria-label={`${BRAND.fullName} — home`}
    >
      <LogoMark practice={practice} />
      <span className="leading-tight whitespace-nowrap">
        <span
          className={`block font-serif text-lg font-semibold ${inverted ? "text-white" : "text-ink-900"}`}
        >
          {BRAND.short}
        </span>
        <span
          className={`block text-[11px] font-medium tracking-[0.16em] uppercase ${inverted ? "text-white/70" : "text-ink-500"}`}
        >
          <span className="hidden sm:inline">{sub}</span>
          <span className="sm:hidden">{subShort}</span>
        </span>
      </span>
    </Link>
  );
}
