export const ANALYTICS_EVENTS = {
  CONSUMER_SIGNUP: 'consumer_signup',
  RETAILER_SIGNUP: 'retailer_signup',
} as const;

export type AnalyticsEventName = 'consumer_signup' | 'retailer_signup';

export const plausibleConfig = {
  domain: import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN ?? 'tomatowarning.com',
  scriptSrc: 'https://plausible.io/js/script.tagged-events.js',
} as const;
