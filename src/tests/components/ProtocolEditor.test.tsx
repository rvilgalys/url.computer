import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProtocolEditor from "../../components/ProtocolEditor";

describe("ProtocolEditor", () => {
  const mockOnProtocolChange = jest.fn();

  beforeEach(() => {
    mockOnProtocolChange.mockClear();
  });

  it("should render read-only mode when not editable", () => {
    render(<ProtocolEditor protocol="https:" isEditable={false} />);

    expect(screen.getByText("https:")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("should render editable typeahead when isEditable is true", () => {
    render(
      <ProtocolEditor
        protocol="https:"
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );

    const input = screen.getByRole("combobox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("https");
  });

  it("should show correct context hints for web protocols", () => {
    const { rerender } = render(
      <ProtocolEditor
        protocol="https:"
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );
    expect(screen.getByText("🔒 Secure web")).toBeInTheDocument();

    rerender(
      <ProtocolEditor
        protocol="http:"
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );
    expect(screen.getByText("⚠️ Unsecure web")).toBeInTheDocument();

    rerender(
      <ProtocolEditor
        protocol="ws:"
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );
    expect(screen.getByText("🔌 WebSocket")).toBeInTheDocument();

    rerender(
      <ProtocolEditor
        protocol="wss:"
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );
    expect(screen.getByText("🔒 Secure WebSocket")).toBeInTheDocument();
  });

  it("should show correct context hints for file transfer protocols", () => {
    const { rerender } = render(
      <ProtocolEditor
        protocol="ftp:"
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );
    expect(screen.getByText("📁 File transfer")).toBeInTheDocument();

    rerender(
      <ProtocolEditor
        protocol="ftps:"
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );
    expect(screen.getByText("🔒 Secure file transfer")).toBeInTheDocument();

    rerender(
      <ProtocolEditor
        protocol="sftp:"
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );
    expect(screen.getByText("🔐 SSH file transfer")).toBeInTheDocument();
  });

  it("should show correct context hints for email protocols", () => {
    const { rerender } = render(
      <ProtocolEditor
        protocol="smtp:"
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );
    expect(screen.getByText("📧 Send mail")).toBeInTheDocument();

    rerender(
      <ProtocolEditor
        protocol="imap:"
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );
    expect(screen.getByText("📬 Mail access")).toBeInTheDocument();

    rerender(
      <ProtocolEditor
        protocol="pop3:"
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );
    expect(screen.getByText("📥 Receive mail")).toBeInTheDocument();
  });

  it("should show context hint for custom protocols", () => {
    render(
      <ProtocolEditor
        protocol="myprotocol:"
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );

    expect(screen.getByText("⚙️ Custom scheme")).toBeInTheDocument();
  });

  it("should call onProtocolChange when typing in the typeahead input", () => {
    render(
      <ProtocolEditor
        protocol="https:"
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "ftp" } });

    expect(mockOnProtocolChange).toHaveBeenCalledWith("ftp:");
  });

  it("should show suggestions when typing", async () => {
    render(
      <ProtocolEditor
        protocol=""
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "h" } });
    fireEvent.focus(input);

    // Should show suggestions for protocols starting with 'h'
    await waitFor(() => {
      expect(screen.queryByText("https")).toBeInTheDocument();
      expect(screen.queryByText("http")).toBeInTheDocument();
    });
  });

  it("should handle custom protocol input with auto-formatting", () => {
    render(
      <ProtocolEditor
        protocol="myprotocol:"
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );

    // Component should show custom protocol without colon in input
    const input = screen.getByRole("combobox");
    expect(input).toHaveValue("myprotocol");

    // Type a new custom protocol
    fireEvent.change(input, { target: { value: "customproto" } });

    expect(mockOnProtocolChange).toHaveBeenCalledWith("customproto:");
  });

  it("should not add colon if already present in input", () => {
    render(
      <ProtocolEditor
        protocol="custom:"
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "newprotocol:" } });

    expect(mockOnProtocolChange).toHaveBeenCalledWith("newprotocol:");
  });

  it("should handle selection from suggestions dropdown", async () => {
    render(
      <ProtocolEditor
        protocol=""
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "f" } });
    fireEvent.focus(input);

    // Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.getByText("ftp")).toBeInTheDocument();
    });

    // Click on ftp suggestion
    fireEvent.click(screen.getByText("ftp"));

    expect(mockOnProtocolChange).toHaveBeenCalledWith("ftp:");
  });

  it("should include all cURL protocols in suggestions", async () => {
    render(
      <ProtocolEditor
        protocol=""
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );

    const input = screen.getByRole("combobox");

    // Focus input to show all suggestions
    fireEvent.focus(input);

    // Check for a sample of protocols from different categories in suggestions (first 10 shown by default)
    await waitFor(() => {
      expect(screen.getByText("https")).toBeInTheDocument();
      expect(screen.getByText("http")).toBeInTheDocument();
      expect(screen.getByText("ftp")).toBeInTheDocument();
      expect(screen.getByText("ssh")).toBeInTheDocument();
      expect(screen.getByText("sftp")).toBeInTheDocument();
    });
  });

  it("should handle empty protocol gracefully", () => {
    render(
      <ProtocolEditor
        protocol=""
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );

    const input = screen.getByRole("combobox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("");

    // Should not show any context hint for empty protocol
    expect(
      screen.queryByText(/🔒|⚠️|📁|📧|📋|🎥|🗂️|📖|🕳️|🔄|💻|⚙️/)
    ).not.toBeInTheDocument();
  });
});
