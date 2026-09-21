import { Leaf, Smile } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BRAND } from '../../config/site';

/**
 * PLACEHOLDER logo — replace the marks below with the real brand assets once supplied.
 * practice: undefined (group) | 'ayurveda' | 'dental'
 */
export function LogoMark({ practice, className = 'size-10' }) {
  if (practice === 'ayurveda') {
    return (
      <span className={`flex items-center justify-center rounded-lg bg-ayur-700 text-white ${className}`}>
        <Leaf className="size-1/2" aria-hidden="true" />
      </span>
    );
  }
  if (practice === 'dental') {
    return (
      <span className={`flex items-center justify-center rounded-lg bg-dental-600 text-white ${className}`}>
        <Smile className="size-1/2" aria-hidden="true" />
      </span>
    );
  }
  return (
    <span className={`relative flex overflow-hidden rounded-lg ${className}`} aria-hidden="true">
      <span className="flex w-1/2 items-center justify-center bg-ayur-700 text-white">
        <Leaf className="size-4/5 translate-x-[15%]" />
      </span>
      <span className="flex w-1/2 items-center justify-center bg-dental-600 text-white">
        <Smile className="size-4/5 -translate-x-[15%]" />
      </span>
    </span>
  );
}

export default function Logo({ practice, inverted = false, className = '' }) {
  const sub = practice === 'ayurveda' ? 'Ayurvedic Hospital' : practice === 'dental' ? 'Dental Hospital' : BRAND.descriptor;
  const subShort = practice ? sub : BRAND.shortDescriptor;
  return (
    <Link to="/" className={`inline-flex items-center gap-3 ${className}`} aria-label={`${BRAND.fullName} — home`}>
      <LogoMark practice={practice} />
      <span className="leading-tight whitespace-nowrap">
        <span className={`block font-serif text-lg font-semibold ${inverted ? 'text-white' : 'text-ink-900'}`}>{BRAND.short}</span>
        <span className={`block text-[11px] font-medium tracking-[0.16em] uppercase ${inverted ? 'text-white/70' : 'text-ink-500'}`}><span className="hidden sm:inline">{sub}</span><span className="sm:hidden">{subShort}</span></span>
      </span>
    </Link>
  );
}
