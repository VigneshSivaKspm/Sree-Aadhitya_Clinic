import { useId } from 'react';

const control = 'block w-full rounded-md border bg-white px-3 text-sm text-ink-900 placeholder:text-ink-400 transition focus:outline-none focus:ring-2 disabled:bg-ink-50 disabled:text-ink-500';

/** Label + control + hint/error. `children` is a render function receiving { id, describedBy, invalid, className }. */
export function Field({ label, error, hint, required, className = '', children }) {
  const id = useId();
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  const cls = `${control} ${error ? 'border-danger-600 focus:ring-danger-100' : 'border-ink-300 focus:border-dental-600 focus:ring-dental-100'}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-800">
        {label}{required && <span className="ml-0.5 text-danger-600" aria-hidden="true">*</span>}
      </label>
      {children({ id, describedBy, invalid: !!error, className: cls })}
      {error ? <p id={`${id}-err`} role="alert" className="mt-1.5 text-xs text-danger-600">{error}</p>
        : hint ? <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-500">{hint}</p> : null}
    </div>
  );
}

export function TextField({ label, error, hint, required, className, ...props }) {
  return (
    <Field label={label} error={error} hint={hint} required={required} className={className}>
      {({ id, describedBy, invalid, className: c }) => <input id={id} aria-describedby={describedBy} aria-invalid={invalid} aria-required={required} className={`${c} h-10`} {...props} />}
    </Field>
  );
}

export function SelectField({ label, error, hint, required, className, children, ...props }) {
  return (
    <Field label={label} error={error} hint={hint} required={required} className={className}>
      {({ id, describedBy, invalid, className: c }) => <select id={id} aria-describedby={describedBy} aria-invalid={invalid} aria-required={required} className={`${c} h-10`} {...props}>{children}</select>}
    </Field>
  );
}

export function TextAreaField({ label, error, hint, required, className, rows = 4, ...props }) {
  return (
    <Field label={label} error={error} hint={hint} required={required} className={className}>
      {({ id, describedBy, invalid, className: c }) => <textarea id={id} rows={rows} aria-describedby={describedBy} aria-invalid={invalid} aria-required={required} className={`${c} py-2`} {...props} />}
    </Field>
  );
}

/** On/off switch with a visible label (role="switch"). */
export function Toggle({ label, description, checked, onChange, disabled, className = '' }) {
  const id = useId();
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div>
        <label htmlFor={id} className="text-sm font-medium text-ink-800">{label}</label>
        {description && <p className="text-xs text-ink-500">{description}</p>}
      </div>
      <button id={id} type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${checked ? 'bg-ayur-600' : 'bg-ink-300'}`}>
        <span className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

export function CheckboxField({ label, checked, onChange, className = '', ...props }) {
  const id = useId();
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-ink-900" {...props} />
      <label htmlFor={id} className="text-sm text-ink-800">{label}</label>
    </div>
  );
}
