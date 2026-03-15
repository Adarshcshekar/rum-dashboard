import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Generic data-fetching hook with loading, error, and auto-refresh.
 * @param {Function} fetcher  - async function that returns data
 * @param {Array}    deps     - re-fetch when these change
 * @param {number}   interval - auto-refresh interval in ms (0 = off)
 */
export function useFetch(fetcher, deps = [], interval = 0) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      if (mountedRef.current) setData(result);
    } catch (err) {
      if (mountedRef.current) setError(err.message);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    load();
    if (interval > 0) {
      const timer = setInterval(load, interval);
      return () => { clearInterval(timer); mountedRef.current = false; };
    }
    return () => { mountedRef.current = false; };
  }, [load, interval]);

  return { data, loading, error, refetch: load };
}
