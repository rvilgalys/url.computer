import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProtocolEditor from '../../components/ProtocolEditor';

describe('ProtocolEditor', () => {
  const mockOnProtocolChange = jest.fn();

  beforeEach(() => {
    mockOnProtocolChange.mockClear();
  });

  it('should render read-only mode when not editable', () => {
    render(
      <ProtocolEditor 
        protocol="https:" 
        isEditable={false}
      />
    );

    expect(screen.getByText('https:')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('should render editable dropdown when isEditable is true', () => {
    render(
      <ProtocolEditor 
        protocol="https:" 
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('https:');
  });

  it('should show correct context hints for web protocols', () => {
    const { rerender } = render(
      <ProtocolEditor 
        protocol="https:" 
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );
    expect(screen.getByText('🔒 Secure web')).toBeInTheDocument();

    rerender(
      <ProtocolEditor 
        protocol="http:" 
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );
    expect(screen.getByText('⚠️ Unsecure web')).toBeInTheDocument();

    rerender(
      <ProtocolEditor 
        protocol="ws:" 
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );
    expect(screen.getByText('🔌 WebSocket')).toBeInTheDocument();

    rerender(
      <ProtocolEditor 
        protocol="wss:" 
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );
    expect(screen.getByText('🔒 Secure WebSocket')).toBeInTheDocument();
  });

  it('should show correct context hints for file transfer protocols', () => {
    const { rerender } = render(
      <ProtocolEditor 
        protocol="ftp:" 
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );
    expect(screen.getByText('📁 File transfer')).toBeInTheDocument();

    rerender(
      <ProtocolEditor 
        protocol="ftps:" 
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );
    expect(screen.getByText('🔒 Secure file transfer')).toBeInTheDocument();

    rerender(
      <ProtocolEditor 
        protocol="sftp:" 
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );
    expect(screen.getByText('🔐 SSH file transfer')).toBeInTheDocument();
  });

  it('should show correct context hints for email protocols', () => {
    const { rerender } = render(
      <ProtocolEditor 
        protocol="smtp:" 
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );
    expect(screen.getByText('📧 Send mail')).toBeInTheDocument();

    rerender(
      <ProtocolEditor 
        protocol="imap:" 
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );
    expect(screen.getByText('📬 Mail access')).toBeInTheDocument();

    rerender(
      <ProtocolEditor 
        protocol="pop3:" 
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );
    expect(screen.getByText('📥 Receive mail')).toBeInTheDocument();
  });

  it('should show context hint for custom protocols', () => {
    render(
      <ProtocolEditor 
        protocol="myprotocol:" 
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );

    expect(screen.getByText('⚙️ Custom scheme')).toBeInTheDocument();
  });

  it('should call onProtocolChange when selecting a protocol from dropdown', () => {
    render(
      <ProtocolEditor 
        protocol="https:" 
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'ftp:' } });

    expect(mockOnProtocolChange).toHaveBeenCalledWith('ftp:');
  });

  it('should switch to custom input when selecting "Custom..." option', () => {
    render(
      <ProtocolEditor 
        protocol="https:" 
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'custom' } });

    // Should now show a text input instead of select
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('should handle custom protocol input with auto-formatting', () => {
    render(
      <ProtocolEditor 
        protocol="myprotocol:" 
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );

    // Component should start in custom mode since myprotocol: is not in the common list
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('myprotocol');

    // Type a new custom protocol
    fireEvent.change(input, { target: { value: 'customproto' } });
    
    expect(mockOnProtocolChange).toHaveBeenCalledWith('customproto:');
  });

  it('should not add colon if already present in custom input', () => {
    render(
      <ProtocolEditor 
        protocol="custom:" 
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'newprotocol:' } });
    
    expect(mockOnProtocolChange).toHaveBeenCalledWith('newprotocol:');
  });

  it('should switch back to dropdown from custom input', () => {
    render(
      <ProtocolEditor 
        protocol="custom:" 
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );

    // Should start in custom mode
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    
    // Click the dropdown button (↓)
    const dropdownButton = screen.getByTitle('Switch to dropdown');
    fireEvent.click(dropdownButton);

    // Should switch back to dropdown
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    
    expect(mockOnProtocolChange).toHaveBeenCalledWith('https:');
  });

  it('should include all cURL protocols in dropdown', () => {
    render(
      <ProtocolEditor 
        protocol="https:" 
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );

    const select = screen.getByRole('combobox');
    
    // Check for a sample of protocols from different categories
    expect(screen.getByRole('option', { name: 'https:' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'ftp:' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'smtp:' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'ldap:' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'rtmp:' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'smb:' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'dict:' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'telnet:' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Custom...' })).toBeInTheDocument();
  });

  it('should handle empty protocol gracefully', () => {
    render(
      <ProtocolEditor 
        protocol="" 
        onProtocolChange={mockOnProtocolChange}
        isEditable={true}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    
    // Should not show any context hint for empty protocol
    expect(screen.queryByText(/🔒|⚠️|📁|📧|📋|🎥|🗂️|📖|🕳️|🔄|💻|⚙️/)).not.toBeInTheDocument();
  });
});