import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { SavedState, CurlOptions } from "../types";

const STORAGE_KEY = "saved-states";

/**
 * Generates a default name for a saved state from the method and URL hostname.
 */
export function generateDefaultName(url: string, method: string): string {
  try {
    const parsed = new URL(url);
    return `${method} ${parsed.hostname}`;
  } catch {
    return `${method} ${url.slice(0, 30)}`;
  }
}

/**
 * Hook providing CRUD operations for saved states in localStorage.
 */
export function useSavedStates() {
  const [savedStates, setSavedStates] = useLocalStorage<SavedState[]>(
    STORAGE_KEY,
    [],
  );

  const saveState = useCallback(
    (url: string, curl: CurlOptions) => {
      const newState: SavedState = {
        id: crypto.randomUUID(),
        name: generateDefaultName(url, curl.method),
        url,
        curl,
        savedAt: Date.now(),
      };
      setSavedStates((prev) => [...prev, newState]);
      return newState;
    },
    [setSavedStates],
  );

  const deleteState = useCallback(
    (id: string) => {
      setSavedStates((prev) => prev.filter((s) => s.id !== id));
    },
    [setSavedStates],
  );

  const renameState = useCallback(
    (id: string, newName: string) => {
      setSavedStates((prev) =>
        prev.map((s) => (s.id === id ? { ...s, name: newName } : s)),
      );
    },
    [setSavedStates],
  );

  const getState = useCallback(
    (id: string): SavedState | undefined => {
      return savedStates.find((s) => s.id === id);
    },
    [savedStates],
  );

  return {
    savedStates,
    saveState,
    deleteState,
    renameState,
    getState,
  };
}
