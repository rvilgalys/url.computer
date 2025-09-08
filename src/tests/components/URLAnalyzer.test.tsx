import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import URLAnalyzer from '../../components/URLAnalyzer';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
});

// Mock the useUrlState hook since we're testing the component in isolation
const mockOnUrlChange = jest.fn();

describe('URLAnalyzer', () => {
  beforeEach(() => {
    mockOnUrlChange.mockClear();
    (navigator.clipboard.writeText as jest.Mock).mockClear();
  });

  it('should render URL input and parse valid URL', () => {
    const testUrl = 'https://api.example.com/v1/users?page=1&sort=name#profile';
    
    render(<URLAnalyzer url={testUrl} onUrlChange={mockOnUrlChange} />);
    
    // Check that URL input is populated
    const urlInput = screen.getByDisplayValue(testUrl);
    expect(urlInput).toBeInTheDocument();
    
    // Check that components are displayed
    expect(screen.getByText('Scheme')).toBeInTheDocument();
    expect(screen.getByText('Host')).toBeInTheDocument();
    expect(screen.getByText('Path')).toBeInTheDocument();
    expect(screen.getByText('Fragment')).toBeInTheDocument();
    expect(screen.getByText('Query Parameters')).toBeInTheDocument();
    
    // Check parsed values - now that hostname and path are editable, they appear in input fields
    expect(screen.getByText('https:')).toBeInTheDocument(); // protocol
    expect(screen.getByDisplayValue('api.example.com')).toBeInTheDocument(); // hostname in input
    expect(screen.getByDisplayValue('/v1/users')).toBeInTheDocument(); // path in input  
    expect(screen.getByText('#')).toBeInTheDocument(); // fragment hash
    expect(screen.getByText('profile')).toBeInTheDocument(); // fragment value
  });

  it('should show error state for invalid URL', async () => {
    render(<URLAnalyzer url="" onUrlChange={mockOnUrlChange} />);
    
    const urlInput = screen.getByPlaceholderText(/https:\/\/api.example.com/);
    
    // Type invalid URL
    fireEvent.change(urlInput, { target: { value: 'not-a-valid-url' } });
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Invalid URL format')).toBeInTheDocument();
    });
    
    // Should not show URL components
    expect(screen.queryByText('Scheme')).not.toBeInTheDocument();
  });

  it('should handle URL changes from input', async () => {
    render(<URLAnalyzer url="" onUrlChange={mockOnUrlChange} />);
    
    const urlInput = screen.getByPlaceholderText(/https:\/\/api.example.com/);
    const newUrl = 'https://test.com/path';
    
    fireEvent.change(urlInput, { target: { value: newUrl } });
    
    await waitFor(() => {
      expect(mockOnUrlChange).toHaveBeenCalledWith(newUrl);
    });
  });

  it('should show empty state when no URL is provided', () => {
    render(<URLAnalyzer url="" onUrlChange={mockOnUrlChange} />);
    
    expect(screen.getByText('Paste or type a URL above to analyze its components')).toBeInTheDocument();
  });

  it('should display query parameters correctly', () => {
    const testUrl = 'https://example.com?key1=value1&key2=value2';
    
    render(<URLAnalyzer url={testUrl} onUrlChange={mockOnUrlChange} />);
    
    // Check that query parameters are displayed
    expect(screen.getByDisplayValue('key1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('value1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('key2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('value2')).toBeInTheDocument();
  });

  it('should handle URLs without query parameters', () => {
    const testUrl = 'https://example.com/path';
    
    render(<URLAnalyzer url={testUrl} onUrlChange={mockOnUrlChange} />);
    
    // Should show "No query parameters" state
    expect(screen.getByText('No query parameters')).toBeInTheDocument();
    expect(screen.getByText('+ Add Parameter')).toBeInTheDocument();
  });

  it('should show copy button for valid URLs and copy the URL when clicked', async () => {
    const testUrl = 'https://api.example.com/v1/users?page=1';
    
    render(<URLAnalyzer url={testUrl} onUrlChange={mockOnUrlChange} />);
    
    // Copy button should be visible for valid URL
    const copyButton = screen.getByTitle('Copy URL');
    expect(copyButton).toBeInTheDocument();
    
    // Click the copy button
    fireEvent.click(copyButton);
    
    // Verify clipboard was called with the URL
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testUrl);
    });
  });

  it('should not show copy button for invalid URLs', () => {
    render(<URLAnalyzer url="" onUrlChange={mockOnUrlChange} />);
    
    const urlInput = screen.getByPlaceholderText(/https:\/\/api.example.com/);
    
    // Type invalid URL
    fireEvent.change(urlInput, { target: { value: 'not-a-valid-url' } });
    
    // Copy button should not be visible for invalid URL
    expect(screen.queryByTitle('Copy URL')).not.toBeInTheDocument();
  });

  it('should not show copy button when URL input is empty', () => {
    render(<URLAnalyzer url="" onUrlChange={mockOnUrlChange} />);
    
    // Copy button should not be visible when no URL
    expect(screen.queryByTitle('Copy URL')).not.toBeInTheDocument();
  });
});