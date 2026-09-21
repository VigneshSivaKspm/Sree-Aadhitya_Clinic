import { useId } from 'react';
import { toneFor } from '../../config/theme';

const base =
  'block w-full rounded-md border bg-white px-3.5 text-sm text-ink-900 placeholder:text-ink-400 transition focus:outline-none focus:ring-2 disabled:bg-ink-50 disabled:text-ink-500';

/** Label + control + hint/error wrapper. `children` receives { id, describedBy, invalid, className }. */
export function Field({ label, error, hint, required, tone = 'main', children, className = '' }) {
  const id = useId();
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  const t = toneFor(tone);
  const controlClass = `${base} ${error ? 'border-danger-600 focus:ring-red-200' : `border-ink-300 ${t.ring}`}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-800">
        {label}
        {required && <span className="ml-0.5 text-danger-600" aria-hidden="true">*</span>}
      </label>
      {children({ id, describedBy, invalid: !!error, className: controlClass })}
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-sm text-danger-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({ label, error, hint, required, tone, className, inputClassName = '', ...props }) {
  return (
    <Field label={label} error={error} hint={hint} required={required} tone={tone} className={className}>
      {({ id, describedBy, invalid, className: c }) => (
        <input id={id} aria-describedby={describedBy} aria-invalid={invalid} aria-required={required} className={`${c} h-11 ${inputClassName}`} {...props} />
      )}
    </Field>
  );
}

export function SelectField({ label, error, hint, required, tone, className, children, ...props }) {
  return (
    <Field label={label} error={error} hint={hint} required={required} tone={tone} className={className}>
      {({ id, describedBy, invalid, className: c }) => (
        <select id={id} aria-describedby={describedBy} aria-invalid={invalid} aria-required={required} className={`${c} h-11`} {...props}>
          {children}
        </select>
      )}
    </Field>
  );
}

export function TextAreaField({ label, error, hint, required, tone, className, rows = 4, ...props }) {
  return (
    <Field label={label} error={error} hint={hint} required={required} tone={tone} className={className}>
      {({ id, describedBy, invalid, className: c }) => (
        <textarea id={id} rows={rows} aria-describedby={describedBy} aria-invalid={invalid} aria-required={required} className={`${c} py-2.5`} {...props} />
      )}
    </Field>
  );
}

export function CheckboxField({ label, error, tone = 'main', className = '', ...props }) {
  const id = useId();
  const accent = { main: 'accent-ink-900', ayurveda: 'accent-ayur-700', dental: 'accent-dental-600' }[tone];
  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        <input id={id} type="checkbox" aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className={`mt-1 size-4 shrink-0 ${accent}`} {...props} />
        <label htmlFor={id} className="text-sm leading-relaxed text-ink-700">
          {label}
        </label>
      </div>
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-sm text-danger-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
