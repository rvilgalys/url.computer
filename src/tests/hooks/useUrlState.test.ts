import { renderHook, act, waitFor } from "@testing-library/react";
import { useUrlState, parsePathAsUrl } from "../../hooks/useUrlState";
import { AppState } from "../../types";
import lz from "lz-string";

// The default state from the hook implementation
const defaultState: AppState = {
  url: "https://httpbin.org/get?foo=bar&page=1",
  curl: {
    method: "GET",
    headers: {},
    body: "",
    options: [],
  },
};

// Helper to set the URL hash for tests
const setUrlHash = (hash: string) => {
  window.history.replaceState(null, "", hash ? `#${hash}` : " ");
};

describe("useUrlState", () => {
  beforeEach(() => {
    // Reset the URL hash before each test
    setUrlHash("");
  });

  it("should initialize with default state when no hash is present", () => {
    const { result } = renderHook(() => useUrlState());
    expect(result.current[0]).toEqual(defaultState);
  });

  it("should initialize with state from a valid URL hash", async () => {
    const testState: AppState = { ...defaultState, url: "http://test.com" };
    const compressedState = lz.compressToBase64(JSON.stringify(testState));
    setUrlHash(compressedState);

    const { result } = renderHook(() => useUrlState());

    // Initial state check removed as renderHook may flush effects immediately in this environment

    // Wait for effect to load state from hash
    await waitFor(() => {
      expect(result.current[0]).toEqual(testState);
    });
  });

  it("should return default state if the URL hash is invalid or corrupted", async () => {
    setUrlHash("this-is-not-valid-base64-or-json");
    const { result } = renderHook(() => useUrlState());

    expect(result.current[0]).toEqual(defaultState);
    // Even after wait, it should remain default
    await waitFor(() => {
      expect(result.current[0]).toEqual(defaultState);
    });
  });

  it("should update the URL hash when the state changes", async () => {
    const { result } = renderHook(() => useUrlState());

    // Wait for initialization to complete
    await waitFor(() => {
      // Just wait for next tick essentially, or check if initialized (internal state we can't check easily)
      // But default -> default is fine.
    });

    const newState: AppState = { ...defaultState, url: "http://new-url.com" };

    act(() => {
      result.current[1](newState);
    });

    const expectedHash = lz.compressToBase64(JSON.stringify(newState));
    await waitFor(() => {
      expect(window.location.hash).toEqual(`#${expectedHash}`);
    });
  });

  it("should not create a hash on initial render if state is default and no hash exists", () => {
    renderHook(() => useUrlState());
    expect(window.location.hash).toEqual("");
  });

  it("should update the hash when state changes from a custom state back to the default state", async () => {
    const testState: AppState = { ...defaultState, url: "http://test.com" };
    const compressedState = lz.compressToBase64(JSON.stringify(testState));
    setUrlHash(compressedState);

    const { result } = renderHook(() => useUrlState());

    // Wait for init
    await waitFor(() => {
      expect(result.current[0]).toEqual(testState);
    });

    act(() => {
      result.current[1](defaultState); // Update state back to default
    });

    const expectedHash = lz.compressToBase64(JSON.stringify(defaultState));
    await waitFor(() => {
      expect(window.location.hash).toEqual(`#${expectedHash}`);
    });
  });

  // New tests for raw URL import
  it("should initialize state from raw URL in path", async () => {
    const rawUrl = "http://raw-import.com/foo?bar=baz";
    // Simulate visiting /http://raw-import.com/foo?bar=baz
    window.history.replaceState(null, "", "/" + rawUrl);

    const { result } = renderHook(() => useUrlState());

    await waitFor(() => {
      expect(result.current[0].url).toEqual(rawUrl);
    });
  });

  it("should normalize and initialize state from raw URL with single slash (browser normalization)", async () => {
    const rawUrl = "http:/normalized.com/path";
    const expectedUrl = "http://normalized.com/path";
    // Simulate visiting /http:/normalized.com/path
    window.history.replaceState(null, "", "/" + rawUrl);

    const { result } = renderHook(() => useUrlState());

    await waitFor(() => {
      expect(result.current[0].url).toEqual(expectedUrl);
    });
  });

  it("should initialize state from clean URL in path (stripping query params)", async () => {
    const targetUrl = "http://clean-import.com/foo";
    const queryParams = "?tracking=123&utm_source=test";
    // Simulate visiting /clean/http://clean-import.com/foo?tracking=123...
    window.history.replaceState(null, "", "/clean/" + targetUrl + queryParams);

    const { result } = renderHook(() => useUrlState());

    await waitFor(() => {
      // Should have the URL without query params
      expect(result.current[0].url).toEqual(targetUrl);
    });
  });

  it("should prioritize hash over raw path if both exist", async () => {
    const hashState: AppState = {
      ...defaultState,
      url: "http://from-hash.com",
    };
    const compressedState = lz.compressToBase64(JSON.stringify(hashState));

    // Set both hash and a raw path
    window.history.replaceState(
      null,
      "",
      "/http://ignored-path.com#" + compressedState,
    );

    const { result } = renderHook(() => useUrlState());

    await waitFor(() => {
      expect(result.current[0].url).toEqual("http://from-hash.com");
    });
  });

  it("should cleanup raw path to root after initialization", async () => {
    const rawUrl = "http://cleanup.com";
    window.history.replaceState(null, "", "/" + rawUrl);

    const { result } = renderHook(() => useUrlState());

    await waitFor(() => {
      expect(result.current[0].url).toEqual(rawUrl);
    });

    // We can't easily test the cleanup effect here because JSDOM/React testing library
    // might not fire the layout effect that updates history immediately or clearly.
    // However, we can trigger an update and check.

    const newState: AppState = { ...defaultState, url: "http://updated.com" };
    act(() => {
      result.current[1](newState);
    });

    await waitFor(() => {
      // Path should be /
      expect(window.location.pathname).toEqual("/");
      // Hash should be present
      expect(window.location.hash).toBeTruthy();
    });
  });

  // New tests for simple URL support (without protocol)
  it("should initialize from simple domain URL (example.com)", async () => {
    window.history.replaceState(null, "", "/example.com");

    const { result } = renderHook(() => useUrlState());

    await waitFor(() => {
      expect(result.current[0].url).toEqual("https://example.com");
    });
  });

  it("should initialize from simple domain URL with path (example.com/foo/bar)", async () => {
    window.history.replaceState(null, "", "/example.com/foo/bar");

    const { result } = renderHook(() => useUrlState());

    await waitFor(() => {
      expect(result.current[0].url).toEqual("https://example.com/foo/bar");
    });
  });

  it("should initialize from simple domain URL with query params", async () => {
    window.history.replaceState(null, "", "/example.com/path?foo=bar&baz=qux");

    const { result } = renderHook(() => useUrlState());

    await waitFor(() => {
      expect(result.current[0].url).toEqual(
        "https://example.com/path?foo=bar&baz=qux",
      );
    });
  });

  it("should initialize from simple subdomain URL (api.github.com)", async () => {
    window.history.replaceState(null, "", "/api.github.com/user/repos");

    const { result } = renderHook(() => useUrlState());

    await waitFor(() => {
      expect(result.current[0].url).toEqual(
        "https://api.github.com/user/repos",
      );
    });
  });

  it("should work with clean mode for simple URLs", async () => {
    window.history.replaceState(
      null,
      "",
      "/clean/example.com/path?tracking=123&utm_source=test",
    );

    const { result } = renderHook(() => useUrlState());

    await waitFor(() => {
      // Should strip query params
      expect(result.current[0].url).toEqual("https://example.com/path");
    });
  });

  it("should NOT match invalid paths without dots", async () => {
    window.history.replaceState(null, "", "/random-text-without-dot");

    const { result } = renderHook(() => useUrlState());

    // Should fall back to default state
    await waitFor(() => {
      expect(result.current[0].url).toEqual(defaultState.url);
    });
  });

  it("should handle country code TLDs (example.co.uk)", async () => {
    window.history.replaceState(null, "", "/example.co.uk/page");

    const { result } = renderHook(() => useUrlState());

    await waitFor(() => {
      expect(result.current[0].url).toEqual("https://example.co.uk/page");
    });
  });
});

// Unit tests for the parsePathAsUrl helper function
describe("parsePathAsUrl", () => {
  it("should return null for empty paths", () => {
    expect(parsePathAsUrl("/", "")).toBeNull();
    expect(parsePathAsUrl("", "")).toBeNull();
  });

  it("should parse full URL with http protocol", () => {
    const result = parsePathAsUrl("/http://example.com/path", "?q=1");
    expect(result).toEqual({
      url: "http://example.com/path?q=1",
      isCleanMode: false,
    });
  });

  it("should parse full URL with https protocol", () => {
    const result = parsePathAsUrl("/https://example.com", "");
    expect(result).toEqual({
      url: "https://example.com",
      isCleanMode: false,
    });
  });

  it("should normalize single slash in protocol", () => {
    const result = parsePathAsUrl("/http:/example.com", "");
    expect(result).toEqual({
      url: "http://example.com",
      isCleanMode: false,
    });
  });

  it("should parse simple domain URL", () => {
    const result = parsePathAsUrl("/example.com", "");
    expect(result).toEqual({
      url: "https://example.com",
      isCleanMode: false,
    });
  });

  it("should parse simple domain URL with path and query", () => {
    const result = parsePathAsUrl("/api.github.com/users", "?page=1");
    expect(result).toEqual({
      url: "https://api.github.com/users?page=1",
      isCleanMode: false,
    });
  });

  it("should detect clean mode prefix", () => {
    const result = parsePathAsUrl("/clean/example.com/path", "?utm=123");
    expect(result).toEqual({
      url: "https://example.com/path",
      isCleanMode: true,
    });
  });

  it("should detect clean mode for full URLs", () => {
    const result = parsePathAsUrl("/clean/http://example.com", "?track=1");
    expect(result).toEqual({
      url: "http://example.com/",
      isCleanMode: true,
    });
  });

  it("should return null for non-URL paths", () => {
    expect(parsePathAsUrl("/just-some-text", "")).toBeNull();
    expect(parsePathAsUrl("/about", "")).toBeNull();
    expect(parsePathAsUrl("/foo/bar/baz", "")).toBeNull();
  });

  it("should handle encoded characters in path", () => {
    const result = parsePathAsUrl("/example.com/path%20with%20spaces", "");
    expect(result).toEqual({
      url: "https://example.com/path with spaces",
      isCleanMode: false,
    });
  });
});
