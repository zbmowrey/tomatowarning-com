import { ANALYTICS_EVENTS } from '@/config/analytics';

export type ConversionEventName =
  | typeof ANALYTICS_EVENTS.CONSUMER_SIGNUP
  | typeof ANALYTICS_EVENTS.RETAILER_SIGNUP
  | typeof ANALYTICS_EVENTS.NONPROFIT_SIGNUP;

export interface ConversionEventProps {
  source_page: string;
  product_variety?: string;
}

export function fireConversionEvent(
  eventName: ConversionEventName,
  props: ConversionEventProps
): void {
  if (typeof window === 'undefined' || !window.plausible) return;

  // Build props object — product_variety must be omitted entirely when not present,
  // not passed as undefined or empty string (per contract).
  const eventProps: Record<string, string> = { source_page: props.source_page };
  if (props.product_variety !== undefined) {
    eventProps.product_variety = props.product_variety;
  }

  window.plausible(eventName, { props: eventProps });
}

export interface UtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
}

export function getUtmParams(): UtmParams {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const result: UtmParams = {};
  const source = params.get('utm_source');
  const medium = params.get('utm_medium');
  const campaign = params.get('utm_campaign');
  const content = params.get('utm_content');
  if (source) result.utmSource = source;
  if (medium) result.utmMedium = medium;
  if (campaign) result.utmCampaign = campaign;
  if (content) result.utmContent = content;
  return result;
}

// Extend the Window interface for Plausible
declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: Record<string, string> }) => void;
  }
}
