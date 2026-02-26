import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/preact';
import { FormSuccess } from '../FormSuccess';

describe('FormSuccess', () => {
  it('renders the message', () => {
    render(<FormSuccess message="You're on the list!" />);
    expect(screen.getByText("You're on the list!")).toBeTruthy();
  });

  it('has role="status"', () => {
    render(<FormSuccess message="Done!" />);
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('has aria-live="polite"', () => {
    render(<FormSuccess message="Done!" />);
    const el = screen.getByRole('status');
    expect(el.getAttribute('aria-live')).toBe('polite');
  });

  it('has tabIndex=-1 so it can receive focus programmatically', () => {
    render(<FormSuccess message="Done!" />);
    const el = screen.getByRole('status');
    expect(el.getAttribute('tabindex')).toBe('-1');
  });
});
