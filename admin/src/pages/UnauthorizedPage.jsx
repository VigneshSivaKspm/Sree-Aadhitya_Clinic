import { useState } from 'react';
import { Clock, ShieldAlert } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { finishSignup, getAccessRequest } from '../services/authService';
import { getErrorMessage } from '../utils/errors';

export default function UnauthorizedPage({ fullScreen = false }) {
  const { logout, status, user, profile } = useAuth();
  const noProfile = status === 'unauthorized';
  const req = useAsync(() => getAccessRequest(user.uid), [user?.uid], { enabled: noProfile && !!user });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const pending = noProfile && !!req.data;

  const requestAccess = async () => {
    setBusy(true);
    setMsg('');
    try {
      const result = await finishSignup(user, user.displayName || user.email.split('@')[0]);
      if (result === 'super_admin' || result === 'existing') window.location.reload(); // pick up the new profile
      else req.reload();
    } catch (err) {
      setMsg(getErrorMessage(err, 'Could not send the request.'));
    } finally {
      setBusy(false);
    }
  };

  const Icon = pending ? Clock : ShieldAlert;
  return (
    <div className={`flex flex-col items-center justify-center px-6 text-center ${fullScreen ? 'min-h-screen' : 'py-24'}`}>
      <span className={`mb-4 flex size-14 items-center justify-center rounded-full ${pending ? 'bg-gold-100 text-gold-700' : 'bg-danger-50 text-danger-600'}`}><Icon className="size-7" aria-hidden="true" /></span>
      <h1 className="text-2xl font-semibold text-ink-900">{pending ? 'Waiting for approval' : noProfile ? 'No admin access' : 'You don’t have access to this page'}</h1>
      <p className="mt-2 max-w-md text-sm text-ink-600">
        {pending
          ? `Your access request for ${user?.email} has been sent. A super admin needs to approve it and assign your role. Sign in again after you’ve been approved.`
          : noProfile
            ? `${user?.email || 'This account'} is signed in but has no admin role yet.`
            : `Your role (${(profile?.role || '').replace('_', ' ')}) doesn’t include this section. If you think this is a mistake, contact a super admin.`}
      </p>
      {msg && <p role="alert" className="mt-3 text-sm text-danger-700">{msg}</p>}
      <div className="mt-6 flex gap-3">
        {!noProfile && <Button to="/">Go to dashboard</Button>}
        {noProfile && !pending && !req.loading && <Button onClick={requestAccess} loading={busy}>Request access</Button>}
        <Button variant="secondary" onClick={logout}>Sign out</Button>
      </div>
    </div>
  );
}
