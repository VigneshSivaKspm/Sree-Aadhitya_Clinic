// TEMPORARY, HARD-CODED DEMO LOGINS — FOR TESTING THE ADMIN UI ONLY.
// They are NOT Firebase accounts and grant no database access: they only open the
// role-based interface. Data screens still call Firestore, which will refuse unauthenticated
// requests unless your security rules allow it.
//
// Enabled in `npm run dev` by default. In a production build they are OFF unless
// VITE_ENABLE_DEMO_LOGIN=true. REMOVE THIS FILE (and its uses) before going live.

export const DEMO_LOGIN_ENABLED =
  import.meta.env.VITE_ENABLE_DEMO_LOGIN === 'true' ||
  (import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_LOGIN !== 'false');

export const DEMO_ACCOUNTS = [
  { email: 'super@demo.test', password: 'Demo@1234', role: 'super_admin', name: 'Demo Super Admin', label: 'Super admin' },
  { email: 'ayurveda@demo.test', password: 'Demo@1234', role: 'ayurveda_admin', name: 'Demo Ayurveda Admin', label: 'Ayurveda admin' },
  { email: 'dental@demo.test', password: 'Demo@1234', role: 'dental_admin', name: 'Demo Dental Admin', label: 'Dental admin' },
];

const SESSION_KEY = 'aah_admin_demo_session';

export function matchDemoAccount(email, password) {
  if (!DEMO_LOGIN_ENABLED) return null;
  return DEMO_ACCOUNTS.find((a) => a.email === String(email).trim().toLowerCase() && a.password === password) || null;
}

export const toDemoSession = (a) => ({
  user: { uid: `demo-${a.role}`, email: a.email, displayName: a.name, isDemo: true },
  profile: { id: `demo-${a.role}`, name: a.name, email: a.email, role: a.role, active: true },
});

export function saveDemoSession(email) {
  try { sessionStorage.setItem(SESSION_KEY, email); } catch { /* ignore */ }
}

export function clearDemoSession() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
}

export function loadDemoSession() {
  if (!DEMO_LOGIN_ENABLED) return null;
  try {
    const email = sessionStorage.getItem(SESSION_KEY);
    const account = DEMO_ACCOUNTS.find((a) => a.email === email);
    return account ? toDemoSession(account) : null;
  } catch {
    return null;
  }
}
