import { useEffect, useState } from 'react';

/**
 * A custom hook that returns a debounced version of the provided value.
 *
 * @template T - The type of the value to debounce.
 * @param {T} value - The value to be debounced.
 * @param {number} delay - The delay in milliseconds for debouncing.
 * @returns {T} - The debounced value.
 */
export function useDebounce<T>(value: T, delay: number): T {
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
