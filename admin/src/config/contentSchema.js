// Structured content model for the public website (siteContent/{main|ayurveda|dental}).
// The editor renders forms from this schema. Defaults mirror the public site's defaults.

const ICON_OPTIONS = [
  { value: 'stethoscope', label: 'Stethoscope' },
  { value: 'heart', label: 'Care' },
  { value: 'building', label: 'Facilities' },
  { value: 'user', label: 'Personal' },
  { value: 'shield', label: 'Trust' },
];

const contactFields = [
  { key: 'phone', label: 'Phone', type: 'phone', hint: 'Leave empty to use the group-wide number from Settings.' },
  { key: 'whatsapp', label: 'WhatsApp number', type: 'phone' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'address', label: 'Address', type: 'textarea', max: 300 },
  { key: 'workingHours', label: 'Working hours', type: 'textarea', max: 200 },
  { key: 'mapUrl', label: 'Google Maps embed URL', type: 'url', hint: 'In Google Maps: Share → Embed a map → copy the src="…" link.' },
];

export const CONTENT_SCHEMA = {
  main: [
    { title: 'Home hero', path: 'hero', fields: [
      { key: 'eyebrow', label: 'Small heading', max: 60 },
      { key: 'title', label: 'Headline', max: 140, required: true },
      { key: 'subtitle', label: 'Sub-heading', type: 'textarea', max: 300 },
      { key: 'image', label: 'Hero image (optional)', type: 'image' },
    ] },
    { title: 'Why choose us', path: 'whyChoose', type: 'list', max: 8, itemLabel: 'Card', fields: [
      { key: 'icon', label: 'Icon', type: 'select', options: ICON_OPTIONS },
      { key: 'title', label: 'Title', max: 60, required: true },
      { key: 'text', label: 'Text', type: 'textarea', max: 200 },
    ] },
    { title: 'Appointment call-to-action', path: 'appointmentCta', fields: [
      { key: 'title', label: 'Title', max: 100, required: true },
      { key: 'text', label: 'Text', type: 'textarea', max: 250 },
    ] },
    { title: 'About page', path: 'about', fields: [
      { key: 'title', label: 'Title', max: 100, required: true },
      { key: 'body', label: 'Body', type: 'textarea', max: 4000, rows: 8 },
    ] },
  ],
  ayurveda: [
    { title: 'Hero', path: 'hero', fields: [
      { key: 'title', label: 'Headline', max: 140, required: true },
      { key: 'subtitle', label: 'Sub-heading', type: 'textarea', max: 300 },
      { key: 'image', label: 'Hero image (optional)', type: 'image' },
    ] },
    { title: 'About the hospital', path: 'about', fields: [
      { key: 'title', label: 'Title', max: 120, required: true },
      { key: 'body', label: 'Body', type: 'textarea', max: 4000, rows: 8 },
      { key: 'image', label: 'Image (optional)', type: 'image' },
    ] },
    { title: 'Contact details', description: 'Overrides for this practice only. Empty fields use the group-wide details from Settings.', path: 'contact', fields: contactFields },
  ],
  dental: [
    { title: 'Hero', path: 'hero', fields: [
      { key: 'title', label: 'Headline', max: 140, required: true },
      { key: 'subtitle', label: 'Sub-heading', type: 'textarea', max: 300 },
      { key: 'image', label: 'Hero image (optional)', type: 'image' },
    ] },
    { title: 'About the hospital', path: 'about', fields: [
      { key: 'title', label: 'Title', max: 120, required: true },
      { key: 'body', label: 'Body', type: 'textarea', max: 4000, rows: 8 },
      { key: 'image', label: 'Image (optional)', type: 'image' },
    ] },
    { title: 'Facilities', description: 'Only list facilities the hospital has confirmed.', path: 'facilities', type: 'list', max: 8, itemLabel: 'Facility', fields: [
      { key: 'title', label: 'Title', max: 60, required: true },
      { key: 'text', label: 'Text', type: 'textarea', max: 200 },
    ] },
    { title: 'Contact details', description: 'Overrides for this practice only. Empty fields use the group-wide details from Settings.', path: 'contact', fields: contactFields },
  ],
};

export const CONTENT_DEFAULTS = {
  main: {
    hero: { eyebrow: 'Siddha & Dental Healthcare', title: 'SREE AADHITYAA INTEGRATED SIDDHA AND DENTAL HEALTHCARE', subtitle: 'Integrated Siddha and dental care under one name, with online appointments and an online store for herbal and Ayurvedic products.', image: '' },
    whyChoose: [
      { icon: 'stethoscope', title: 'Experienced care', text: 'Consultations led by qualified practitioners in each discipline.' },
      { icon: 'heart', title: 'Patient-focused', text: 'Time to listen, explain options and plan care around you.' },
      { icon: 'building', title: 'Modern facilities', text: 'Clean, comfortable clinical spaces for every visit.' },
      { icon: 'user', title: 'Personalised consultation', text: 'Recommendations tailored to your needs and history.' },
    ],
    appointmentCta: { title: 'Book your appointment online', text: 'Choose a practice, doctor and preferred time. Our team will confirm your request.' },
    about: { title: 'About SREE AADHITYAA', body: 'SREE AADHITYAA INTEGRATED SIDDHA AND DENTAL HEALTHCARE offers integrated Siddha and dental care under one name. This page will be updated with the hospital’s history, values and team once the details are supplied.' },
  },
  ayurveda: {
    hero: { title: 'Shree Aadhitya Ayurvedic Hospital', subtitle: 'Consultations and traditional therapies guided by Ayurvedic physicians, planned around your individual needs.', image: '' },
    about: { title: 'A calm, personal approach to Ayurveda', body: 'Our Ayurvedic hospital combines traditional practice with a modern, well-organised clinical setting. Hospital profile and philosophy will be added here from the admin panel.', image: '' },
    contact: { phone: '', whatsapp: '', email: '', address: '', workingHours: '', mapUrl: '' },
  },
  dental: {
    hero: { title: 'Shree Aadhitya Dental Hospital', subtitle: 'Preventive, restorative and cosmetic dental care in a clean, comfortable and modern setting.', image: '' },
    about: { title: 'Dental care that puts you at ease', body: 'Our dental hospital offers a range of dental treatments for children and adults. Hospital profile will be added here from the admin panel.', image: '' },
    facilities: [
      { title: 'Modern equipment', text: 'Up-to-date dental equipment. Details to be confirmed by the hospital.' },
      { title: 'Sterilisation & hygiene', text: 'Clear hygiene and sterilisation protocols. Details to be confirmed.' },
      { title: 'Comfortable treatment rooms', text: 'Calm spaces designed for patient comfort. Details to be confirmed.' },
    ],
    contact: { phone: '', whatsapp: '', email: '', address: '', workingHours: '', mapUrl: '' },
  },
};
