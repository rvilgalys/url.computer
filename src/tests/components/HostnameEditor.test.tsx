import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HostnameEditor from '../../components/HostnameEditor';

describe('HostnameEditor', () => {
  const mockOnHostnameChange = jest.fn();

  beforeEach(() => {
    mockOnHostnameChange.mockClear();
  });

  it('should render read-only mode when not editable', () => {
    render(
      <HostnameEditor 
        hostname="example.com" 
        isEditable={false}
      />
    );

    expect(screen.getByText('example.com')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('should render editable input when isEditable is true', () => {
    render(
      <HostnameEditor 
        hostname="example.com" 
        onHostnameChange={mockOnHostnameChange}
        isEditable={true}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('example.com');
  });

  it('should call onHostnameChange with valid hostname', () => {
    render(
      <HostnameEditor 
        hostname="example.com" 
        onHostnameChange={mockOnHostnameChange}
        isEditable={true}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'newdomain.com' } });

    expect(mockOnHostnameChange).toHaveBeenCalledWith('newdomain.com');
  });

  it('should not call onHostnameChange with invalid hostname', () => {
    render(
      <HostnameEditor 
        hostname="example.com" 
        onHostnameChange={mockOnHostnameChange}
        isEditable={true}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'invalid..domain.com' } });

    expect(mockOnHostnameChange).not.toHaveBeenCalled();
  });

  it('should show error message for invalid hostname', async () => {
    render(
      <HostnameEditor 
        hostname="example.com" 
        onHostnameChange={mockOnHostnameChange}
        isEditable={true}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'invalid..domain.com' } });

    await waitFor(() => {
      expect(screen.getByText('Domain cannot contain consecutive dots')).toBeInTheDocument();
    });
  });

  it('should apply error styling to input field when invalid', async () => {
    render(
      <HostnameEditor 
        hostname="example.com" 
        onHostnameChange={mockOnHostnameChange}
        isEditable={true}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'invalid@domain.com' } });

    await waitFor(() => {
      expect(input).toHaveClass('border-elf-orange/50');
      expect(input).toHaveClass('bg-elf-orange/10');
      expect(input).toHaveClass('text-elf-orange');
    });
  });

  it('should hide copy button when hostname is invalid', async () => {
    render(
      <HostnameEditor 
        hostname="example.com" 
        onHostnameChange={mockOnHostnameChange}
        isEditable={true}
      />
    );

    // Initially, copy button should be visible
    expect(screen.getByRole('button')).toBeInTheDocument();

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'invalid..domain.com' } });

    await waitFor(() => {
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  it('should clear error when user fixes hostname', async () => {
    render(
      <HostnameEditor 
        hostname="example.com" 
        onHostnameChange={mockOnHostnameChange}
        isEditable={true}
      />
    );

    const input = screen.getByRole('textbox');
    
    // Enter invalid hostname
    fireEvent.change(input, { target: { value: 'invalid..domain.com' } });
    
    await waitFor(() => {
      expect(screen.getByText('Domain cannot contain consecutive dots')).toBeInTheDocument();
    });

    // Fix the hostname
    fireEvent.change(input, { target: { value: 'valid.domain.com' } });

    await waitFor(() => {
      expect(screen.queryByText('Domain cannot contain consecutive dots')).not.toBeInTheDocument();
    });
  });

  it('should show hostname type indicators for valid hostnames', () => {
    render(
      <HostnameEditor 
        hostname="localhost" 
        onHostnameChange={mockOnHostnameChange}
        isEditable={true}
      />
    );

    expect(screen.getByText('🏠 Local development')).toBeInTheDocument();
  });

  it('should handle empty hostname gracefully', () => {
    render(
      <HostnameEditor 
        hostname="" 
        onHostnameChange={mockOnHostnameChange}
        isEditable={true}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('');
    
    // Empty hostname should not trigger validation error
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });
});