import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/preact';
import { FooterSignupForm } from '../FooterSignupForm';

const baseProps = {
  formEndpoint: 'https://api.emailfan.com/subscribe',
  consumerListId: 'list-consumer',
  retailerListId: 'list-retailer',
  nonprofitListId: 'list-nonprofit',
  successMessage: "You're on the list!",
  alreadySubscribedMessage: "You're already signed up.",
  noscriptFallbackUrl: 'https://emailfan.com/signup',
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

describe('FooterSignupForm', () => {
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

  it('renders email and audience type fields', () => {
    render(<FooterSignupForm {...baseProps} />);
    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/i am a/i)).toBeTruthy();
  });

  it('renders privacy policy link', () => {
    render(<FooterSignupForm {...baseProps} />);
    expect(screen.getByRole('link', { name: /privacy/i })).toBeTruthy();
  });

  it('fires consumer_signup when Consumer is selected', async () => {
    mockFetch(200, { success: true });
    render(<FooterSignupForm {...baseProps} />);
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.input(screen.getByLabelText(/i am a/i), { target: { value: 'consumer' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    await waitFor(() => expect(screen.getByRole('status')).toBeTruthy());
    expect(window.plausible).toHaveBeenCalledWith('consumer_signup', expect.any(Object));
  });

  it('fires retailer_signup when Retailer is selected', async () => {
    mockFetch(200, { success: true });
    render(<FooterSignupForm {...baseProps} />);
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'buyer@store.com' } });
    fireEvent.input(screen.getByLabelText(/i am a/i), { target: { value: 'retailer' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    await waitFor(() => expect(screen.getByRole('status')).toBeTruthy());
    expect(window.plausible).toHaveBeenCalledWith('retailer_signup', expect.any(Object));
  });

  it('fires nonprofit_signup when Nonprofit is selected', async () => {
    mockFetch(200, { success: true });
    render(<FooterSignupForm {...baseProps} />);
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'org@example.org' } });
    fireEvent.input(screen.getByLabelText(/i am a/i), { target: { value: 'nonprofit' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    await waitFor(() => expect(screen.getByRole('status')).toBeTruthy());
    expect(window.plausible).toHaveBeenCalledWith('nonprofit_signup', expect.any(Object));
  });

  it('omits product_variety for all footer consumer signups', async () => {
    mockFetch(200, { success: true });
    render(<FooterSignupForm {...baseProps} />);
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.input(screen.getByLabelText(/i am a/i), { target: { value: 'consumer' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    await waitFor(() => expect(screen.getByRole('status')).toBeTruthy());
    const call = (window.plausible as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[1].props).not.toHaveProperty('product_variety');
  });

  it('does NOT fire analytics on already_subscribed', async () => {
    mockFetch(200, { success: false, already_subscribed: true });
    render(<FooterSignupForm {...baseProps} />);
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.input(screen.getByLabelText(/i am a/i), { target: { value: 'consumer' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    await waitFor(() => expect(screen.getByRole('status')).toBeTruthy());
    expect(window.plausible).not.toHaveBeenCalled();
  });

  it('uses the correct listId based on audience selection', async () => {
    mockFetch(200, { success: true });
    render(<FooterSignupForm {...baseProps} />);
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'buyer@store.com' } });
    fireEvent.input(screen.getByLabelText(/i am a/i), { target: { value: 'retailer' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    await waitFor(() => expect(screen.getByRole('status')).toBeTruthy());
    const body = JSON.parse(
      (vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string
    );
    expect(body.listId).toBe('list-retailer');
  });
});
