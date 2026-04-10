import { useState, useEffect } from "react";
import { AppState } from "../types";
import lz from "lz-string";

const defaultState: AppState = {
  url: "https://httpbin.org/get?foo=bar&page=1",
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

/**
 * Attempts to parse a URL from the pathname.
 * Supports:
 * - Full URLs with protocol: /http://example.com or /https://example.com
 * - Simple domain URLs: /example.com or /api.github.com/user/repo
 * - Clean mode prefix: /clean/... strips query params from the result
 *
 * @returns The parsed URL string and clean mode flag, or null if not a valid URL pattern
 */
export const parsePathAsUrl = (
  pathname: string,
  search: string,
): { url: string; isCleanMode: boolean } | null => {
  let path = pathname;
  let isCleanMode = false;

  // Check for clean mode prefix
  if (path.startsWith("/clean/") || path === "/clean") {
    isCleanMode = true;
    path = path.replace(/^\/clean\/?/, "/");
  }

  // Remove leading slash
  let rawPath = path.startsWith("/") ? path.slice(1) : path;

  // Decode pathname to handle encoded slashes/colons
  try {
    rawPath = decodeURIComponent(rawPath);
  } catch {
    // ignore decoding errors
  }

  // Empty path - nothing to import
  if (!rawPath) {
    return null;
  }

  // Check for full URL with protocol (http:// or https://)
  // Allow 1 or 2 slashes to handle potential browser normalization
  const protocolMatch = rawPath.match(/^(https?:\/{1,2})/i);
  if (protocolMatch) {
    // Normalize to double slash if needed
    if (protocolMatch[1].endsWith(":/")) {
      rawPath = rawPath.replace(
        /^https?:\//i,
        protocolMatch[0].replace(":/", "://"),
      );
    }

    let importedUrl = rawPath + search;

    if (isCleanMode) {
      try {
        const tempUrl = new URL(importedUrl);
        tempUrl.search = "";
        importedUrl = tempUrl.toString();
      } catch {
        console.error("[useUrlState] Failed to clean URL");
      }
    }

    return { url: importedUrl, isCleanMode };
  }

  // Check for simple domain URL (no protocol)
  // Pattern: starts with alphanumeric, contains at least one dot, followed by valid TLD
  // Examples: example.com, api.github.com, foo.bar.co.uk
  const domainPattern = /^[a-zA-Z0-9][\w.-]*\.[a-zA-Z]{2,}/;
  if (domainPattern.test(rawPath)) {
    // Prepend https:// as default protocol
    let importedUrl = "https://" + rawPath + search;

    if (isCleanMode) {
      try {
        const tempUrl = new URL(importedUrl);
        tempUrl.search = "";
        importedUrl = tempUrl.toString();
      } catch {
        console.error("[useUrlState] Failed to clean simple URL");
      }
    }

    return { url: importedUrl, isCleanMode };
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
      const pathname = window.location.pathname;
      const search = window.location.search;
      const result = parsePathAsUrl(pathname, search);

      if (result) {
        setState({
          ...defaultState,
          url: result.url,
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
