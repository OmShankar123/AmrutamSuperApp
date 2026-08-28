import { useEffect, useState } from 'react';

/**
 * Debounces a value by delaying its propagation until `delay` ms
 * have passed without any new updates.
 *
 * @param value The value to debounce
 * @param delay Milliseconds to wait (default: 350ms)
 */
export function useDebounce<T>(value: T, delay = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
