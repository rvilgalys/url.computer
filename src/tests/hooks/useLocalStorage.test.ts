import { renderHook, act, waitFor } from "@testing-library/react";
import { useLocalStorage } from "../../hooks/useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it("should return initial value when no value in localStorage", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));
    expect(result.current[0]).toBe("initial");
  });

  it("should return value from localStorage if exists", async () => {
    window.localStorage.setItem("test-key", JSON.stringify("stored"));
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    // Wait for the useEffect to sync from localStorage
    await waitFor(() => {
      expect(result.current[0]).toBe("stored");
    });
  });

  it("should update localStorage when state changes", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    act(() => {
      result.current[1]("new-value");
    });

    expect(result.current[0]).toBe("new-value");
    expect(window.localStorage.getItem("test-key")).toBe(
      JSON.stringify("new-value"),
    );
  });

  it("should support function updates", () => {
    const { result } = renderHook(() => useLocalStorage("count", 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
    expect(window.localStorage.getItem("count")).toBe(JSON.stringify(1));
  });

  it("should handle JSON parsing errors gracefully", () => {
    window.localStorage.setItem("test-key", "invalid-json");
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    // Should fallback to initial value on error
    expect(result.current[0]).toBe("initial");
  });
});
