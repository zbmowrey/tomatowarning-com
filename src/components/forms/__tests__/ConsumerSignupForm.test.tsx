import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/preact';
import { ConsumerSignupForm } from '../ConsumerSignupForm';

const baseProps = {
  formEndpoint: 'https://api.emailfan.com/subscribe',
  listId: 'list-consumer',
  analyticsEvent: 'consumer_signup' as const,
  successMessage: "You're on the list!",
  alreadySubscribedMessage: "You're already signed up.",
  noscriptFallbackUrl: 'https://emailfan.com/consumer',
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

describe('ConsumerSignupForm', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: 'https://tomatowarning.com/', search: '' },
    });
    vi.stubGlobal('plausible', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders email field', () => {
    render(<ConsumerSignupForm {...baseProps} />);
    expect(screen.getByLabelText(/email/i)).toBeTruthy();
  });

  it('renders zip code field by default', () => {
    render(<ConsumerSignupForm {...baseProps} />);
    expect(screen.getByLabelText(/zip/i)).toBeTruthy();
  });

  it('hides zip code field when showZipCode is false', () => {
    render(<ConsumerSignupForm {...baseProps} showZipCode={false} />);
    expect(screen.queryByLabelText(/zip/i)).toBeNull();
  });

  it('renders a submit button', () => {
    render(<ConsumerSignupForm {...baseProps} />);
    expect(screen.getByRole('button', { name: /notify me|sign up|subscribe/i })).toBeTruthy();
  });

  it('renders privacy policy link', () => {
    render(<ConsumerSignupForm {...baseProps} />);
    const link = screen.getByRole('link', { name: /privacy/i });
    expect(link.getAttribute('href')).toBe('/privacy/');
  });

  it('shows email validation error on submit with empty email', async () => {
    render(<ConsumerSignupForm {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: /notify me|sign up|subscribe/i }));
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeTruthy();
    });
  });

  it('disables submit button during submission', async () => {
    mockFetch(200, { success: true });
    render(<ConsumerSignupForm {...baseProps} />);
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.input(emailInput, { target: { value: 'user@example.com' } });
    const button = screen.getByRole('button', { name: /notify me|sign up|subscribe/i });
    fireEvent.click(button);
    expect(button.hasAttribute('disabled')).toBe(true);
  });

  it('shows success message on successful submission', async () => {
    mockFetch(200, { success: true });
    render(<ConsumerSignupForm {...baseProps} />);
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /notify me|sign up|subscribe/i }));
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeTruthy();
      expect(screen.getByText("You're on the list!")).toBeTruthy();
    });
  });

  it('fires analytics event on success', async () => {
    mockFetch(200, { success: true });
    render(<ConsumerSignupForm {...baseProps} sourceContext="ef-3-squall-line" />);
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /notify me|sign up|subscribe/i }));
    await waitFor(() => {
      expect(window.plausible).toHaveBeenCalledWith(
        'consumer_signup',
        expect.objectContaining({
          props: expect.objectContaining({ product_variety: 'ef-3-squall-line' }),
        })
      );
    });
  });

  it('does NOT fire analytics on already_subscribed', async () => {
    mockFetch(200, { success: false, already_subscribed: true });
    render(<ConsumerSignupForm {...baseProps} />);
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /notify me|sign up|subscribe/i }));
    await waitFor(() => {
      expect(screen.getByText("You're already signed up.")).toBeTruthy();
    });
    expect(window.plausible).not.toHaveBeenCalled();
  });

  it('shows already_subscribed message (not success) on duplicate', async () => {
    mockFetch(200, { success: false, already_subscribed: true });
    render(<ConsumerSignupForm {...baseProps} />);
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /notify me|sign up|subscribe/i }));
    await waitFor(() => {
      expect(screen.getByText("You're already signed up.")).toBeTruthy();
    });
  });

  it('shows error message and retry button on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network')));
    render(<ConsumerSignupForm {...baseProps} />);
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /notify me|sign up|subscribe/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeTruthy();
      expect(screen.getByRole('button', { name: /try again/i })).toBeTruthy();
    });
  });

  it('does NOT fire analytics on error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network')));
    render(<ConsumerSignupForm {...baseProps} />);
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /notify me|sign up|subscribe/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(window.plausible).not.toHaveBeenCalled();
  });

  it('omits product_variety from analytics when no sourceContext', async () => {
    mockFetch(200, { success: true });
    render(<ConsumerSignupForm {...baseProps} />);
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /notify me|sign up|subscribe/i }));
    await waitFor(() => expect(screen.getByRole('status')).toBeTruthy());
    const callArgs = (window.plausible as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(callArgs[1].props).not.toHaveProperty('product_variety');
  });
});
