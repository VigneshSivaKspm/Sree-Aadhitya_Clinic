import { useAuth } from '../contexts/AuthContext';
import UnauthorizedPage from '../pages/UnauthorizedPage';

/**
 * Renders children only if the current role may access `module` (see MODULE_ACCESS).
 * UI convenience only — Firestore/Storage rules enforce the same restrictions server-side.
 */
export default function RoleGuard({ module, children }) {
  const { can } = useAuth();
  return can(module) ? children : <UnauthorizedPage />;
}
