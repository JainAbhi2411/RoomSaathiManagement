import { useEffect, useCallback, useRef } from 'react';

interface FormPersistenceOptions {
  key: string;
  debounceMs?: number;
}

export function useFormPersistence<T>(
  formData: T,
  options: FormPersistenceOptions
) {
  const { key, debounceMs = 1000 } = options;
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isInitialMount = useRef(true);

  // Save form data to localStorage
  const saveToStorage = useCallback((data: T) => {
    try {
      const savedData = {
        formData: data,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(savedData));
    } catch (error) {
      console.error('Failed to save form data:', error);
    }
  }, [key]);

  // Load form data from localStorage
  const loadFromStorage = useCallback((): { formData: T; timestamp: string } | null => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load form data:', error);
    }
    return null;
  }, [key]);

  // Clear saved form data
  const clearStorage = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear form data:', error);
    }
  }, [key]);

  // Auto-save with debouncing
  useEffect(() => {
    // Skip auto-save on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      saveToStorage(formData);
    }, debounceMs);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formData, debounceMs, saveToStorage]);

  return {
    saveToStorage,
    loadFromStorage,
    clearStorage,
  };
}
