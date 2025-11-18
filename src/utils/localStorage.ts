// src/utils/localStorage.ts

/**
 * Retrieves an item from localStorage and parses it as JSON.
 * @param key The key of the item to retrieve.
 * @returns The parsed item, or null if the item doesn't exist or parsing fails.
 */
export function getItem<T>(key: string): T | null {
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch (error) {
    console.warn(`Error reading localStorage key “${key}”:`, error);
    return null;
  }
}

/**
 * Stores an item in localStorage after converting it to a JSON string.
 * @param key The key under which to store the item.
 * @param value The value to store.
 */
export function setItem<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error setting localStorage key “${key}”:`, error);
  }
}
