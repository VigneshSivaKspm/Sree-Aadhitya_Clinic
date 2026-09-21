// DEMO / PLACEHOLDER CONTENT — NOT confirmed client content.
// Shown only while the matching Firestore collection is empty and DEMO_ENABLED is true.
// Every item carries isDemo: true so the UI can label it. No qualifications, experience,
// certifications, reviews or outcomes are invented here.

const demo = (obj) => ({ isDemo: true, active: true, featured: false, image: '', ...obj });

export const demoDoctors = [
  demo({ id: 'demo-doc-ayur-1', practiceType: 'ayurveda', name: 'Doctor Name', qualification: 'Qualification', specialization: 'Specialization', experience: '', bio: 'Doctor profile will be added here.', displayOrder: 1, featured: true }),
  demo({ id: 'demo-doc-ayur-2', practiceType: 'ayurveda', name: 'Doctor Name', qualification: 'Qualification', specialization: 'Specialization', experience: '', bio: 'Doctor profile will be added here.', displayOrder: 2 }),
  demo({ id: 'demo-doc-dental-1', practiceType: 'dental', name: 'Doctor Name', qualification: 'Qualification', specialization: 'Specialization', experience: '', bio: 'Doctor profile will be added here.', displayOrder: 1, featured: true }),
  demo({ id: 'demo-doc-dental-2', practiceType: 'dental', name: 'Doctor Name', qualification: 'Qualification', specialization: 'Specialization', experience: '', bio: 'Doctor profile will be added here.', displayOrder: 2 }),
];

const service = (practiceType, slug, name, shortDescription, fullDescription, benefits, duration, featured = false) =>
  demo({
    id: `demo-svc-${practiceType}-${slug}`,
    practiceType,
    slug,
    name,
    shortDescription,
    fullDescription,
    benefits,
    duration,
    featured,
    doctorIds: [],
    seoTitle: '',
    seoDescription: '',
  });

export const demoServices = [
  service('ayurveda', 'ayurvedic-consultation', 'Ayurvedic Consultation',
    'A one-to-one discussion of your health concerns, lifestyle and history with an Ayurvedic physician.',
    'A consultation is usually the starting point. The physician listens to your concerns, reviews your history and explains the approach and options that may suit you. This description is placeholder text and will be replaced by the hospital.',
    ['Unhurried one-to-one discussion', 'Options explained in plain language', 'Plan discussed with your physician'], 'Varies', true),
  service('ayurveda', 'panchakarma-programme', 'Panchakarma Programme',
    'Traditional Ayurvedic therapies planned individually after consultation.',
    'Panchakarma refers to a set of traditional Ayurvedic procedures. Suitability, duration and content are decided by the physician after consultation. This description is placeholder text and will be replaced by the hospital.',
    ['Planned individually after consultation', 'Supervised by qualified practitioners'], 'Varies by plan', true),
  service('ayurveda', 'abhyanga', 'Abhyanga (Herbal Oil Massage)',
    'A traditional full-body massage using herbal oils.',
    'Abhyanga is a traditional Ayurvedic oil massage. Oils and technique are chosen by the therapist. This description is placeholder text and will be replaced by the hospital.',
    ['Performed by trained therapists', 'Oils selected to suit the individual'], 'Varies'),
  service('ayurveda', 'shirodhara', 'Shirodhara',
    'A traditional therapy in which warm oil is gently poured over the forehead.',
    'Shirodhara is a traditional Ayurvedic therapy. Suitability is assessed by the physician. This description is placeholder text and will be replaced by the hospital.',
    ['Assessed by a physician beforehand', 'Calm, quiet treatment setting'], 'Varies'),

  service('dental', 'general-dentistry', 'General Dentistry & Check-ups',
    'Routine examinations and everyday dental care for all ages.',
    'Regular check-ups help your dentist monitor your oral health and plan any care you may need. This description is placeholder text and will be replaced by the hospital.',
    ['Examination and advice', 'Care planned with your dentist'], 'Varies', true),
  service('dental', 'teeth-cleaning', 'Teeth Cleaning',
    'Professional cleaning as part of routine dental care.',
    'Professional cleaning is often part of a routine dental visit. This description is placeholder text and will be replaced by the hospital.',
    ['Performed by dental professionals'], 'Varies'),
  service('dental', 'root-canal-treatment', 'Root Canal Treatment',
    'Treatment to address problems inside the tooth, planned after examination.',
    'Whether a root canal is appropriate is decided by your dentist after examination. This description is placeholder text and will be replaced by the hospital.',
    ['Assessment before treatment', 'Options explained by your dentist'], 'Varies', true),
  service('dental', 'orthodontics', 'Orthodontics (Braces & Aligners)',
    'Assessment and planning for teeth alignment.',
    'Orthodontic options depend on individual assessment. This description is placeholder text and will be replaced by the hospital.',
    ['Individual assessment', 'Options discussed with your dentist'], 'Varies'),
  service('dental', 'cosmetic-dentistry', 'Cosmetic Dentistry',
    'Treatments focused on the appearance of your smile.',
    'Cosmetic options are discussed after an examination. This description is placeholder text and will be replaced by the hospital.',
    ['Options discussed after examination'], 'Varies', true),
  service('dental', 'dental-implants', 'Dental Implants',
    'Replacement of missing teeth, planned after assessment.',
    'Suitability for implants is assessed by your dentist. This description is placeholder text and will be replaced by the hospital.',
    ['Assessment before any procedure'], 'Varies'),
  service('dental', 'pediatric-dentistry', 'Pediatric Dentistry',
    'Dental care for children in a friendly setting.',
    'Care for children’s teeth, planned around the child’s age and needs. This description is placeholder text and will be replaced by the hospital.',
    ['Child-friendly approach'], 'Varies'),
];

export const demoCategories = [
  demo({ id: 'demo-cat-oils', name: 'Herbal Oils', slug: 'herbal-oils', description: 'Sample category', displayOrder: 1 }),
  demo({ id: 'demo-cat-powders', name: 'Herbal Powders', slug: 'herbal-powders', description: 'Sample category', displayOrder: 2 }),
  demo({ id: 'demo-cat-teas', name: 'Herbal Teas', slug: 'herbal-teas', description: 'Sample category', displayOrder: 3 }),
];

const product = (n, categoryId, name, price, compareAtPrice = 0, featured = false) =>
  demo({
    id: `demo-prod-${n}`,
    slug: `sample-product-${n}`,
    name,
    sku: `DEMO-${String(n).padStart(3, '0')}`,
    categoryId,
    shortDescription: 'Sample product used to preview the store layout.',
    description: 'This is placeholder product text. Real product information will be added from the admin panel.',
    images: [],
    price,
    compareAtPrice,
    stockQuantity: 25,
    inStock: true,
    featured,
    usageInformation: '',
    ingredients: '',
  });

export const demoProducts = [
  product(1, 'demo-cat-oils', 'Sample Herbal Oil', 350, 400, true),
  product(2, 'demo-cat-oils', 'Sample Massage Oil', 480, 0, true),
  product(3, 'demo-cat-powders', 'Sample Herbal Powder', 260, 0, true),
  product(4, 'demo-cat-powders', 'Sample Herbal Blend', 310, 350),
  product(5, 'demo-cat-teas', 'Sample Herbal Tea', 220, 0, true),
  product(6, 'demo-cat-teas', 'Sample Tea Blend', 240, 0),
];

export const demoTestimonials = [
  demo({
    id: 'demo-testimonial-1',
    practiceType: 'main',
    name: 'Patient Name',
    text: 'This is placeholder text. Real patient feedback will appear here once it is added from the admin panel.',
    rating: 0,
  }),
];

export const demoFaqs = [
  demo({ id: 'demo-faq-1', practiceType: 'dental', displayOrder: 1, question: 'How do I book an appointment?', answer: 'Use the appointment form on this website, or call us. Our team will confirm your requested slot.' }),
  demo({ id: 'demo-faq-2', practiceType: 'dental', displayOrder: 2, question: 'What should I bring to my first visit?', answer: 'Please bring any previous dental records or prescriptions you have. This answer is a placeholder and will be updated by the hospital.' }),
  demo({ id: 'demo-faq-3', practiceType: 'dental', displayOrder: 3, question: 'Can I change or cancel my appointment?', answer: 'Please contact the hospital as early as possible. This answer is a placeholder and will be updated by the hospital.' }),
  demo({ id: 'demo-faq-4', practiceType: 'ayurveda', displayOrder: 1, question: 'How do I book an appointment?', answer: 'Use the appointment form on this website, or call us. Our team will confirm your requested slot.' }),
];
