import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { submitToEmailPlatform } from '../submit';

const ENDPOINT = 'https://api.emailfan.com/subscribe';

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

describe('submitToEmailPlatform', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: 'https://tomatowarning.com/products/ef-3-squall-line/', search: '' },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns success status on 2xx with no already_subscribed flag', async () => {
    mockFetch(200, { success: true });
    const result = await submitToEmailPlatform(ENDPOINT, {
      email: 'user@example.com',
      listId: 'list-123',
    });
    expect(result.status).toBe('success');
  });

  it('returns already_subscribed when platform signals duplicate', async () => {
    mockFetch(200, { success: false, already_subscribed: true });
    const result = await submitToEmailPlatform(ENDPOINT, {
      email: 'existing@example.com',
      listId: 'list-123',
    });
    expect(result.status).toBe('already_subscribed');
  });

  it('returns error on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    const result = await submitToEmailPlatform(ENDPOINT, {
      email: 'user@example.com',
      listId: 'list-123',
    });
    expect(result.status).toBe('error');
  });

  it('returns error on 4xx response', async () => {
    mockFetch(400, { error: 'Bad request' });
    const result = await submitToEmailPlatform(ENDPOINT, {
      email: 'bad',
      listId: 'list-123',
    });
    expect(result.status).toBe('error');
  });

  it('returns error on 5xx response', async () => {
    mockFetch(500, { error: 'Server error' });
    const result = await submitToEmailPlatform(ENDPOINT, {
      email: 'user@example.com',
      listId: 'list-123',
    });
    expect(result.status).toBe('error');
  });

  it('auto-captures signupSource from window.location.href', async () => {
    mockFetch(200, { success: true });
    await submitToEmailPlatform(ENDPOINT, { email: 'user@example.com', listId: 'list-123' });
    const body = JSON.parse(
      (vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string
    );
    expect(body.signupSource).toBe('https://tomatowarning.com/products/ef-3-squall-line/');
  });

  it('auto-captures UTM params from window.location.search', async () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        href: 'https://tomatowarning.com/?utm_source=email',
        search: '?utm_source=email&utm_campaign=launch',
      },
    });
    mockFetch(200, { success: true });
    await submitToEmailPlatform(ENDPOINT, { email: 'user@example.com', listId: 'list-123' });
    const body = JSON.parse(
      (vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string
    );
    expect(body.utmParams.utmSource).toBe('email');
    expect(body.utmParams.utmCampaign).toBe('launch');
  });

  it('includes additional fields in the payload', async () => {
    mockFetch(200, { success: true });
    await submitToEmailPlatform(ENDPOINT, {
      email: 'user@example.com',
      listId: 'list-123',
      fields: { name: 'Alice', storeName: 'Hot Stuff' },
    });
    const body = JSON.parse(
      (vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string
    );
    expect(body.fields.name).toBe('Alice');
    expect(body.fields.storeName).toBe('Hot Stuff');
  });

  it('sends a POST request with JSON content-type', async () => {
    mockFetch(200, { success: true });
    await submitToEmailPlatform(ENDPOINT, { email: 'user@example.com', listId: 'list-123' });
    const [url, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    expect(url).toBe(ENDPOINT);
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('result has a non-empty message string', async () => {
    mockFetch(200, { success: true });
    const result = await submitToEmailPlatform(ENDPOINT, {
      email: 'user@example.com',
      listId: 'list-123',
    });
    expect(typeof result.message).toBe('string');
    expect(result.message.length).toBeGreaterThan(0);
  });
});
