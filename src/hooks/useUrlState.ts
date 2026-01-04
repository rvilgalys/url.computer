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

  // Read from hash or raw URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.slice(1);
      const parsed = parseHash(hash);

      if (parsed) {
        setState(parsed);
        setIsInitialized(true);
        return;
      }

      // If no hash, check for raw URL in path
      let pathname = window.location.pathname;
      const search = window.location.search;
      let isCleanMode = false;

      // Check for clean mode
      if (pathname.startsWith("/clean/") || pathname === "/clean") {
        isCleanMode = true;
        pathname = pathname.replace(/^\/clean\/?/, "/");
      }

      // Remove leading slash to get potential URL
      // Decode pathname to handle encoded slashes/colons if any
      let rawPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;
      try {
        rawPath = decodeURIComponent(rawPath);
      } catch (e) {
        // ignore decoding errors
      }

      // Check if it looks like a http/https URL
      // We allow 1 or 2 slashes to handle potential browser normalization
      const match = rawPath.match(/^(https?:\/{1,2})/i);
      if (match) {
        // Normalize to double slash if needed for standard URL parsing
        if (match[1].endsWith(":/")) {
          // http:/ case
          rawPath = rawPath.replace(
            /^https?:\//i,
            match[0].replace(":/", "://")
          );
        }

        let importedUrl = rawPath + search;

        if (isCleanMode) {
          try {
            const tempUrl = new URL(importedUrl);
            tempUrl.search = "";
            importedUrl = tempUrl.toString();
          } catch (e) {
            // If invalid, leave as is or maybe don't clean
            console.error("[useUrlState] Failed to clean URL", e);
          }
        }

        setState({
          ...defaultState,
          url: importedUrl,
        });
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
      // If we are at a non-root path (e.g. /http://...), we should still clean it up to /
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        window.history.replaceState(null, "", "/");
      }
      return;
    }

    const compressedState = lz.compressToBase64(serializedState);
    if (typeof window !== "undefined") {
      const newHash = `#${compressedState}`;
      const targetPath = "/";

      // If the hash changed OR the path is not root (meaning we just imported a URL), update history
      if (
        window.location.hash !== newHash ||
        window.location.pathname !== targetPath
      ) {
        window.history.replaceState(null, "", targetPath + newHash);
      }
    }
  }, [state, isInitialized]);

  return [state, setState] as const;
};
