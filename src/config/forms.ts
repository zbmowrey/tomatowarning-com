import { ANALYTICS_EVENTS, type AnalyticsEventName } from './analytics';

export type FormListType = 'consumer' | 'retailer';

export interface FormConfig {
  listId: string;
  formId: string;
  heading: string;
  description: string;
  successMessage: string;
  alreadySubscribedMessage: string;
  noscriptFallbackUrl: string;
  analyticsEvent: AnalyticsEventName;
}

export const FORM_ENDPOINT = import.meta.env.PUBLIC_EMAIL_FORM_ENDPOINT ?? '';

export const consumerFormConfig: FormConfig = {
  listId: import.meta.env.PUBLIC_CONSUMER_LIST_ID ?? '',
  formId: 'consumer-signup',
  heading: 'Join the Storm',
  description: 'Be first to know when Tomato Warning launches. Early access, recipes, and the full story.',
  successMessage: "You're on the list. The storm is building — we'll be in touch.",
  alreadySubscribedMessage: "You're already signed up — we'll keep you posted.",
  noscriptFallbackUrl: 'mailto:hello@tomatowarning.com?subject=Consumer%20Sign-Up',
  analyticsEvent: ANALYTICS_EVENTS.CONSUMER_SIGNUP,
};

export const retailerFormConfig: FormConfig = {
  listId: import.meta.env.PUBLIC_RETAILER_LIST_ID ?? '',
  formId: 'retailer-signup',
  heading: 'Wholesale Inquiry',
  description: 'Interested in carrying Tomato Warning? Get in touch.',
  successMessage: "Thanks! Our team will reach out with wholesale details.",
  alreadySubscribedMessage: "We already have your info — expect a message soon.",
  noscriptFallbackUrl: 'mailto:hello@tomatowarning.com?subject=Retailer%20Inquiry',
  analyticsEvent: ANALYTICS_EVENTS.RETAILER_SIGNUP,
};

// Convenience map for dynamic lookups
export const formConfigs: Record<FormListType, FormConfig> = {
  consumer: consumerFormConfig,
  retailer: retailerFormConfig,
};

export const roleOptions = [
  { value: 'store-owner', label: 'Store Owner' },
  { value: 'category-manager', label: 'Category Manager' },
  { value: 'buyer', label: 'Buyer' },
  { value: 'other', label: 'Other' },
] as const;

export type RoleOption = (typeof roleOptions)[number]['value'];
