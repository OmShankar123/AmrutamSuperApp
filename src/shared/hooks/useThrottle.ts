import { useEffect, useRef, useState } from 'react';

/**
 * Throttles a value to only update at most once every `interval` ms.
 *
 * @param value The value to throttle
 * @param interval Minimum interval between updates in ms (default: 350ms)
 */
export function useThrottle<T>(value: T, interval = 350): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(0);

  useEffect(() => {
    const now = Date.now();
    const timeRemaining = interval - (now - lastExecuted.current);

    if (timeRemaining <= 0) {
      lastExecuted.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, timeRemaining);

      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}
