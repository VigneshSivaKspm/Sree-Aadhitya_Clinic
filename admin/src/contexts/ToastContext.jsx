import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);
  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (message, type) => {
      const id = nextId.current++;
      setToasts((t) => [...t.slice(-3), { id, message, type }]);
      setTimeout(() => dismiss(id), type === 'error' ? 6000 : 3500);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ success: (m) => push(m, 'success'), error: (m) => push(m, 'error') }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-0 bottom-0 z-[80] flex w-full flex-col gap-2 p-4 sm:max-w-sm" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} role={t.type === 'error' ? 'alert' : 'status'} className="pointer-events-auto flex items-start gap-3 rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm shadow-lg">
            {t.type === 'error' ? <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger-600" aria-hidden="true" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ayur-600" aria-hidden="true" />}
            <p className="flex-1 text-ink-800">{t.message}</p>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-ink-400 hover:text-ink-700"><X className="size-4" /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
