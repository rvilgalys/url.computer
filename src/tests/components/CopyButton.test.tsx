import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CopyButton from '../../components/CopyButton';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
});

describe('CopyButton', () => {
  beforeEach(() => {
    (navigator.clipboard.writeText as jest.Mock).mockClear();
  });

  it('should copy string value when textToCopy is a string', async () => {
    render(<CopyButton textToCopy="test string" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test string');
    });
  });

  it('should call function and copy returned value when textToCopy is a function', async () => {
    const mockFunction = jest.fn().mockReturnValue('dynamic string');
    
    render(<CopyButton textToCopy={mockFunction} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockFunction).toHaveBeenCalledTimes(1);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('dynamic string');
    });
  });

  it('should call function at click time, not render time', async () => {
    const mockFunction = jest.fn().mockReturnValue('click time value');
    
    render(<CopyButton textToCopy={mockFunction} />);
    
    // Function should not be called during render
    expect(mockFunction).not.toHaveBeenCalled();
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Function should only be called when clicked
    await waitFor(() => {
      expect(mockFunction).toHaveBeenCalledTimes(1);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('click time value');
    });
  });

  it('should show copied state after successful copy', async () => {
    render(<CopyButton textToCopy="test" title="Copy test" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Copy test');
    
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute('title', 'Copied!');
    });
  });
});