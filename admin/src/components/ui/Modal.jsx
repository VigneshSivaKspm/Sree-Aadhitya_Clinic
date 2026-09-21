import { useEffect, useId, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

const WIDTHS = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' };
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

const openModals = []; // stack so only the top-most modal reacts to Esc / Tab

/** Accessible modal: Esc / backdrop to close, focus moved in and restored, Tab trapped, scroll locked. */
export default function Modal({ open, onClose, title, description, size = 'md', footer, children, dismissible = true }) {
  const id = useId();
  const panel = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    openModals.push(id);
    document.body.style.overflow = 'hidden';
    const first = panel.current?.querySelector('[data-autofocus]') || panel.current?.querySelector(FOCUSABLE);
    first?.focus();

    const onKey = (e) => {
      if (openModals[openModals.length - 1] !== id) return;
      if (e.key === 'Escape' && dismissible) onClose();
      if (e.key === 'Tab' && panel.current) {
        const nodes = [...panel.current.querySelectorAll(FOCUSABLE)];
        if (!nodes.length) return;
        const a = nodes[0];
        const z = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      openModals.splice(openModals.indexOf(id), 1);
      if (!openModals.length) document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [open, onClose, dismissible, id]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-ink-950/50" onClick={dismissible ? onClose : undefined} aria-hidden="true" />
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={description ? `${id}-desc` : undefined}
        className={`relative flex max-h-[92vh] w-full flex-col rounded-t-xl bg-white shadow-2xl sm:rounded-xl ${WIDTHS[size]}`}>
        <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-5 py-4">
          <div>
            <h2 id={`${id}-title`} className="text-lg font-semibold text-ink-900">{title}</h2>
            {description && <p id={`${id}-desc`} className="mt-0.5 text-sm text-ink-600">{description}</p>}
          </div>
          {dismissible && (
            <button type="button" onClick={onClose} aria-label="Close dialog" className="-mr-1 flex size-8 shrink-0 items-center justify-center rounded-md text-ink-500 hover:bg-ink-100"><X className="size-5" /></button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-3 border-t border-ink-100 bg-ink-50 px-5 py-3 sm:rounded-b-xl">{footer}</div>}
      </div>
    </div>
  );
}

/** Confirmation for important / destructive actions. */
export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false, busy = false, onConfirm, onCancel, children }) {
  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onCancel}
      dismissible={!busy}
      size="sm"
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={busy} data-autofocus>{cancelLabel}</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={busy}>{confirmLabel}</Button>
        </>
      }
    >
      <div className="flex gap-3">
        {danger && <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-danger-50 text-danger-600"><AlertTriangle className="size-5" aria-hidden="true" /></span>}
        <div className="text-sm leading-relaxed text-ink-700">
          <p>{message}</p>
          {children}
        </div>
      </div>
    </Modal>
  );
}
