import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireConversionEvent, getUtmParams } from '../analytics';

describe('fireConversionEvent', () => {
  beforeEach(() => {
    vi.stubGlobal('plausible', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls window.plausible with the event name and props', () => {
    fireConversionEvent('form_submit_consumer', { source_page: '/products/ef-3-squall-line/' });
    expect(window.plausible).toHaveBeenCalledWith('form_submit_consumer', {
      props: { source_page: '/products/ef-3-squall-line/' },
    });
  });

  it('includes product_variety when provided', () => {
    fireConversionEvent('form_submit_consumer', {
      source_page: '/products/ef-3-squall-line/',
      product_variety: 'ef-3-squall-line',
    });
    expect(window.plausible).toHaveBeenCalledWith('form_submit_consumer', {
      props: { source_page: '/products/ef-3-squall-line/', product_variety: 'ef-3-squall-line' },
    });
  });

  it('omits product_variety from props when not provided', () => {
    fireConversionEvent('form_submit_consumer', { source_page: '/' });
    const call = (window.plausible as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[1].props).not.toHaveProperty('product_variety');
  });

  it('does not throw when window.plausible is undefined (ad blocker)', () => {
    vi.stubGlobal('plausible', undefined);
    expect(() =>
      fireConversionEvent('form_submit_consumer', { source_page: '/' })
    ).not.toThrow();
  });

  it('works for retailer_signup event', () => {
    fireConversionEvent('form_submit_retailer', { source_page: '/retailers/' });
    expect(window.plausible).toHaveBeenCalledWith('form_submit_retailer', expect.any(Object));
  });

  it('works for nonprofit_signup event', () => {
    fireConversionEvent('form_submit_nonprofit', { source_page: '/fundraisers/' });
    expect(window.plausible).toHaveBeenCalledWith('form_submit_nonprofit', expect.any(Object));
  });
});

describe('getUtmParams', () => {
  const originalLocation = window.location;

  function setSearch(search: string) {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, search },
    });
  }

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
  });

  it('returns empty object when no UTM params present', () => {
    setSearch('');
    expect(getUtmParams()).toEqual({});
  });

  it('parses utm_source', () => {
    setSearch('?utm_source=email');
    expect(getUtmParams().utmSource).toBe('email');
  });

  it('parses all utm params', () => {
    setSearch('?utm_source=email&utm_medium=newsletter&utm_campaign=launch&utm_content=hero');
    const params = getUtmParams();
    expect(params.utmSource).toBe('email');
    expect(params.utmMedium).toBe('newsletter');
    expect(params.utmCampaign).toBe('launch');
    expect(params.utmContent).toBe('hero');
  });

  it('omits keys for absent utm params', () => {
    setSearch('?utm_source=email');
    const params = getUtmParams();
    expect(params).not.toHaveProperty('utmMedium');
    expect(params).not.toHaveProperty('utmCampaign');
    expect(params).not.toHaveProperty('utmContent');
  });

  it('ignores non-utm query params', () => {
    setSearch('?foo=bar&utm_source=social');
    expect(getUtmParams().utmSource).toBe('social');
  });
});
