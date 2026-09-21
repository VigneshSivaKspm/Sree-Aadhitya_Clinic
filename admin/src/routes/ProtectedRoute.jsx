import { Loader2 } from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import Button from '../components/ui/Button';

function FullScreen({ children }) {
  return <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">{children}</div>;
}

/** Requires a signed-in user with an active staff profile. */
export default function ProtectedRoute() {
  const { status, error, logout } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <FullScreen><Loader2 className="size-8 animate-spin text-ink-500" aria-hidden="true" /><p role="status" className="text-sm text-ink-600">Checking your access…</p></FullScreen>;
  }
  if (status === 'signedOut') return <Navigate to="/login" replace state={{ from: location }} />;
  if (status === 'unauthorized') return <UnauthorizedPage fullScreen />;
  if (status === 'error') {
    return (
      <FullScreen>
        <p role="alert" className="max-w-md text-sm text-ink-800">{error}</p>
        <div className="flex gap-3"><Button onClick={() => window.location.reload()}>Retry</Button><Button variant="secondary" onClick={logout}>Sign out</Button></div>
      </FullScreen>
    );
  }
  return <Outlet />;
}
