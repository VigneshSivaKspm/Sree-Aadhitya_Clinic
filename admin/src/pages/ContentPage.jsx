import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CollectionManager from '../components/CollectionManager';
import ContentEditor from '../components/ContentEditor';
import { PageHeader } from '../components/ui/DataDisplay';
import { faqService, testimonialService } from '../services/crud';
import { truncateText } from '../utils/format';

const scopeOptions = (isSuper, practiceScope) => (isSuper
  ? [{ value: 'main', label: 'Main site' }, { value: 'ayurveda', label: 'Ayurveda' }, { value: 'dental', label: 'Dental' }]
  : [{ value: practiceScope, label: practiceScope === 'dental' ? 'Dental' : 'Ayurveda' }]);

export default function ContentPage() {
  const { isSuper, practiceScope } = useAuth();
  const scopes = scopeOptions(isSuper, practiceScope);

  const tabs = [
    ...(isSuper ? [{ key: 'main', label: 'Main site' }] : []),
    ...(isSuper || practiceScope === 'ayurveda' ? [{ key: 'ayurveda', label: 'Ayurveda page' }] : []),
    ...(isSuper || practiceScope === 'dental' ? [{ key: 'dental', label: 'Dental page' }] : []),
    { key: 'testimonials', label: 'Testimonials' },
    { key: 'faqs', label: 'FAQs' },
  ];
  const [tab, setTab] = useState(tabs[0].key);

  const testimonialFields = [
    { key: 'practiceType', label: 'Show on', type: 'select', required: true, options: scopes, lockOnEdit: true },
    { key: 'name', label: 'Patient name / initials', required: true, max: 80, hint: 'Use the name the person agreed to share.' },
    { key: 'text', label: 'Testimonial', type: 'textarea', required: true, min: 10, max: 600 },
    { key: 'rating', label: 'Rating (0–5, 0 = hide stars)', type: 'number', min: 0, max: 5, required: true },
    { key: 'displayOrder', label: 'Display order', type: 'number', min: 0, max: 999, required: true },
    { key: 'active', label: 'Visible on website', type: 'toggle' },
  ];
  const faqFields = [
    { key: 'practiceType', label: 'Show on', type: 'select', required: true, options: scopes.filter((s) => s.value !== 'main'), lockOnEdit: true },
    { key: 'question', label: 'Question', required: true, min: 5, max: 200 },
    { key: 'answer', label: 'Answer', type: 'textarea', required: true, min: 5, max: 1500 },
    { key: 'displayOrder', label: 'Display order', type: 'number', min: 0, max: 999, required: true },
    { key: 'active', label: 'Visible on website', type: 'toggle' },
  ];

  return (
    <>
      <PageHeader title="Website content" description="Edit text and images shown on the public website. Changes go live as soon as you save." />
      <div role="tablist" aria-label="Content sections" className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
            className={`rounded-md px-4 py-2 text-sm font-medium ${tab === t.key ? 'bg-ink-900 text-white' : 'bg-white text-ink-700 ring-1 ring-ink-200 hover:bg-ink-50'}`}>{t.label}</button>
        ))}
      </div>

      {['main', 'ayurveda', 'dental'].includes(tab) && <ContentEditor scope={tab} />}
      {tab === 'testimonials' && (
        <CollectionManager service={testimonialService} noun="Testimonial" plural="Testimonials" fields={testimonialFields} note="Only publish real feedback that the patient has agreed to share."
          blank={{ practiceType: scopes[0].value, name: '', text: '', rating: 0, displayOrder: 1, active: true }}
          columns={[{ key: 'name', header: 'Name', render: (r) => <span className="font-medium text-ink-900">{r.name}</span> }, { key: 'text', header: 'Text', render: (r) => <span className="text-ink-600">{truncateText(r.text, 90)}</span> }]} />
      )}
      {tab === 'faqs' && (
        <CollectionManager service={faqService} noun="FAQ" plural="FAQs" fields={faqFields}
          blank={{ practiceType: scopes.find((s) => s.value !== 'main')?.value || 'ayurveda', question: '', answer: '', displayOrder: 1, active: true }}
          columns={[{ key: 'q', header: 'Question', render: (r) => <span className="font-medium text-ink-900">{truncateText(r.question, 80)}</span> }, { key: 'order', header: 'Order', render: (r) => r.displayOrder }]} />
      )}
    </>
  );
}
