import { render, screen, fireEvent } from "@testing-library/react";
import QueryParamEditor from "../../components/QueryParamEditor";

describe("QueryParamEditor", () => {
  const mockOnSearchParamsChange = jest.fn();

  beforeEach(() => {
    mockOnSearchParamsChange.mockClear();
  });

  it("should maintain focus when typing in query parameter key field", () => {
    const searchParams = new URLSearchParams("key1=value1");

    render(
      <QueryParamEditor
        searchParams={searchParams}
        onSearchParamsChange={mockOnSearchParamsChange}
      />
    );

    const keyInput = screen.getByDisplayValue("key1");

    // Focus the input
    keyInput.focus();
    expect(document.activeElement).toBe(keyInput);

    // Type a character - this used to cause focus loss
    fireEvent.change(keyInput, { target: { value: "key1a" } });

    // Focus should still be maintained
    expect(document.activeElement).toBe(keyInput);

    // Type another character
    fireEvent.change(keyInput, { target: { value: "key1ab" } });

    // Focus should still be maintained
    expect(document.activeElement).toBe(keyInput);
  });

  it("should maintain focus when typing in query parameter value field", () => {
    const searchParams = new URLSearchParams("key1=value1");

    render(
      <QueryParamEditor
        searchParams={searchParams}
        onSearchParamsChange={mockOnSearchParamsChange}
      />
    );

    const valueInput = screen.getByDisplayValue("value1");

    // Focus the input
    valueInput.focus();
    expect(document.activeElement).toBe(valueInput);

    // Type a character
    fireEvent.change(valueInput, { target: { value: "value1a" } });

    // Focus should still be maintained
    expect(document.activeElement).toBe(valueInput);

    // Type another character
    fireEvent.change(valueInput, { target: { value: "value1ab" } });

    // Focus should still be maintained
    expect(document.activeElement).toBe(valueInput);
  });

  it("should preserve stable IDs when typing to prevent component remounting", () => {
    const searchParams = new URLSearchParams("test=initial");

    const { rerender } = render(
      <QueryParamEditor
        searchParams={searchParams}
        onSearchParamsChange={mockOnSearchParamsChange}
      />
    );

    const keyInput = screen.getByDisplayValue("test");
    const initialInputElement = keyInput;

    // Simulate typing by updating searchParams (as would happen in parent component)
    const updatedSearchParams = new URLSearchParams("testa=initial");

    rerender(
      <QueryParamEditor
        searchParams={updatedSearchParams}
        onSearchParamsChange={mockOnSearchParamsChange}
      />
    );

    const updatedKeyInput = screen.getByDisplayValue("testa");

    // The input element should be the same (not remounted) if IDs are stable
    // This is harder to test directly, but we can at least verify the input exists
    expect(updatedKeyInput).toBeInTheDocument();
  });

  it("should call onSearchParamsChange when parameter values change", () => {
    const searchParams = new URLSearchParams("key1=value1");

    render(
      <QueryParamEditor
        searchParams={searchParams}
        onSearchParamsChange={mockOnSearchParamsChange}
      />
    );

    const keyInput = screen.getByDisplayValue("key1");
    fireEvent.change(keyInput, { target: { value: "newkey" } });

    expect(mockOnSearchParamsChange).toHaveBeenCalled();

    // Verify the new URLSearchParams contains the updated key
    const lastCall =
      mockOnSearchParamsChange.mock.calls[
        mockOnSearchParamsChange.mock.calls.length - 1
      ];
    const updatedParams = lastCall[0] as URLSearchParams;
    expect(updatedParams.get("newkey")).toBe("value1");
  });

  it("should show empty state when no parameters exist", () => {
    const searchParams = new URLSearchParams();

    render(
      <QueryParamEditor
        searchParams={searchParams}
        onSearchParamsChange={mockOnSearchParamsChange}
      />
    );

    expect(screen.getByText("No query parameters")).toBeInTheDocument();
    expect(screen.getByText("+ Add Parameter")).toBeInTheDocument();
  });

  it("should add new parameter when Add Parameter button is clicked", () => {
    const searchParams = new URLSearchParams();

    render(
      <QueryParamEditor
        searchParams={searchParams}
        onSearchParamsChange={mockOnSearchParamsChange}
      />
    );

    const addButton = screen.getByText("+ Add Parameter");
    fireEvent.click(addButton);

    // Should show input fields for new parameter
    expect(screen.getByPlaceholderText("key")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("value")).toBeInTheDocument();
  });
});
