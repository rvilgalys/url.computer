import { render, screen, fireEvent } from '@testing-library/react';
import HeadersEditor from '../../components/HeadersEditor';

describe('HeadersEditor', () => {
  const mockOnHeadersChange = jest.fn();
  
  beforeEach(() => {
    mockOnHeadersChange.mockClear();
  });

  it('should maintain focus when typing in header key field', () => {
    const headers = { 'Content-Type': 'application/json' };
    
    render(
      <HeadersEditor 
        headers={headers} 
        onHeadersChange={mockOnHeadersChange} 
      />
    );

    const keyInput = screen.getByDisplayValue('Content-Type');
    
    // Focus the input
    keyInput.focus();
    expect(document.activeElement).toBe(keyInput);
    
    // Type a character
    fireEvent.change(keyInput, { target: { value: 'Content-Type2' } });
    
    // Focus should still be maintained
    expect(document.activeElement).toBe(keyInput);
  });

  it('should maintain focus when typing in header value field', () => {
    const headers = { 'Content-Type': 'application/json' };
    
    render(
      <HeadersEditor 
        headers={headers} 
        onHeadersChange={mockOnHeadersChange} 
      />
    );

    const valueInput = screen.getByDisplayValue('application/json');
    
    // Focus the input
    valueInput.focus();
    expect(document.activeElement).toBe(valueInput);
    
    // Type a character
    fireEvent.change(valueInput, { target: { value: 'application/json2' } });
    
    // Focus should still be maintained
    expect(document.activeElement).toBe(valueInput);
  });

  it('should call onHeadersChange when header values change', () => {
    const headers = { 'Content-Type': 'application/json' };
    
    render(
      <HeadersEditor 
        headers={headers} 
        onHeadersChange={mockOnHeadersChange} 
      />
    );

    const keyInput = screen.getByDisplayValue('Content-Type');
    fireEvent.change(keyInput, { target: { value: 'New-Header' } });
    
    expect(mockOnHeadersChange).toHaveBeenCalled();
    
    // Verify the new headers object contains the updated key
    const lastCall = mockOnHeadersChange.mock.calls[mockOnHeadersChange.mock.calls.length - 1];
    const updatedHeaders = lastCall[0];
    expect(updatedHeaders['New-Header']).toBe('application/json');
  });

  it('should show empty state when no headers exist', () => {
    const headers = {};
    
    render(
      <HeadersEditor 
        headers={headers} 
        onHeadersChange={mockOnHeadersChange} 
      />
    );

    expect(screen.getByText('No headers')).toBeInTheDocument();
    expect(screen.getByText('+ Add Header')).toBeInTheDocument();
  });

  it('should add new header when Add Header button is clicked', () => {
    const headers = {};
    
    render(
      <HeadersEditor 
        headers={headers} 
        onHeadersChange={mockOnHeadersChange} 
      />
    );

    const addButton = screen.getByText('+ Add Header');
    fireEvent.click(addButton);
    
    // Should show input fields for new header
    expect(screen.getByPlaceholderText('Header')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Value')).toBeInTheDocument();
  });
});
