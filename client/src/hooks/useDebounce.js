import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value by the given delay
 * @param {*} value - The value to debounce
 * @param {number} delay - Debounce delay in ms (default 500)
 * @returns {*} The debounced value
 */
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
