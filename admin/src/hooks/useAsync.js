import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage, logError } from '../utils/errors';

/** { data, loading, error, reload, setData } for a one-shot async loader. */
export function useAsync(loader, deps = [], { enabled = true } = {}) {
  const [state, setState] = useState({ data: null, loading: enabled, error: null });
  const [tick, setTick] = useState(0);
  const ref = useRef(loader);
  ref.current = loader;

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    ref
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
  const setData = useCallback((updater) => setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater })), []);
  return { ...state, reload, setData };
}
