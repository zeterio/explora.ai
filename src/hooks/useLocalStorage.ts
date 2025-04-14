import { useState, useEffect } from 'react';

/**
 * Custom hook for persistent state with localStorage
 *
 * This hook provides a state variable that persists data in localStorage, automatically
 * syncing between tabs and surviving page refreshes. It works like useState but persists
 * the data to localStorage whenever it changes.
 *
 * @template T - The type of the stored value
 * @param key - The key to store the value under in localStorage
 * @param initialValue - The initial value to use if no value exists in localStorage
 * @returns A stateful value and a function to update it (similar to useState)
 *
 * @example
 * // Simple string storage
 * const [username, setUsername] = useLocalStorage('username', '');
 *
 * @example
 * // Object storage with TypeScript
 * interface User {
 *   id: number;
 *   name: string;
 * }
 * const [user, setUser] = useLocalStorage<User>('user', { id: 0, name: '' });
 *
 * @example
 * // Using the functional update form
 * const [count, setCount] = useLocalStorage('count', 0);
 * setCount(prevCount => prevCount + 1);
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Get from localStorage on init
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function to match useState's behavior
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Listen for changes to localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        setStoredValue(JSON.parse(e.newValue) as T);
      }
    };

    // Subscribe to storage events
    window.addEventListener('storage', handleStorageChange);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
}
