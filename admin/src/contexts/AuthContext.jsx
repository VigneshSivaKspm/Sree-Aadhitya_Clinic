import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { canAccess, ROLE_PRACTICE } from '../config/constants';
import { clearDemoSession, loadDemoSession, matchDemoAccount, saveDemoSession, toDemoSession } from '../config/demoAccounts';
import { auth } from '../config/firebase';
import { ensureBootstrapMarker, loadProfile, onAuthChange, signIn, signOutUser, waitForSignup } from '../services/authService';
import { getErrorMessage, logError } from '../utils/errors';

const AuthContext = createContext(null);

const initialState = () => {
  const demo = loadDemoSession(); // TEMPORARY demo login (see config/demoAccounts.js)
  return demo ? { status: 'ready', ...demo, error: '' } : { status: 'loading', user: null, profile: null, error: '' };
};

/**
 * status: 'loading' | 'signedOut' | 'ready' | 'unauthorized' | 'error'
 *  - unauthorized: signed in with Firebase, but no active staff profile / role.
 */
export function AuthProvider({ children }) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    if (!auth) {
      setState((s) => (s.status === 'loading' ? { status: 'signedOut', user: null, profile: null, error: '' } : s));
      return undefined;
    }
    const unsubscribe = onAuthChange(async (user) => {
      if (!user) {
        // Don't clobber an active demo session when Firebase reports "no user".
        setState((s) => (s.user?.isDemo ? s : { status: 'signedOut', user: null, profile: null, error: '' }));
        return;
      }
      clearDemoSession();
      setState((s) => ({ ...s, status: 'loading', user }));
      try {
        await waitForSignup();
        const profile = await loadProfile(user.uid);
        if (profile?.role === 'super_admin') ensureBootstrapMarker(user);
        setState({ status: profile ? 'ready' : 'unauthorized', user, profile, error: '' });
      } catch (err) {
        logError('auth-profile', err);
        setState({ status: 'error', user, profile: null, error: getErrorMessage(err, 'Could not verify your access. Please try again.') });
      }
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (email, password) => {
    const demo = matchDemoAccount(email, password);
    if (demo) {
      saveDemoSession(demo.email);
      setState({ status: 'ready', ...toDemoSession(demo), error: '' });
      return;
    }
    await signIn(email, password);
  }, []);

  const logout = useCallback(async () => {
    clearDemoSession();
    if (state.user?.isDemo) {
      setState({ status: 'signedOut', user: null, profile: null, error: '' });
      return;
    }
    await signOutUser();
  }, [state.user]);

  const value = useMemo(() => {
    const role = state.profile?.role || null;
    return {
      ...state,
      role,
      /** 'ayurveda' | 'dental' for practice admins, null for super admin. */
      practiceScope: role ? ROLE_PRACTICE[role] : null,
      isSuper: role === 'super_admin',
      isDemo: !!state.user?.isDemo,
      can: (module) => canAccess(role, module),
      login,
      logout,
    };
  }, [state, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/** Role helpers for components. */
export const useRole = () => {
  const { role, practiceScope, isSuper, can } = useAuth();
  return { role, practiceScope, isSuper, can };
};
