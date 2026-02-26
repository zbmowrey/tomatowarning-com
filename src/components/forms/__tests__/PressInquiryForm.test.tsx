import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/preact';
import { PressInquiryForm } from '../PressInquiryForm';

const baseProps = {
  submitEndpoint: '/api/press-inquiry',
  fallbackMailto: 'mailto:press@tomatowarning.com',
  successMessage: "Thanks! We'll respond within 2 business days.",
  privacyPolicyUrl: '/privacy/',
};

function mockFetch(status: number, body: object) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    })
  );
}

describe('PressInquiryForm', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: 'https://tomatowarning.com/press/', search: '' },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders name, email, outlet, and message fields', () => {
    render(<PressInquiryForm {...baseProps} />);
    expect(screen.getByLabelText(/^name/i)).toBeTruthy();
    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/outlet/i)).toBeTruthy();
    expect(screen.getByLabelText(/message/i)).toBeTruthy();
  });

  it('renders privacy policy link', () => {
    render(<PressInquiryForm {...baseProps} />);
    expect(screen.getByRole('link', { name: /privacy/i })).toBeTruthy();
  });

  it('shows validation errors for required fields on empty submit', async () => {
    render(<PressInquiryForm {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: /send|submit/i }));
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeTruthy();
    });
  });

  it('validates message minimum length', async () => {
    render(<PressInquiryForm {...baseProps} />);
    fireEvent.input(screen.getByLabelText(/^name/i), { target: { value: 'Alice' } });
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'alice@press.com' } });
    fireEvent.input(screen.getByLabelText(/message/i), { target: { value: 'Short' } });
    fireEvent.click(screen.getByRole('button', { name: /send|submit/i }));
    await waitFor(() => {
      expect(screen.getByText(/at least 10/i)).toBeTruthy();
    });
  });

  it('shows success message on successful submission', async () => {
    mockFetch(200, { success: true });
    render(<PressInquiryForm {...baseProps} />);
    fireEvent.input(screen.getByLabelText(/^name/i), { target: { value: 'Alice' } });
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'alice@press.com' } });
    fireEvent.input(screen.getByLabelText(/message/i), {
      target: { value: 'I would like to write about your hot sauce for my magazine.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send|submit/i }));
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeTruthy();
      expect(screen.getByText(/2 business days/i)).toBeTruthy();
    });
  });

  it('does NOT fire any analytics event', async () => {
    vi.stubGlobal('plausible', vi.fn());
    mockFetch(200, { success: true });
    render(<PressInquiryForm {...baseProps} />);
    fireEvent.input(screen.getByLabelText(/^name/i), { target: { value: 'Alice' } });
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'alice@press.com' } });
    fireEvent.input(screen.getByLabelText(/message/i), {
      target: { value: 'Long enough message for the press inquiry form validation test.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send|submit/i }));
    await waitFor(() => expect(screen.getByRole('status')).toBeTruthy());
    expect(window.plausible).not.toHaveBeenCalled();
  });

  it('disables submit button during submission', async () => {
    mockFetch(200, { success: true });
    render(<PressInquiryForm {...baseProps} />);
    fireEvent.input(screen.getByLabelText(/^name/i), { target: { value: 'Alice' } });
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'alice@press.com' } });
    fireEvent.input(screen.getByLabelText(/message/i), {
      target: { value: 'Long enough message for minimum validation.' },
    });
    const button = screen.getByRole('button', { name: /send|submit/i });
    fireEvent.click(button);
    expect(button.hasAttribute('disabled')).toBe(true);
  });

  it('renders as mailto link when submitEndpoint is omitted', () => {
    render(<PressInquiryForm {...{ ...baseProps, submitEndpoint: undefined }} />);
    expect(screen.queryByRole('button')).toBeNull();
    const link = screen.getByRole('link', { name: /contact us|get in touch|email/i });
    expect(link.getAttribute('href')).toBe('mailto:press@tomatowarning.com');
  });
});
