import type { BrevoContactPayload, BrevoEmailPayload } from './types';

const BREVO_BASE = 'https://api.brevo.com/v3';

interface BrevoResponse {
  ok: boolean;
  status: number;
  body: Record<string, unknown>;
}

async function brevoFetch(
  path: string,
  apiKey: string,
  payload: BrevoContactPayload | BrevoEmailPayload
): Promise<BrevoResponse> {
  const res = await fetch(`${BREVO_BASE}${path}`, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = res.status === 204 ? {} : await res.json() as Record<string, unknown>;
  return { ok: res.ok, status: res.status, body };
}

export interface ContactResult {
  success: boolean;
  alreadySubscribed: boolean;
}

export async function createOrUpdateContact(
  apiKey: string,
  payload: BrevoContactPayload
): Promise<ContactResult> {
  // First attempt without updateEnabled to detect existing contacts
  const createPayload = { ...payload, updateEnabled: false };
  const res = await brevoFetch('/contacts', apiKey, createPayload);

  if (res.ok) {
    return { success: true, alreadySubscribed: false };
  }

  // Contact exists — update their attributes and list membership
  if (res.status === 400 && res.body?.code === 'duplicate_parameter') {
    const updatePayload = { ...payload, updateEnabled: true };
    const updateRes = await brevoFetch('/contacts', apiKey, updatePayload);
    if (!updateRes.ok) {
      console.error('Brevo update error:', updateRes.status, updateRes.body);
      throw new Error(`Brevo API error: ${updateRes.status}`);
    }
    return { success: true, alreadySubscribed: true };
  }

  console.error('Brevo contact error:', res.status, res.body);
  throw new Error(`Brevo API error: ${res.status}`);
}

export async function sendTransactionalEmail(
  apiKey: string,
  payload: BrevoEmailPayload
): Promise<void> {
  const res = await brevoFetch('/smtp/email', apiKey, payload);

  if (!res.ok) {
    console.error('Brevo email error:', res.status, res.body);
    throw new Error(`Brevo email error: ${res.status}`);
  }
}
