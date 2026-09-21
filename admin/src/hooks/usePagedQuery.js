import { collection, getDocs, limit, query, startAfter } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { db } from '../config/firebase';
import { getErrorMessage, logError } from '../utils/errors';

/**
 * Cursor-paginated Firestore list ("load more"), so admin lists never read a whole collection.
 * `constraints` (where/orderBy) is re-evaluated whenever `deps` change.
 */
export function usePagedQuery(collectionName, constraints, deps = [], { pageSize = 25, enabled = true } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [tick, setTick] = useState(0);
  const cursor = useRef(null);
  const constraintsRef = useRef(constraints);
  constraintsRef.current = constraints;

  const fetchPage = useCallback(
    async (after) => {
      const parts = [...constraintsRef.current, limit(pageSize)];
      if (after) parts.push(startAfter(after));
      const snap = await getDocs(query(collection(db, collectionName), ...parts));
      return { docs: snap.docs, rows: snap.docs.map((d) => ({ id: d.id, ...d.data() })) };
    },
    [collectionName, pageSize],
  );

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    setLoading(true);
    setError('');
    cursor.current = null;
    fetchPage(null)
      .then(({ docs, rows }) => {
        if (cancelled) return;
        cursor.current = docs[docs.length - 1] || null;
        setItems(rows);
        setHasMore(docs.length === pageSize);
      })
      .catch((err) => {
        logError(`list:${collectionName}`, err);
        if (!cancelled) {
          setItems([]);
          setHasMore(false);
          setError(getErrorMessage(err));
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick, enabled]);

  const loadMore = useCallback(async () => {
    if (!cursor.current || loadingMore) return;
    setLoadingMore(true);
    try {
      const { docs, rows } = await fetchPage(cursor.current);
      cursor.current = docs[docs.length - 1] || cursor.current;
      setItems((prev) => [...prev, ...rows]);
      setHasMore(docs.length === pageSize);
    } catch (err) {
      logError(`list-more:${collectionName}`, err);
      setError(getErrorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, loadingMore, pageSize, collectionName]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  const patchItem = useCallback((id, patch) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i))), []);
  const removeItem = useCallback((id) => setItems((prev) => prev.filter((i) => i.id !== id)), []);

  return { items, loading, loadingMore, error, hasMore, loadMore, reload, patchItem, removeItem };
}
