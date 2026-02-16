import { renderHook, act, waitFor } from "@testing-library/react";
import {
  useSavedStates,
  generateDefaultName,
} from "../../hooks/useSavedStates";

// Mock crypto.randomUUID for deterministic tests
let uuidCounter = 0;
beforeEach(() => {
  uuidCounter = 0;
  window.localStorage.clear();
  jest.clearAllMocks();

  // Deterministic UUIDs
  jest
    .spyOn(crypto, "randomUUID")
    .mockImplementation(
      () =>
        `test-uuid-${++uuidCounter}` as `${string}-${string}-${string}-${string}-${string}`,
    );
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("generateDefaultName", () => {
  it("should generate name from method and hostname for valid URLs", () => {
    expect(generateDefaultName("https://api.example.com/v1/users", "GET")).toBe(
      "GET api.example.com",
    );
  });

  it("should generate name from method and hostname for URLs with ports", () => {
    expect(generateDefaultName("http://localhost:3000/test", "POST")).toBe(
      "POST localhost",
    );
  });

  it("should fallback to truncated URL for invalid URLs", () => {
    expect(generateDefaultName("not-a-url", "DELETE")).toBe("DELETE not-a-url");
  });
});

describe("useSavedStates", () => {
  it("should initialize with empty array when no saved states exist", () => {
    const { result } = renderHook(() => useSavedStates());
    expect(result.current.savedStates).toEqual([]);
  });

  it("should load existing saved states from localStorage", async () => {
    const existingStates = [
      {
        id: "existing-1",
        name: "GET example.com",
        url: "https://example.com",
        curl: { method: "GET", headers: {}, body: "", options: [] },
        savedAt: 1000,
      },
    ];
    window.localStorage.setItem("saved-states", JSON.stringify(existingStates));

    const { result } = renderHook(() => useSavedStates());

    await waitFor(() => {
      expect(result.current.savedStates).toEqual(existingStates);
    });
  });

  it("should save a new state with auto-generated name", () => {
    const { result } = renderHook(() => useSavedStates());

    act(() => {
      result.current.saveState("https://api.example.com/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: '{"name":"test"}',
        options: [],
      });
    });

    expect(result.current.savedStates).toHaveLength(1);
    expect(result.current.savedStates[0]).toMatchObject({
      id: "test-uuid-1",
      name: "POST api.example.com",
      url: "https://api.example.com/v1/users",
      curl: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: '{"name":"test"}',
        options: [],
      },
    });
    expect(result.current.savedStates[0].savedAt).toBeGreaterThan(0);
  });

  it("should always append new states without overwriting", () => {
    const { result } = renderHook(() => useSavedStates());

    act(() => {
      result.current.saveState("https://example.com", {
        method: "GET",
        headers: {},
        body: "",
        options: [],
      });
    });

    act(() => {
      result.current.saveState("https://other.com", {
        method: "POST",
        headers: {},
        body: "",
        options: [],
      });
    });

    expect(result.current.savedStates).toHaveLength(2);
    expect(result.current.savedStates[0].id).toBe("test-uuid-1");
    expect(result.current.savedStates[1].id).toBe("test-uuid-2");
  });

  it("should delete a state by id", () => {
    const { result } = renderHook(() => useSavedStates());

    act(() => {
      result.current.saveState("https://example.com", {
        method: "GET",
        headers: {},
        body: "",
        options: [],
      });
    });
    act(() => {
      result.current.saveState("https://other.com", {
        method: "POST",
        headers: {},
        body: "",
        options: [],
      });
    });

    act(() => {
      result.current.deleteState("test-uuid-1");
    });

    expect(result.current.savedStates).toHaveLength(1);
    expect(result.current.savedStates[0].id).toBe("test-uuid-2");
  });

  it("should rename a state by id", () => {
    const { result } = renderHook(() => useSavedStates());

    act(() => {
      result.current.saveState("https://example.com", {
        method: "GET",
        headers: {},
        body: "",
        options: [],
      });
    });

    act(() => {
      result.current.renameState("test-uuid-1", "My Custom Name");
    });

    expect(result.current.savedStates[0].name).toBe("My Custom Name");
  });

  it("should get a state by id", () => {
    const { result } = renderHook(() => useSavedStates());

    act(() => {
      result.current.saveState("https://example.com", {
        method: "GET",
        headers: {},
        body: "",
        options: [],
      });
    });

    const found = result.current.getState("test-uuid-1");
    expect(found).toBeDefined();
    expect(found?.url).toBe("https://example.com");
  });

  it("should return undefined for non-existent id", () => {
    const { result } = renderHook(() => useSavedStates());
    expect(result.current.getState("nonexistent")).toBeUndefined();
  });

  it("should persist to localStorage on save", () => {
    const { result } = renderHook(() => useSavedStates());

    act(() => {
      result.current.saveState("https://example.com", {
        method: "GET",
        headers: {},
        body: "",
        options: [],
      });
    });

    const stored = JSON.parse(
      window.localStorage.getItem("saved-states") || "[]",
    );
    expect(stored).toHaveLength(1);
    expect(stored[0].url).toBe("https://example.com");
  });

  it("should persist to localStorage on delete", () => {
    const { result } = renderHook(() => useSavedStates());

    act(() => {
      result.current.saveState("https://example.com", {
        method: "GET",
        headers: {},
        body: "",
        options: [],
      });
    });

    act(() => {
      result.current.deleteState("test-uuid-1");
    });

    const stored = JSON.parse(
      window.localStorage.getItem("saved-states") || "[]",
    );
    expect(stored).toHaveLength(0);
  });

  it("should persist to localStorage on rename", () => {
    const { result } = renderHook(() => useSavedStates());

    act(() => {
      result.current.saveState("https://example.com", {
        method: "GET",
        headers: {},
        body: "",
        options: [],
      });
    });

    act(() => {
      result.current.renameState("test-uuid-1", "Renamed");
    });

    const stored = JSON.parse(
      window.localStorage.getItem("saved-states") || "[]",
    );
    expect(stored[0].name).toBe("Renamed");
  });
});
