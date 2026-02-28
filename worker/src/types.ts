export interface Env {
  BREVO_API_KEY: string;
  ALLOWED_ORIGIN: string;
  PRESS_EMAIL_TO: string;
  NOTIFY_EMAIL_TO: string;
  SENDER_EMAIL: string;
  SENDER_NAME: string;
  RETAILER_LIST_ID: string;
  NONPROFIT_LIST_ID: string;
}

// --- Inbound request shapes (from frontend) ---

export interface SubscribeRequest {
  email: string;
  listId: string;
  signupSource?: string;
  fields?: Record<string, string>;
  utmParams?: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
  };
}

export interface PressRequest {
  name: string;
  email: string;
  outlet?: string;
  message: string;
}

// --- Brevo API payloads ---

export interface BrevoContactPayload {
  email: string;
  attributes: Record<string, string>;
  listIds: number[];
  updateEnabled: boolean;
}

export interface BrevoEmailPayload {
  sender: { name: string; email: string };
  to: { email: string; name: string }[];
  replyTo: { email: string; name: string };
  subject: string;
  htmlContent: string;
}
