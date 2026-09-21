import { Search, X } from 'lucide-react';
import { useId } from 'react';

export function SearchInput({ value, onChange, placeholder = 'Search…', label = 'Search', className = '' }) {
  const id = useId();
  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">{label}</label>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
      <input id={id} type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="h-10 w-full rounded-md border border-ink-300 bg-white pr-9 pl-9 text-sm placeholder:text-ink-400 focus:border-dental-600 focus:ring-2 focus:ring-dental-100 focus:outline-none" />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="Clear search" className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-ink-400 hover:text-ink-700"><X className="size-4" /></button>
      )}
    </div>
  );
}

export function FilterSelect({ label, value, onChange, options, allLabel = 'All', disabled, className = '' }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="sr-only">{label}</label>
      <select id={id} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} aria-label={label}
        className="h-10 w-full rounded-md border border-ink-300 bg-white px-3 text-sm text-ink-800 focus:border-dental-600 focus:ring-2 focus:ring-dental-100 focus:outline-none disabled:bg-ink-50 disabled:text-ink-500">
        <option value="">{allLabel} {label.toLowerCase()}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function FilterDate({ label, value, onChange }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="sr-only">{label}</label>
      <input id={id} type="date" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} title={label}
        className="h-10 w-full rounded-md border border-ink-300 bg-white px-3 text-sm text-ink-800 focus:border-dental-600 focus:ring-2 focus:ring-dental-100 focus:outline-none" />
    </div>
  );
}

export function FilterBar({ children, onClear, active }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-ink-100 p-4">
      {children}
      {active && onClear && <button type="button" onClick={onClear} className="text-sm font-medium text-dental-700 hover:underline">Clear filters</button>}
    </div>
  );
}
