import { render, screen, fireEvent } from "@testing-library/react";
import SavedStatesSidebar from "../../components/SavedStatesSidebar";
import { SavedState } from "../../types";

// Mock useLocalStorage to control sidebar open/close state
let mockIsOpen = false;
const mockSetIsOpen = jest.fn((value) => {
  if (typeof value === "function") {
    mockIsOpen = value(mockIsOpen);
  } else {
    mockIsOpen = value;
  }
});

jest.mock("../../hooks/useLocalStorage", () => ({
  useLocalStorage: (_key: string, _initial: boolean) => [
    mockIsOpen,
    mockSetIsOpen,
  ],
}));

const mockSavedStates: SavedState[] = [
  {
    id: "test-1",
    name: "GET api.example.com",
    url: "https://api.example.com/v1/users",
    curl: { method: "GET", headers: {}, body: "", options: [] },
    savedAt: 1000,
  },
  {
    id: "test-2",
    name: "POST localhost",
    url: "http://localhost:3000/api/data",
    curl: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"key":"value"}',
      options: [],
    },
    savedAt: 2000,
  },
];

describe("SavedStatesSidebar", () => {
  const mockOnLoad = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnRename = jest.fn();

  beforeEach(() => {
    mockIsOpen = false;
    jest.clearAllMocks();
  });

  it("should render toggle button", () => {
    render(
      <SavedStatesSidebar
        savedStates={[]}
        onLoad={mockOnLoad}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
      />,
    );

    expect(screen.getByLabelText("Open sidebar")).toBeInTheDocument();
  });

  it("should toggle sidebar open when button is clicked", () => {
    render(
      <SavedStatesSidebar
        savedStates={[]}
        onLoad={mockOnLoad}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
      />,
    );

    fireEvent.click(screen.getByLabelText("Open sidebar"));
    expect(mockSetIsOpen).toHaveBeenCalledWith(true);
  });

  it("should show empty state message when no saved states", () => {
    mockIsOpen = true;

    render(
      <SavedStatesSidebar
        savedStates={[]}
        onLoad={mockOnLoad}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
      />,
    );

    expect(screen.getByText("No saved states yet")).toBeInTheDocument();
  });

  it("should render saved state cards when sidebar is open", () => {
    mockIsOpen = true;

    render(
      <SavedStatesSidebar
        savedStates={mockSavedStates}
        onLoad={mockOnLoad}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
      />,
    );

    expect(screen.getByText("GET api.example.com")).toBeInTheDocument();
    expect(screen.getByText("POST localhost")).toBeInTheDocument();
  });

  it("should show correct count in header", () => {
    mockIsOpen = true;

    render(
      <SavedStatesSidebar
        savedStates={mockSavedStates}
        onLoad={mockOnLoad}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
      />,
    );

    expect(screen.getByText("(2)")).toBeInTheDocument();
  });

  it("should show close label when sidebar is open", () => {
    mockIsOpen = true;

    render(
      <SavedStatesSidebar
        savedStates={[]}
        onLoad={mockOnLoad}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
      />,
    );

    expect(screen.getByLabelText("Close sidebar")).toBeInTheDocument();
  });

  it("should pass onLoad callback to cards", () => {
    mockIsOpen = true;

    render(
      <SavedStatesSidebar
        savedStates={mockSavedStates}
        onLoad={mockOnLoad}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
      />,
    );

    const loadButtons = screen.getAllByLabelText("Load saved state");
    fireEvent.click(loadButtons[0]);
    expect(mockOnLoad).toHaveBeenCalledWith("test-1");
  });

  it("should pass onDelete callback to cards", () => {
    mockIsOpen = true;

    render(
      <SavedStatesSidebar
        savedStates={mockSavedStates}
        onLoad={mockOnLoad}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
      />,
    );

    const deleteButtons = screen.getAllByLabelText("Delete saved state");
    fireEvent.click(deleteButtons[1]);
    expect(mockOnDelete).toHaveBeenCalledWith("test-2");
  });
});
