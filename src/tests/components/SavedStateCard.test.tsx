import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SavedStateCard from "../../components/SavedStateCard";
import { SavedState } from "../../types";

const mockState: SavedState = {
  id: "test-id-1",
  name: "GET api.example.com",
  url: "https://api.example.com/v1/users?page=1",
  curl: {
    method: "GET",
    headers: {},
    body: "",
    options: [],
  },
  savedAt: Date.now(),
};

describe("SavedStateCard", () => {
  const mockOnLoad = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnRename = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render method badge and state name", () => {
    render(
      <SavedStateCard
        savedState={mockState}
        onLoad={mockOnLoad}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
      />,
    );

    expect(screen.getByText("GET")).toBeInTheDocument();
    expect(screen.getByLabelText("Saved state name")).toHaveTextContent(
      "GET api.example.com",
    );
  });

  it("should render truncated URL", () => {
    render(
      <SavedStateCard
        savedState={mockState}
        onLoad={mockOnLoad}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
      />,
    );

    // The URL preview shows hostname + path + search
    expect(
      screen.getByText("api.example.com/v1/users?page=1"),
    ).toBeInTheDocument();
  });

  it("should enter edit mode when title is clicked", () => {
    render(
      <SavedStateCard
        savedState={mockState}
        onLoad={mockOnLoad}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
      />,
    );

    const nameButton = screen.getByLabelText("Saved state name");
    fireEvent.click(nameButton);

    const input = screen.getByLabelText("Edit saved state name");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("GET api.example.com");
  });

  it("should call onRename when Enter is pressed in edit mode", () => {
    render(
      <SavedStateCard
        savedState={mockState}
        onLoad={mockOnLoad}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
      />,
    );

    fireEvent.click(screen.getByLabelText("Saved state name"));

    const input = screen.getByLabelText("Edit saved state name");
    fireEvent.change(input, { target: { value: "My Custom Name" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(mockOnRename).toHaveBeenCalledWith("test-id-1", "My Custom Name");
  });

  it("should call onRename when input loses focus", () => {
    render(
      <SavedStateCard
        savedState={mockState}
        onLoad={mockOnLoad}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
      />,
    );

    fireEvent.click(screen.getByLabelText("Saved state name"));

    const input = screen.getByLabelText("Edit saved state name");
    fireEvent.change(input, { target: { value: "Blur Name" } });
    fireEvent.blur(input);

    expect(mockOnRename).toHaveBeenCalledWith("test-id-1", "Blur Name");
  });

  it("should not call onRename if name is unchanged", () => {
    render(
      <SavedStateCard
        savedState={mockState}
        onLoad={mockOnLoad}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
      />,
    );

    fireEvent.click(screen.getByLabelText("Saved state name"));

    const input = screen.getByLabelText("Edit saved state name");
    fireEvent.keyDown(input, { key: "Enter" });

    expect(mockOnRename).not.toHaveBeenCalled();
  });

  it("should cancel edit on Escape", () => {
    render(
      <SavedStateCard
        savedState={mockState}
        onLoad={mockOnLoad}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
      />,
    );

    fireEvent.click(screen.getByLabelText("Saved state name"));

    const input = screen.getByLabelText("Edit saved state name");
    fireEvent.change(input, { target: { value: "changed" } });
    fireEvent.keyDown(input, { key: "Escape" });

    // Should exit edit mode without calling rename
    expect(mockOnRename).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Saved state name")).toHaveTextContent(
      "GET api.example.com",
    );
  });

  it("should call onLoad when load button is clicked", () => {
    render(
      <SavedStateCard
        savedState={mockState}
        onLoad={mockOnLoad}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
      />,
    );

    fireEvent.click(screen.getByLabelText("Load saved state"));
    expect(mockOnLoad).toHaveBeenCalledWith("test-id-1");
  });

  it("should call onDelete when delete button is clicked", () => {
    render(
      <SavedStateCard
        savedState={mockState}
        onLoad={mockOnLoad}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
      />,
    );

    fireEvent.click(screen.getByLabelText("Delete saved state"));
    expect(mockOnDelete).toHaveBeenCalledWith("test-id-1");
  });

  it("should show correct colors for different methods", () => {
    const postState: SavedState = {
      ...mockState,
      curl: { ...mockState.curl, method: "POST" },
    };

    render(
      <SavedStateCard
        savedState={postState}
        onLoad={mockOnLoad}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
      />,
    );

    expect(screen.getByText("POST")).toBeInTheDocument();
  });
});
