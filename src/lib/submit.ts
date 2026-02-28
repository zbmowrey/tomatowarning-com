import { getUtmParams } from './analytics';

export interface EmailSubmissionPayload {
  email: string;
  listId: string;
  fields?: Record<string, string>;
  // signupSource and utmParams are auto-captured — callers do not pass them
}

export interface SubmissionResult {
  status: 'idle' | 'submitting' | 'success' | 'already_subscribed' | 'error';
  message: string;
}

export async function submitToEmailPlatform(
  endpoint: string,
  payload: EmailSubmissionPayload
): Promise<SubmissionResult> {
  const signupSource = typeof window !== 'undefined' ? window.location.href : '';
  const utmParams = getUtmParams();

  const body: Record<string, unknown> = {
    email: payload.email,
    listId: payload.listId,
    signupSource,
  };
  if (payload.fields) body.fields = payload.fields;
  if (Object.keys(utmParams).length > 0) body.utmParams = utmParams;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return { status: 'error', message: 'Something went wrong. Please try again.' };
    }

    const data = await response.json();

    if (data.already_subscribed) {
      return {
        status: 'already_subscribed',
        message: data.message ?? "You're already signed up.",
      };
    }

    return { status: 'success', message: data.message ?? "You're on the list." };
  } catch {
    return { status: 'error', message: 'Something went wrong. Please try again.' };
  }
}
