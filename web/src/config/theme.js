// Static class maps (Tailwind needs complete class names at build time).
// tone: 'main' | 'ayurveda' | 'dental'
export const TONES = {
  main: {
    solid: 'bg-ink-900 text-white hover:bg-ink-800',
    outline: 'border-ink-300 text-ink-900 hover:bg-ink-100',
    text: 'text-ink-900',
    textStrong: 'text-ink-900',
    soft: 'bg-sand-100',
    softBorder: 'border-sand-200',
    chip: 'bg-ink-100 text-ink-800',
    icon: 'bg-ink-100 text-ink-800',
    eyebrow: 'text-gold-600',
    dark: 'bg-ink-900 text-white',
    ring: 'focus:border-ink-600 focus:ring-ink-200',
    accentBar: 'bg-ink-900',
  },
  ayurveda: {
    solid: 'bg-ayur-700 text-white hover:bg-ayur-800',
    outline: 'border-ayur-600 text-ayur-800 hover:bg-ayur-50',
    text: 'text-ayur-700',
    textStrong: 'text-ayur-800',
    soft: 'bg-ayur-50',
    softBorder: 'border-ayur-100',
    chip: 'bg-ayur-100 text-ayur-800',
    icon: 'bg-ayur-100 text-ayur-700',
    eyebrow: 'text-ayur-600',
    dark: 'bg-ayur-800 text-white',
    ring: 'focus:border-ayur-600 focus:ring-ayur-200',
    accentBar: 'bg-ayur-600',
  },
  dental: {
    solid: 'bg-dental-600 text-white hover:bg-dental-700',
    outline: 'border-dental-600 text-dental-700 hover:bg-dental-50',
    text: 'text-dental-700',
    textStrong: 'text-dental-800',
    soft: 'bg-dental-50',
    softBorder: 'border-dental-100',
    chip: 'bg-dental-100 text-dental-800',
    icon: 'bg-dental-100 text-dental-700',
    eyebrow: 'text-dental-600',
    dark: 'bg-dental-800 text-white',
    ring: 'focus:border-dental-600 focus:ring-dental-200',
    accentBar: 'bg-dental-600',
  },
};

export const toneFor = (practice) => TONES[practice] || TONES.main;
