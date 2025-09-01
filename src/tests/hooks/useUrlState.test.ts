import { renderHook, act } from "@testing-library/react";
import { useUrlState } from "../../hooks/useUrlState";
import { AppState } from "../../types";
import lz from "lz-string";

// The default state from the hook implementation
const defaultState: AppState = {
  url: "https://api.example.com/v1/users?page=1&pageSize=10",
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

  it("should initialize with state from a valid URL hash", () => {
    const testState: AppState = { ...defaultState, url: "http://test.com" };
    const compressedState = lz.compressToBase64(JSON.stringify(testState));
    setUrlHash(compressedState);

    const { result } = renderHook(() => useUrlState());
    expect(result.current[0]).toEqual(testState);
  });

  it("should return default state if the URL hash is invalid or corrupted", () => {
    setUrlHash("this-is-not-valid-base64-or-json");
    const { result } = renderHook(() => useUrlState());
    expect(result.current[0]).toEqual(defaultState);
  });

  it("should update the URL hash when the state changes", () => {
    const { result } = renderHook(() => useUrlState());
    const newState: AppState = { ...defaultState, url: "http://new-url.com" };

    act(() => {
      result.current[1](newState);
    });

    const expectedHash = lz.compressToBase64(JSON.stringify(newState));
    expect(window.location.hash).toEqual(`#${expectedHash}`);
  });

  it("should not create a hash on initial render if state is default and no hash exists", () => {
    renderHook(() => useUrlState());
    expect(window.location.hash).toEqual("");
  });

  it("should update the hash when state changes from a custom state back to the default state", () => {
    const testState: AppState = { ...defaultState, url: "http://test.com" };
    const compressedState = lz.compressToBase64(JSON.stringify(testState));
    setUrlHash(compressedState);

    const { result } = renderHook(() => useUrlState());
    expect(result.current[0]).toEqual(testState); // Verify initial state from hash

    act(() => {
      result.current[1](defaultState); // Update state back to default
    });

    const expectedHash = lz.compressToBase64(JSON.stringify(defaultState));
    expect(window.location.hash).toEqual(`#${expectedHash}`);
  });
});
