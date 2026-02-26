import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/preact';
import { RetailerSignupForm } from '../RetailerSignupForm';

const baseProps = {
  formEndpoint: 'https://api.emailfan.com/subscribe',
  listId: 'list-retailer',
  analyticsEvent: 'retailer_signup' as const,
  successMessage: 'Thanks! Our team will reach out.',
  alreadySubscribedMessage: 'Already in our system.',
  noscriptFallbackUrl: 'https://emailfan.com/retailer',
  sourceContext: 'retailers',
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

describe('RetailerSignupForm', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: 'https://tomatowarning.com/retailers/', search: '' },
    });
    vi.stubGlobal('plausible', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders all required fields', () => {
    render(<RetailerSignupForm {...baseProps} />);
    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/^name/i)).toBeTruthy();
    expect(screen.getByLabelText(/store name/i)).toBeTruthy();
    expect(screen.getByLabelText(/location/i)).toBeTruthy();
    expect(screen.getByLabelText(/role/i)).toBeTruthy();
  });

  it('renders optional message field', () => {
    render(<RetailerSignupForm {...baseProps} />);
    expect(screen.getByLabelText(/message/i)).toBeTruthy();
  });

  it('does NOT show roleOther field initially', () => {
    render(<RetailerSignupForm {...baseProps} />);
    expect(screen.queryByLabelText(/describe your role/i)).toBeNull();
  });

  it('shows roleOther field when role is Other', async () => {
    render(<RetailerSignupForm {...baseProps} />);
    const roleSelect = screen.getByLabelText(/role/i);
    fireEvent.input(roleSelect, { target: { value: 'other' } });
    await waitFor(() => {
      expect(screen.getByLabelText(/describe your role/i)).toBeTruthy();
    });
  });

  it('requires roleOther when role is Other', async () => {
    render(<RetailerSignupForm {...baseProps} />);
    const roleSelect = screen.getByLabelText(/role/i);
    fireEvent.input(roleSelect, { target: { value: 'other' } });
    await waitFor(() => screen.getByLabelText(/describe your role/i));
    fireEvent.click(screen.getByRole('button', { name: /submit|send|apply/i }));
    await waitFor(() => {
      expect(screen.getByText(/role description is required/i)).toBeTruthy();
    });
  });

  it('shows validation errors for required fields on empty submit', async () => {
    render(<RetailerSignupForm {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: /submit|send|apply/i }));
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeTruthy();
    });
  });

  it('fires retailer_signup analytics on success', async () => {
    mockFetch(200, { success: true });
    render(<RetailerSignupForm {...baseProps} />);
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'buyer@store.com' } });
    fireEvent.input(screen.getByLabelText(/^name/i), { target: { value: 'Bob' } });
    fireEvent.input(screen.getByLabelText(/store name/i), { target: { value: 'Hot Goods' } });
    fireEvent.input(screen.getByLabelText(/location/i), { target: { value: 'Austin, TX' } });
    fireEvent.input(screen.getByLabelText(/role/i), { target: { value: 'buyer' } });
    fireEvent.click(screen.getByRole('button', { name: /submit|send|apply/i }));
    await waitFor(() => expect(screen.getByRole('status')).toBeTruthy());
    expect(window.plausible).toHaveBeenCalledWith('retailer_signup', expect.any(Object));
  });

  it('does NOT fire analytics on already_subscribed', async () => {
    mockFetch(200, { success: false, already_subscribed: true });
    render(<RetailerSignupForm {...baseProps} />);
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'buyer@store.com' } });
    fireEvent.input(screen.getByLabelText(/^name/i), { target: { value: 'Bob' } });
    fireEvent.input(screen.getByLabelText(/store name/i), { target: { value: 'Hot Goods' } });
    fireEvent.input(screen.getByLabelText(/location/i), { target: { value: 'Austin, TX' } });
    fireEvent.input(screen.getByLabelText(/role/i), { target: { value: 'buyer' } });
    fireEvent.click(screen.getByRole('button', { name: /submit|send|apply/i }));
    await waitFor(() => expect(screen.getByRole('status')).toBeTruthy());
    expect(window.plausible).not.toHaveBeenCalled();
  });

  it('renders privacy policy link', () => {
    render(<RetailerSignupForm {...baseProps} />);
    expect(screen.getByRole('link', { name: /privacy/i })).toBeTruthy();
  });

  it('disables submit button during submission', async () => {
    mockFetch(200, { success: true });
    render(<RetailerSignupForm {...baseProps} />);
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'buyer@store.com' } });
    fireEvent.input(screen.getByLabelText(/^name/i), { target: { value: 'Bob' } });
    fireEvent.input(screen.getByLabelText(/store name/i), { target: { value: 'Shop' } });
    fireEvent.input(screen.getByLabelText(/location/i), { target: { value: 'TX' } });
    fireEvent.input(screen.getByLabelText(/role/i), { target: { value: 'buyer' } });
    const button = screen.getByRole('button', { name: /submit|send|apply/i });
    fireEvent.click(button);
    expect(button.hasAttribute('disabled')).toBe(true);
  });
});
