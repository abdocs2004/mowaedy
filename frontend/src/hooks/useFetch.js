import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Data fetching with loading / error / reload handling and automatic cancellation.
 * fetcher(signal) must return the API payload ({ data, meta }).
 * Previous data is kept while re-fetching so lists don't flash empty.
 */
export function useFetch(fetcher, deps = [], { enabled = true } = {}) {
  const [state, setState] = useState({ data: null, meta: null, loading: enabled, error: null });
  const [tick, setTick] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (!enabled) {
      setState((s) => ({ ...s, loading: false }));
      return undefined;
    }
    const ctrl = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcherRef
      .current(ctrl.signal)
      .then((res) => setState({ data: res.data ?? null, meta: res.meta ?? null, loading: false, error: null }))
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setState((s) => ({ ...s, loading: false, error: err }));
      });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick, enabled]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
