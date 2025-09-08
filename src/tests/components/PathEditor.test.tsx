import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PathEditor from '../../components/PathEditor';

describe('PathEditor', () => {
  const mockOnPathnameChange = jest.fn();

  beforeEach(() => {
    mockOnPathnameChange.mockClear();
  });

  it('should render read-only mode when not editable', () => {
    render(
      <PathEditor 
        pathname="/api/users" 
        isEditable={false}
      />
    );

    expect(screen.getByText('api')).toBeInTheDocument();
    expect(screen.getByText('users')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('should render editable input when isEditable is true', () => {
    render(
      <PathEditor 
        pathname="/api/users" 
        onPathnameChange={mockOnPathnameChange}
        isEditable={true}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('/api/users');
  });

  it('should call onPathnameChange with valid pathname', () => {
    render(
      <PathEditor 
        pathname="/api/users" 
        onPathnameChange={mockOnPathnameChange}
        isEditable={true}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '/api/posts' } });

    expect(mockOnPathnameChange).toHaveBeenCalledWith('/api/posts');
  });

  it('should automatically add leading slash to path', () => {
    render(
      <PathEditor 
        pathname="/api/users" 
        onPathnameChange={mockOnPathnameChange}
        isEditable={true}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'api/posts' } });

    expect(mockOnPathnameChange).toHaveBeenCalledWith('/api/posts');
  });

  it('should not call onPathnameChange with invalid pathname', () => {
    render(
      <PathEditor 
        pathname="/api/users" 
        onPathnameChange={mockOnPathnameChange}
        isEditable={true}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '/path<script>' } });

    expect(mockOnPathnameChange).not.toHaveBeenCalled();
  });

  it('should show error message for invalid pathname', async () => {
    render(
      <PathEditor 
        pathname="/api/users" 
        onPathnameChange={mockOnPathnameChange}
        isEditable={true}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '/path<script>' } });

    await waitFor(() => {
      expect(screen.getByText('Path contains invalid characters')).toBeInTheDocument();
    });
  });

  it('should apply error styling to input field when invalid', async () => {
    render(
      <PathEditor 
        pathname="/api/users" 
        onPathnameChange={mockOnPathnameChange}
        isEditable={true}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '/path{invalid}' } });

    await waitFor(() => {
      expect(input).toHaveClass('border-elf-orange/50');
      expect(input).toHaveClass('bg-elf-orange/10');
      expect(input).toHaveClass('text-elf-orange');
    });
  });

  it('should hide copy button when pathname is invalid', async () => {
    render(
      <PathEditor 
        pathname="/api/users" 
        onPathnameChange={mockOnPathnameChange}
        isEditable={true}
      />
    );

    // Initially, copy button should be visible
    expect(screen.getByRole('button')).toBeInTheDocument();

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '/path"invalid"' } });

    await waitFor(() => {
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  it('should clear error when user fixes pathname', async () => {
    render(
      <PathEditor 
        pathname="/api/users" 
        onPathnameChange={mockOnPathnameChange}
        isEditable={true}
      />
    );

    const input = screen.getByRole('textbox');
    
    // Enter invalid pathname
    fireEvent.change(input, { target: { value: '/path<invalid>' } });
    
    await waitFor(() => {
      expect(screen.getByText('Path contains invalid characters')).toBeInTheDocument();
    });

    // Fix the pathname
    fireEvent.change(input, { target: { value: '/path/valid' } });

    await waitFor(() => {
      expect(screen.queryByText('Path contains invalid characters')).not.toBeInTheDocument();
    });
  });

  it('should show path type indicators for valid paths', () => {
    render(
      <PathEditor 
        pathname="/api/v1/users" 
        onPathnameChange={mockOnPathnameChange}
        isEditable={true}
      />
    );

    expect(screen.getByText('🔌 API endpoint')).toBeInTheDocument();
  });

  it('should show breadcrumb navigation for complex paths', () => {
    render(
      <PathEditor 
        pathname="/api/v1/users/123/posts" 
        onPathnameChange={mockOnPathnameChange}
        isEditable={true}
      />
    );

    // Check for individual breadcrumb parts
    expect(screen.getByText('📍')).toBeInTheDocument();
    expect(screen.getByText((content, element) => content.includes('api') && content.includes('→'))).toBeInTheDocument();
    expect(screen.getByText((content, element) => content.includes('v1') && content.includes('→'))).toBeInTheDocument();
    expect(screen.getByText((content, element) => content.includes('users') && content.includes('→'))).toBeInTheDocument();
    expect(screen.getByText((content, element) => content.includes('123') && content.includes('→'))).toBeInTheDocument();
    expect(screen.getByText((content, element) => content.includes('posts') && !content.includes('→'))).toBeInTheDocument();
  });

  it('should handle empty pathname gracefully', () => {
    render(
      <PathEditor 
        pathname="" 
        onPathnameChange={mockOnPathnameChange}
        isEditable={true}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('/');
    
    // Empty pathname should not trigger validation error
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it('should handle root path correctly', () => {
    render(
      <PathEditor 
        pathname="/" 
        onPathnameChange={mockOnPathnameChange}
        isEditable={true}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('/');
    
    // Root path should be valid
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });
});