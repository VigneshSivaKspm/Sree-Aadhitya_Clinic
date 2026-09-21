import { db, isFirebaseConfigured } from '../config/firebase';
import { DEMO_ENABLED } from '../config/site';
import { AppError } from '../utils/errors';

export { isFirebaseConfigured };

/** Returns the Firestore instance or throws a friendly error when Firebase isn't configured. */
export function getDb() {
  if (!db) throw new AppError('This feature isn’t available yet because the site is still being set up.', 'unconfigured');
  return db;
}

export const mapDoc = (snap) => ({ id: snap.id, ...snap.data() });

export const byOrder = (a, b) =>
  (a.displayOrder ?? 999) - (b.displayOrder ?? 999) || String(a.name || '').localeCompare(String(b.name || ''));

/**
 * Runs `fetcher`; while the collection is empty (or Firebase isn't configured yet)
 * falls back to clearly-labelled demo content if DEMO_ENABLED.
 */
export async function withDemo(fetcher, demoFn) {
  if (!isFirebaseConfigured) {
    if (DEMO_ENABLED) return demoFn();
    throw new AppError('This feature isn’t available yet because the site is still being set up.', 'unconfigured');
  }
  const data = await fetcher();
  const empty = Array.isArray(data) ? data.length === 0 : data == null;
  if (DEMO_ENABLED && empty) return demoFn();
  return data;
}
