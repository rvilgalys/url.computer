import { useState, useEffect } from "react";
import { AppState } from "../types";
import lz from "lz-string";

const defaultState: AppState = {
  url: "https://api.example.com/v1/users?page=1&pageSize=10",
  curl: {
    method: "GET",
    headers: {},
    body: "",
    options: [],
  },
};

const parseHash = (hash: string): AppState | null => {
  try {
    if (hash) {
      const decompressed = lz.decompressFromBase64(hash);
      if (decompressed) {
        return JSON.parse(decompressed);
      }
    }
  } catch (error) {
    console.error("Failed to parse state from URL hash", error);
  }
  return null;
};

export const useUrlState = () => {
  const [state, setState] = useState<AppState>(defaultState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Read from hash on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.slice(1);
      const parsed = parseHash(hash);
      if (parsed) {
        setState(parsed);
      }
      setIsInitialized(true);
    }
  }, []);

  // Sync state to hash
  useEffect(() => {
    if (!isInitialized) return;

    // We only want to update the hash if the state is not the default state,
    // or if a hash already exists. This prevents adding a hash to a clean URL on load.
    const currentHash =
      typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    const serializedState = JSON.stringify(state);

    // A simple deep-ish equal
    if (JSON.stringify(defaultState) === serializedState && !currentHash) {
      return;
    }

    const compressedState = lz.compressToBase64(serializedState);
    if (typeof window !== "undefined") {
      const newHash = `#${compressedState}`;
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, "", newHash);
      }
    }
  }, [state, isInitialized]);

  return [state, setState] as const;
};
