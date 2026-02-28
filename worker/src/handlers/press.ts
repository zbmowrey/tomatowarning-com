import type { Env, PressRequest, BrevoEmailPayload } from '../types';
import { sendTransactionalEmail } from '../brevo';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function handlePress(
  request: Request,
  env: Env
): Promise<Response> {
  const body = await request.json() as PressRequest;

  if (!body.name || !body.email || !body.message) {
    return Response.json(
      { error: 'name, email, and message are required' },
      { status: 400 }
    );
  }

  const outletLine = body.outlet
    ? `<p><strong>Outlet:</strong> ${escapeHtml(body.outlet)}</p>`
    : '';

  const htmlContent = `
    <h2>Press Inquiry from ${escapeHtml(body.name)}</h2>
    <p><strong>Name:</strong> ${escapeHtml(body.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(body.email)}</p>
    ${outletLine}
    <hr />
    <p>${escapeHtml(body.message).replace(/\n/g, '<br />')}</p>
  `.trim();

  const payload: BrevoEmailPayload = {
    sender: {
      name: env.SENDER_NAME,
      email: env.SENDER_EMAIL,
    },
    to: [{ email: env.PRESS_EMAIL_TO, name: 'Tomato Warning Press' }],
    replyTo: { email: body.email, name: body.name },
    subject: `Press Inquiry: ${body.name}${body.outlet ? ` (${body.outlet})` : ''}`,
    htmlContent,
  };

  await sendTransactionalEmail(env.BREVO_API_KEY, payload);

  return Response.json({ message: 'Inquiry sent successfully.' });
}
