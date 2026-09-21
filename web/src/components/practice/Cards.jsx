import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Quote, Star } from 'lucide-react';
import { toneFor } from '../../config/theme';
import { truncate } from '../../utils/format';
import SmartImage from '../ui/SmartImage';

export function ServiceCard({ service, compact = false }) {
  const practice = service.practiceType;
  const t = toneFor(practice);
  if (compact) {
    return (
      <Link
        to={`/${practice}/services/${service.slug}`}
        className="group flex items-center gap-4 rounded-xl border border-ink-100 bg-white p-3 transition-shadow hover:shadow-md"
      >
        <SmartImage src={service.image} alt="" kind={practice} className="size-20 shrink-0 rounded-lg" iconClass="size-7" />
        <div className="min-w-0 flex-1">
          <h3 className="font-sans text-base font-semibold text-ink-900">{service.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-ink-600">{service.shortDescription}</p>
        </div>
        <ArrowRight className={`size-5 shrink-0 ${t.text} transition-transform group-hover:translate-x-0.5`} aria-hidden="true" />
      </Link>
    );
  }
  return (
    <Link
      to={`/${practice}/services/${service.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-ink-100 bg-white transition-shadow hover:shadow-md"
    >
      <SmartImage src={service.image} alt={service.image ? service.name : ''} kind={practice} className="aspect-[16/10] w-full" />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-sans text-lg font-semibold text-ink-900">{service.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600">{truncate(service.shortDescription, 130)}</p>
        <div className="mt-4 flex items-center justify-between text-sm">
          {service.duration ? (
            <span className="inline-flex items-center gap-1.5 text-ink-500">
              <Clock className="size-4" aria-hidden="true" /> {service.duration}
            </span>
          ) : (
            <span />
          )}
          <span className={`inline-flex items-center gap-1 font-medium ${t.text}`}>
            Learn more <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function DoctorCard({ doctor }) {
  const t = toneFor(doctor.practiceType);
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-ink-100 bg-white">
      <SmartImage src={doctor.image} alt={doctor.image ? doctor.name : ''} kind="doctor" className="aspect-[4/3] w-full" iconClass="size-14" />
      <div className="flex flex-1 flex-col p-5">
        <span className={`mb-2 w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${t.chip}`}>
          {doctor.practiceType === 'dental' ? 'Dental' : 'Ayurveda'}
        </span>
        <h3 className="font-sans text-lg font-semibold text-ink-900">{doctor.name}</h3>
        <p className="text-sm text-ink-600">{doctor.qualification}</p>
        <p className={`mt-1 text-sm font-medium ${t.text}`}>{doctor.specialization}</p>
        {doctor.experience && <p className="mt-1 text-sm text-ink-500">{doctor.experience}</p>}
        {doctor.bio && <p className="mt-3 text-sm leading-relaxed text-ink-600">{truncate(doctor.bio, 140)}</p>}
      </div>
    </article>
  );
}

export function TestimonialCard({ testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-xl border border-ink-100 bg-white p-6">
      <Quote className="mb-3 size-6 text-ink-300" aria-hidden="true" />
      <blockquote className="flex-1 text-base leading-relaxed text-ink-700">{testimonial.text}</blockquote>
      {testimonial.rating > 0 && (
        <div className="mt-4 flex gap-0.5 text-gold-500" role="img" aria-label={`${testimonial.rating} out of 5`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={`size-4 ${i < testimonial.rating ? 'fill-current' : 'text-ink-200'}`} aria-hidden="true" />
          ))}
        </div>
      )}
      <figcaption className="mt-4 text-sm font-medium text-ink-900">
        {testimonial.name}
        {testimonial.isDemo && <span className="ml-2 rounded bg-gold-500/15 px-1.5 py-0.5 text-xs font-medium text-gold-600">Sample</span>}
      </figcaption>
    </figure>
  );
}
