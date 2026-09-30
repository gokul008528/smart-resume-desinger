import { useCallback, useEffect, useRef } from 'react';

// Returns a debounced version of the callback (used for autosave).
export function useDebouncedCallback(callback, delay = 1200) {
  const timer = useRef(null);
  const fn = useRef(callback);
  fn.current = callback;

  useEffect(() => () => clearTimeout(timer.current), []);

  return useCallback(
    (...args) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => fn.current(...args), delay);
    },
    [delay]
  );
}
