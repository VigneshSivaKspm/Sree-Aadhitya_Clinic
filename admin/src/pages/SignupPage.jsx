import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Leaf, Smile } from 'lucide-react';
import Button from '../components/ui/Button';
import { TextField } from '../components/ui/FormField';
import { useAuth } from '../contexts/AuthContext';
import { signUp } from '../services/authService';
import { getErrorMessage, logError } from '../utils/errors';
import { hasErrors, v } from '../utils/validators';

export default function SignupPage() {
  const { status } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Once signed in, ProtectedRoute decides between the dashboard and "awaiting approval".
  if (status === 'ready' || status === 'unauthorized') return <Navigate to="/" replace />;

  const errors = {
    name: v.text(form.name, { label: 'Name', min: 2, max: 100, required: true }),
    email: v.email(form.email, { required: true }),
    password: form.password.length < 8 ? 'Password must be at least 8 characters.' : '',
    confirm: form.confirm !== form.password ? 'Passwords do not match.' : '',
  };
  const bind = (f) => ({ value: form[f], onChange: (e) => setForm((s) => ({ ...s, [f]: e.target.value })), error: submitted ? errors[f] : '' });

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setSubmitted(true);
    setError('');
    if (hasErrors(errors)) return;
    setBusy(true);
    try {
      await signUp(form);
    } catch (err) {
      logError('signup', err);
      setError(getErrorMessage(err, 'Could not create your account. Please try again.'));
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-3 text-white">
          <span className="relative flex size-11 overflow-hidden rounded-xl" aria-hidden="true">
            <span className="flex w-1/2 items-center justify-center bg-ayur-600"><Leaf className="size-5 translate-x-0.5" /></span>
            <span className="flex w-1/2 items-center justify-center bg-dental-600"><Smile className="size-5 -translate-x-0.5" /></span>
          </span>
          <div className="leading-tight"><p className="text-lg font-semibold">SREE AADHITYAA</p><p className="text-[11px] tracking-wider text-white/60 uppercase">Integrated Siddha and Dental Healthcare · Admin</p></div>
        </div>

        <form onSubmit={submit} noValidate className="rounded-xl bg-white p-6 shadow-xl">
          <h1 className="text-xl font-semibold text-ink-900">Request access</h1>
          <p className="mt-1 mb-5 text-sm text-ink-600">Create an account, then a super admin will approve it and assign your role. You can’t use the panel until then.</p>
          <div className="space-y-4">
            <TextField label="Full name" required autoComplete="name" {...bind('name')} />
            <TextField label="Email" type="email" required autoComplete="username" {...bind('email')} />
            <TextField label="Password" type="password" required autoComplete="new-password" hint="At least 8 characters." {...bind('password')} />
            <TextField label="Confirm password" type="password" required autoComplete="new-password" {...bind('confirm')} />
          </div>
          {error && <p role="alert" className="mt-4 rounded-md border border-danger-600/20 bg-danger-50 px-3 py-2.5 text-sm text-danger-700">{error}</p>}
          <Button type="submit" size="lg" loading={busy} className="mt-5 w-full">{busy ? 'Creating account…' : 'Create account'}</Button>
          <p className="mt-4 text-center text-sm text-ink-600">Already have access? <Link to="/login" className="font-medium text-dental-700 hover:underline">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
}
