import { render, screen, fireEvent } from "@testing-library/react";
import CurlBuilder from "../../components/CurlBuilder";
import { CurlOptions } from "../../types";

describe("CurlBuilder", () => {
  const mockOnCurlChange = jest.fn();
  const defaultUrl = "https://example.com";
  const defaultState: CurlOptions = {
    method: "GET",
    headers: {},
    body: "",
    options: [],
  };

  beforeEach(() => {
    mockOnCurlChange.mockClear();
  });

  it("should add verbose flag when Verbose recipe is clicked", () => {
    render(
      <CurlBuilder
        url={defaultUrl}
        curlState={defaultState}
        onCurlChange={mockOnCurlChange}
      />
    );

    const verboseChip = screen.getByText("Verbose (-v)");
    fireEvent.click(verboseChip);

    expect(mockOnCurlChange).toHaveBeenCalledWith(
      expect.objectContaining({
        options: ["-v"],
      })
    );
  });

  it("should remove verbose flag when Verbose recipe is clicked and already active", () => {
    const activeState: CurlOptions = {
      ...defaultState,
      options: ["-v"],
    };

    render(
      <CurlBuilder
        url={defaultUrl}
        curlState={activeState}
        onCurlChange={mockOnCurlChange}
      />
    );

    const verboseChip = screen.getByText("Verbose (-v)");

    // Verify it has the active class (yellow)
    expect(verboseChip.className).toContain("bg-elf-yellow");

    fireEvent.click(verboseChip);

    expect(mockOnCurlChange).toHaveBeenCalledWith(
      expect.objectContaining({
        options: [],
      })
    );
  });

  it("should add JSON body and headers when JSON Body recipe is clicked", () => {
    render(
      <CurlBuilder
        url={defaultUrl}
        curlState={defaultState}
        onCurlChange={mockOnCurlChange}
      />
    );

    const jsonChip = screen.getByText("JSON Body");
    fireEvent.click(jsonChip);

    expect(mockOnCurlChange).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        body: expect.stringContaining('"key": "value"'),
      })
    );
  });

  it("should remove Content-Type header when JSON Body recipe is toggled off", () => {
    const activeState: CurlOptions = {
      ...defaultState,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"key": "value"}',
    };

    render(
      <CurlBuilder
        url={defaultUrl}
        curlState={activeState}
        onCurlChange={mockOnCurlChange}
      />
    );

    const jsonChip = screen.getByText("JSON Body");
    fireEvent.click(jsonChip);

    // Should remove Content-Type but keep other state (like body/method) as per undo logic
    // The undo logic specifically removes the header.
    const lastCall = mockOnCurlChange.mock.calls[0][0];
    expect(lastCall.headers["Content-Type"]).toBeUndefined();
  });

  it("should toggle Bearer Token recipe", () => {
    // Test adding
    const { rerender } = render(
      <CurlBuilder
        url={defaultUrl}
        curlState={defaultState}
        onCurlChange={mockOnCurlChange}
      />
    );

    const tokenChip = screen.getByText("Bearer Token");
    fireEvent.click(tokenChip);

    expect(mockOnCurlChange).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer YOUR_TOKEN",
        }),
      })
    );

    // Test removing
    mockOnCurlChange.mockClear();
    const activeState: CurlOptions = {
      ...defaultState,
      headers: { Authorization: "Bearer YOUR_TOKEN" },
    };

    // Re-render with active state (simulating parent update)
    rerender(
      <CurlBuilder
        url={defaultUrl}
        curlState={activeState}
        onCurlChange={mockOnCurlChange}
      />
    );

    const activeTokenChip = screen.getByText("Bearer Token");
    fireEvent.click(activeTokenChip);

    const lastCall = mockOnCurlChange.mock.calls[0][0];
    expect(lastCall.headers["Authorization"]).toBeUndefined();
  });
});
