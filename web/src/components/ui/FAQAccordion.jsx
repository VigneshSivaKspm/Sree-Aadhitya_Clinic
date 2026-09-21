import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQAccordion({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y divide-ink-200 rounded-xl border border-ink-200 bg-white">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.id || i}>
            <h3 className="font-sans">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-medium text-ink-900 hover:bg-ink-50"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                {item.question}
                <ChevronDown className={`size-5 shrink-0 text-ink-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
            </h3>
            <div id={`faq-panel-${i}`} role="region" hidden={!isOpen} className="px-5 pb-5 text-sm leading-relaxed text-ink-600">
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
