import { BrowserRouter } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { isFirebaseConfigured } from './config/firebase';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import AppRoutes from './routes/AppRoutes';

function MissingConfig() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-lg rounded-xl border border-ink-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-gold-100 text-gold-700"><KeyRound className="size-6" aria-hidden="true" /></span>
        <h1 className="text-xl font-semibold text-ink-900">Firebase isn’t configured</h1>
        <p className="mt-2 text-sm text-ink-600">Copy <code className="rounded bg-ink-100 px-1.5 py-0.5">.env.example</code> to <code className="rounded bg-ink-100 px-1.5 py-0.5">.env</code> in the admin folder, fill in your Firebase project values, then restart the dev server.</p>
      </div>
    </div>
  );
}

export default function App() {
  if (!isFirebaseConfigured) return <MissingConfig />;
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
