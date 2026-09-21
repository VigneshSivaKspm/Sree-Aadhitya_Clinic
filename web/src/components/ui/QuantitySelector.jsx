import { Minus, Plus } from 'lucide-react';

export default function QuantitySelector({ value, onChange, min = 1, max = 99, label = 'Quantity', size = 'md' }) {
  const dim = size === 'sm' ? 'size-8' : 'size-10';
  const btn = `${dim} flex items-center justify-center text-ink-700 transition-colors hover:bg-ink-100 disabled:text-ink-300 disabled:hover:bg-transparent`;
  return (
    <div className="inline-flex items-center rounded-md border border-ink-300 bg-white" role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease quantity">
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <span className={`min-w-8 px-1 text-center text-sm font-medium tabular-nums`} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
