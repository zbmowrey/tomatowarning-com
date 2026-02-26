import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/preact';
import { NonprofitSignupForm } from '../NonprofitSignupForm';

const baseProps = {
  formEndpoint: 'https://api.emailfan.com/subscribe',
  listId: 'list-nonprofit',
  analyticsEvent: 'nonprofit_signup' as const,
  successMessage: 'Application received!',
  alreadySubscribedMessage: 'Already on file.',
  noscriptFallbackUrl: 'https://emailfan.com/nonprofit',
  sourceContext: 'fundraisers',
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

describe('NonprofitSignupForm', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: 'https://tomatowarning.com/fundraisers/', search: '' },
    });
    vi.stubGlobal('plausible', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders all required fields', () => {
    render(<NonprofitSignupForm {...baseProps} />);
    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/contact name/i)).toBeTruthy();
    expect(screen.getByLabelText(/organization name/i)).toBeTruthy();
    expect(screen.getByLabelText(/organization type/i)).toBeTruthy();
    expect(screen.getByLabelText(/location/i)).toBeTruthy();
  });

  it('renders optional campaign size field', () => {
    render(<NonprofitSignupForm {...baseProps} />);
    expect(screen.getByLabelText(/campaign size/i)).toBeTruthy();
  });

  it('does NOT show orgTypeOther field initially', () => {
    render(<NonprofitSignupForm {...baseProps} />);
    expect(screen.queryByLabelText(/describe your organization/i)).toBeNull();
  });

  it('shows orgTypeOther field when orgType is Other', async () => {
    render(<NonprofitSignupForm {...baseProps} />);
    fireEvent.input(screen.getByLabelText(/organization type/i), {
      target: { value: 'other' },
    });
    await waitFor(() => {
      expect(screen.getByLabelText(/describe your organization/i)).toBeTruthy();
    });
  });

  it('requires orgTypeOther when orgType is Other', async () => {
    render(<NonprofitSignupForm {...baseProps} />);
    fireEvent.input(screen.getByLabelText(/organization type/i), {
      target: { value: 'other' },
    });
    await waitFor(() => screen.getByLabelText(/describe your organization/i));
    fireEvent.click(screen.getByRole('button', { name: /submit|apply/i }));
    await waitFor(() => {
      expect(screen.getByText(/organization description is required/i)).toBeTruthy();
    });
  });

  it('fires nonprofit_signup analytics on success', async () => {
    mockFetch(200, { success: true });
    render(<NonprofitSignupForm {...baseProps} />);
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'org@example.org' } });
    fireEvent.input(screen.getByLabelText(/contact name/i), { target: { value: 'Jane' } });
    fireEvent.input(screen.getByLabelText(/organization name/i), { target: { value: 'Good Org' } });
    fireEvent.input(screen.getByLabelText(/organization type/i), { target: { value: 'school' } });
    fireEvent.input(screen.getByLabelText(/location/i), { target: { value: 'Dallas, TX' } });
    fireEvent.click(screen.getByRole('button', { name: /submit|apply/i }));
    await waitFor(() => expect(screen.getByRole('status')).toBeTruthy());
    expect(window.plausible).toHaveBeenCalledWith('nonprofit_signup', expect.any(Object));
  });

  it('does NOT fire analytics on already_subscribed', async () => {
    mockFetch(200, { success: false, already_subscribed: true });
    render(<NonprofitSignupForm {...baseProps} />);
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'org@example.org' } });
    fireEvent.input(screen.getByLabelText(/contact name/i), { target: { value: 'Jane' } });
    fireEvent.input(screen.getByLabelText(/organization name/i), { target: { value: 'Good Org' } });
    fireEvent.input(screen.getByLabelText(/organization type/i), { target: { value: 'school' } });
    fireEvent.input(screen.getByLabelText(/location/i), { target: { value: 'Dallas, TX' } });
    fireEvent.click(screen.getByRole('button', { name: /submit|apply/i }));
    await waitFor(() => expect(screen.getByRole('status')).toBeTruthy());
    expect(window.plausible).not.toHaveBeenCalled();
  });

  it('renders privacy policy link', () => {
    render(<NonprofitSignupForm {...baseProps} />);
    expect(screen.getByRole('link', { name: /privacy/i })).toBeTruthy();
  });
});
