// Central, replaceable site configuration.
// Everything here is a DEFAULT: values stored in Firestore (settings/general and
// siteContent/*) override it at runtime through SiteContext. Contact details below
// are PLACEHOLDERS until the client supplies real ones.

export const SITE_URL = (import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '');

export const DEMO_ENABLED =
  import.meta.env.VITE_ENABLE_DEMO_DATA === 'true' ||
  (import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_DATA !== 'false');

// Central brand identity — used for the site name, page titles, header, footer and SEO.
export const BRAND = {
  fullName: 'SREE AADHITYAA INTEGRATED SIDDHA AND DENTAL HEALTHCARE',
  short: 'SREE AADHITYAA',
  descriptor: 'Integrated Siddha and Dental Healthcare',
  shortDescriptor: 'Siddha & Dental Healthcare',
};

export const PRACTICES = {
  ayurveda: {
    key: 'ayurveda',
    name: 'Shree Aadhitya Ayurvedic Hospital',
    shortName: 'Ayurvedic Hospital',
    path: '/ayurveda',
    servicesPath: '/ayurveda/services',
    tagline: 'Traditional Ayurvedic care, personalised for you',
  },
  dental: {
    key: 'dental',
    name: 'Shree Aadhitya Dental Hospital',
    shortName: 'Dental Hospital',
    path: '/dental',
    servicesPath: '/dental/services',
    tagline: 'Modern, comfortable dental care for the whole family',
  },
};

export const DEFAULT_SETTINGS = {
  brand: {
    groupName: BRAND.fullName,
    developer: 'Legendary One Technologies',
  },
  contact: {
    phone: '+91 90000 00000', // placeholder
    whatsapp: '+91 90000 00000', // placeholder
    email: 'hello@example.com', // placeholder
    address: 'Hospital address to be added',
    workingHours: 'Mon – Sat: 9:00 AM – 6:00 PM',
    mapUrl: '', // Google Maps embed URL, optional
  },
  social: { instagram: '', facebook: '', youtube: '' },
  currency: 'INR',
  shipping: { enabled: true, flatFee: 60, freeAbove: 999 },
  lowStockThreshold: 5,
  paymentMethods: [
    { key: 'cod', label: 'Cash on delivery', help: 'Pay in cash when your order is delivered.' },
    {
      key: 'manual_transfer',
      label: 'Pay by UPI / bank transfer',
      help: 'We will contact you with payment details after confirming your order.',
    },
  ],
  appointments: { startTime: '09:30', endTime: '17:30', slotMinutes: 30, maxDaysAhead: 90 },
  disclaimer:
    'The information on this website is for general awareness only and is not a substitute for professional medical advice, diagnosis or treatment. Please consult a qualified doctor about your health.',
};

export const DEFAULT_CONTENT = {
  main: {
    hero: {
      eyebrow: 'Siddha & Dental Healthcare',
      title: BRAND.fullName,
      subtitle:
        'Integrated Siddha and dental care under one name, with online appointments and an online store for herbal and Ayurvedic products.',
      image: '',
    },
    whyChoose: [
      { icon: 'stethoscope', title: 'Experienced care', text: 'Consultations led by qualified practitioners in each discipline.' },
      { icon: 'heart', title: 'Patient-focused', text: 'Time to listen, explain options and plan care around you.' },
      { icon: 'building', title: 'Modern facilities', text: 'Clean, comfortable clinical spaces for every visit.' },
      { icon: 'user', title: 'Personalised consultation', text: 'Recommendations tailored to your needs and history.' },
    ],
    appointmentCta: {
      title: 'Book your appointment online',
      text: 'Choose a practice, doctor and preferred time. Our team will confirm your request.',
    },
    about: {
      title: `About ${BRAND.short}`,
      body:
        `${BRAND.fullName} offers integrated Siddha and dental care under one name. This page will be updated with the hospital’s history, values and team once the details are supplied.`,
    },
  },
  ayurveda: {
    hero: {
      title: 'Shree Aadhitya Ayurvedic Hospital',
      subtitle:
        'Consultations and traditional therapies guided by Ayurvedic physicians, planned around your individual needs.',
      image: '',
    },
    about: {
      title: 'A calm, personal approach to Ayurveda',
      body:
        'Our Ayurvedic hospital combines traditional practice with a modern, well-organised clinical setting. Hospital profile and philosophy will be added here from the admin panel.',
      image: '',
    },
    contact: {},
  },
  dental: {
    hero: {
      title: 'Shree Aadhitya Dental Hospital',
      subtitle:
        'Preventive, restorative and cosmetic dental care in a clean, comfortable and modern setting.',
      image: '',
    },
    about: {
      title: 'Dental care that puts you at ease',
      body:
        'Our dental hospital offers a range of dental treatments for children and adults. Hospital profile will be added here from the admin panel.',
      image: '',
    },
    facilities: [
      { title: 'Modern equipment', text: 'Up-to-date dental equipment. Details to be confirmed by the hospital.' },
      { title: 'Sterilisation & hygiene', text: 'Clear hygiene and sterilisation protocols. Details to be confirmed.' },
      { title: 'Comfortable treatment rooms', text: 'Calm spaces designed for patient comfort. Details to be confirmed.' },
    ],
    contact: {},
  },
};
