import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage, logError } from '../utils/errors';

/**
 * Runs an async loader and tracks { data, loading, error }.
 * Re-runs when `deps` change or `reload()` is called; ignores stale results.
 */
export function useAsync(loader, deps = [], { enabled = true } = {}) {
  const [state, setState] = useState({ data: null, loading: enabled, error: null });
  const [tick, setTick] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    loaderRef
      .current()
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((err) => {
        logError('useAsync', err);
        if (!cancelled) setState({ data: null, loading: false, error: getErrorMessage(err) });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick, enabled]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
