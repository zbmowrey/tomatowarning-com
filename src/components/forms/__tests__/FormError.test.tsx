import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/preact';
import { FormError } from '../FormError';

describe('FormError', () => {
  it('renders the message', () => {
    render(<FormError message="Something went wrong." onRetry={vi.fn()} />);
    expect(screen.getByText('Something went wrong.')).toBeTruthy();
  });

  it('has role="alert"', () => {
    render(<FormError message="Error!" onRetry={vi.fn()} />);
    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it('has aria-live="assertive"', () => {
    render(<FormError message="Error!" onRetry={vi.fn()} />);
    const el = screen.getByRole('alert');
    expect(el.getAttribute('aria-live')).toBe('assertive');
  });

  it('renders a retry button', () => {
    render(<FormError message="Error!" onRetry={vi.fn()} />);
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<FormError message="Error!" onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
