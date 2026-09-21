import { toneFor } from '../../config/theme';

export function Section({ id, tone, muted = false, className = '', children }) {
  const bg = muted ? (tone ? toneFor(tone).soft : 'bg-sand-100') : '';
  return (
    <section id={id} className={`py-16 sm:py-20 ${bg} ${className}`}>
      <div className="container-page">{children}</div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, description, tone = 'main', align = 'left', as: H = 'h2', action, className = '' }) {
  const t = toneFor(tone);
  const center = align === 'center';
  return (
    <div className={`mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${center ? 'text-center sm:flex-col sm:items-center' : ''} ${className}`}>
      <div className={center ? 'mx-auto max-w-2xl' : 'max-w-2xl'}>
        {eyebrow && <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.14em] ${t.eyebrow}`}>{eyebrow}</p>}
        <H className="text-3xl leading-tight font-semibold sm:text-4xl">{title}</H>
        {description && <p className="mt-3 text-base leading-relaxed text-ink-600">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Page header band used on inner pages. */
export function PageHero({ eyebrow, title, description, tone = 'main', children }) {
  const t = toneFor(tone);
  return (
    <div className={`border-b ${t.softBorder} ${tone === 'main' ? 'bg-sand-100' : t.soft}`}>
      <div className="container-page py-12 sm:py-16">
        {eyebrow && <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.14em] ${t.eyebrow}`}>{eyebrow}</p>}
        <h1 className="max-w-3xl text-4xl leading-tight font-semibold sm:text-5xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-600">{description}</p>}
        {children}
      </div>
    </div>
  );
}
