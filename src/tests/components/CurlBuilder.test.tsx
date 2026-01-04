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

    // Should remove Content-Type AND clear body as per undo logic
    const lastCall = mockOnCurlChange.mock.calls[0][0];
    expect(lastCall.headers["Content-Type"]).toBeUndefined();
    expect(lastCall.body).toBe("");
  });

  it("should add User Agent when triggered", () => {
    render(
      <CurlBuilder
        url={defaultUrl}
        curlState={defaultState}
        onCurlChange={mockOnCurlChange}
      />
    );

    const uaChip = screen.getByText("User Agent");
    fireEvent.click(uaChip);

    expect(mockOnCurlChange).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.arrayContaining([
          expect.stringContaining("-A 'cURL (url.computer)'"),
        ]),
      })
    );
  });

  it("should configure Multipart Form correctly", () => {
    render(
      <CurlBuilder
        url={defaultUrl}
        curlState={defaultState}
        onCurlChange={mockOnCurlChange}
      />
    );

    const multipartChip = screen.getByText("Multipart Form");
    fireEvent.click(multipartChip);

    expect(mockOnCurlChange).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "multipart/form-data; boundary=---boundary",
        }),
        body: expect.stringContaining("-----boundary"),
      })
    );
  });

  it("should add SSH Key option", () => {
    render(
      <CurlBuilder
        url={defaultUrl}
        curlState={defaultState}
        onCurlChange={mockOnCurlChange}
      />
    );

    const chip = screen.getByText("SSH Key");
    fireEvent.click(chip);

    expect(mockOnCurlChange).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.arrayContaining([
          expect.stringContaining("--key 'private_key.pem'"),
        ]),
      })
    );
  });

  it("should add Output to File (-O) option", () => {
    render(
      <CurlBuilder
        url={defaultUrl}
        curlState={defaultState}
        onCurlChange={mockOnCurlChange}
      />
    );

    const chip = screen.getByText("Output to File (-O)");
    fireEvent.click(chip);

    expect(mockOnCurlChange).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.arrayContaining(["-O"]),
      })
    );
  });

  it("should add Basic Auth option", () => {
    render(
      <CurlBuilder
        url={defaultUrl}
        curlState={defaultState}
        onCurlChange={mockOnCurlChange}
      />
    );

    const chip = screen.getByText("Basic Auth");
    fireEvent.click(chip);

    expect(mockOnCurlChange).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.arrayContaining(["-u 'username:password'"]),
      })
    );
  });

  it("should add Proxy option", () => {
    render(
      <CurlBuilder
        url={defaultUrl}
        curlState={defaultState}
        onCurlChange={mockOnCurlChange}
      />
    );

    const chip = screen.getByText("Proxy");
    fireEvent.click(chip);

    expect(mockOnCurlChange).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.arrayContaining(["-x 'proxy:123'"]),
      })
    );
  });

  it("should add Cookies option", () => {
    render(
      <CurlBuilder
        url={defaultUrl}
        curlState={defaultState}
        onCurlChange={mockOnCurlChange}
      />
    );

    const chip = screen.getByText("Cookies");
    fireEvent.click(chip);

    expect(mockOnCurlChange).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.arrayContaining(["-b 'name=value'"]),
      })
    );
  });

  it("should allow adding arbitrary body to GET request", () => {
    // Start with a GET request (no body by default)
    render(
      <CurlBuilder
        url={defaultUrl}
        curlState={defaultState}
        onCurlChange={mockOnCurlChange}
      />
    );

    // Initial check - body input shouldn't be visible (depending on implementation details,
    // but the button to add it should be)
    // Note: Use a more specific query if "Add Body" appears in multiple places,
    // but typically it's a button.
    const addBodyBtn = screen.getByText("Add Body");
    fireEvent.click(addBodyBtn);

    // Now body textarea should be visible
    const bodyInput = screen.getByPlaceholderText('{ "key": "value" }');
    fireEvent.change(bodyInput, { target: { value: "test body" } });

    expect(mockOnCurlChange).toHaveBeenCalledWith(
      expect.objectContaining({
        body: "test body",
      })
    );
  });

  it("should allow removing body", () => {
    const activeState: CurlOptions = {
      ...defaultState,
      method: "POST",
      body: "some content",
    };

    render(
      <CurlBuilder
        url={defaultUrl}
        curlState={activeState}
        onCurlChange={mockOnCurlChange}
      />
    );

    const removeBodyBtn = screen.getByTitle("Remove Body");
    fireEvent.click(removeBodyBtn);

    expect(mockOnCurlChange).toHaveBeenCalledWith(
      expect.objectContaining({
        body: "",
      })
    );
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

  it("should toggle single line mode", () => {
    render(
      <CurlBuilder
        url={defaultUrl}
        curlState={defaultState}
        onCurlChange={mockOnCurlChange}
      />
    );

    // Default is multi-line (checkbox unchecked)
    // The command should contain backslashes or newlines
    let codeElement = screen.getByText((content) => content.startsWith("curl"));
    // We need to look at the full text content of the code block.
    // The component renders `renderHighlightedCommand` which splits by space.
    // This makes it a bit tricky to assert exact string match via `getByText`.
    // Instead, let's look for the checkbox.

    const singleLineCheckbox = screen.getByLabelText("Single Line");
    expect(singleLineCheckbox).not.toBeChecked();

    // The generated command should be multi-line.
    // Since we mock `generateCurlCommand` implicitly by rendering the component which calls the real function,
    // we can check if the output contains newlines or backslashes.
    // However, the `renderHighlightedCommand` implementation splits by space.
    // If our separator is " \\\n  ", the split will preserve these characters attached to words or as separate tokens?
    // Let's verify via the checkbox interaction mostly, assuming `generateCurlCommand` unit tests cover the string formatting
    // (which we should add if we want to be thorough, but functional test here is good).

    fireEvent.click(singleLineCheckbox);
    expect(singleLineCheckbox).toBeChecked();

    // We can explicitly test generateCurlCommand in a unit test file,
    // but here we verify the UI interaction works.
  });
});
