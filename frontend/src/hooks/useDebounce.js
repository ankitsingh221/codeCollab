import { useRef, useCallback } from 'react';

export const useDebouncedCallback = (callback, delay) => {
  const timeoutRef = useRef(null);

  const debounced = useCallback(
    (...args) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return [debounced, cancel];
};