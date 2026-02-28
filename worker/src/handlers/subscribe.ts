import type { Env, SubscribeRequest, BrevoContactPayload, BrevoEmailPayload } from '../types';
import { createOrUpdateContact, sendTransactionalEmail } from '../brevo';

/** Map camelCase field keys from frontend to SCREAMING_SNAKE Brevo attributes. */
const FIELD_MAP: Record<string, string> = {
  zipCode: 'ZIP_CODE',
  name: 'CONTACT_NAME',
  contactName: 'CONTACT_NAME',
  storeName: 'STORE_NAME',
  location: 'LOCATION',
  role: 'ROLE',
  roleOther: 'ROLE_OTHER',
  message: 'MESSAGE',
  sourceContext: 'SOURCE_CONTEXT',
  orgName: 'ORG_NAME',
  orgType: 'ORG_TYPE',
  orgTypeOther: 'ORG_TYPE_OTHER',
  campaignSize: 'CAMPAIGN_SIZE',
};

function buildAttributes(body: SubscribeRequest): Record<string, string> {
  const attrs: Record<string, string> = {};

  if (body.signupSource) attrs.SIGNUP_SOURCE = body.signupSource;

  if (body.utmParams) {
    const { utmSource, utmMedium, utmCampaign, utmContent } = body.utmParams;
    if (utmSource) attrs.UTM_SOURCE = utmSource;
    if (utmMedium) attrs.UTM_MEDIUM = utmMedium;
    if (utmCampaign) attrs.UTM_CAMPAIGN = utmCampaign;
    if (utmContent) attrs.UTM_CONTENT = utmContent;
  }

  if (body.fields) {
    for (const [key, value] of Object.entries(body.fields)) {
      const attr = FIELD_MAP[key];
      if (attr && value) {
        attrs[attr] = value;
      }
    }
  }

  return attrs;
}

/** Human-readable labels for notification emails. */
const FIELD_LABELS: Record<string, string> = {
  name: 'Name',
  contactName: 'Contact Name',
  storeName: 'Store Name',
  location: 'Location',
  role: 'Role',
  roleOther: 'Role (Other)',
  message: 'Message',
  sourceContext: 'Source',
  orgName: 'Organization',
  orgType: 'Organization Type',
  orgTypeOther: 'Org Type (Other)',
  campaignSize: 'Campaign Size',
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildNotificationEmail(
  formType: string,
  email: string,
  fields: Record<string, string>,
  env: Env
): BrevoEmailPayload {
  const rows = Object.entries(fields)
    .filter(([, v]) => v)
    .map(([k, v]) => {
      const label = FIELD_LABELS[k] ?? k;
      return `<tr><td style="padding:6px 12px;font-weight:600;vertical-align:top">${escapeHtml(label)}</td><td style="padding:6px 12px">${escapeHtml(v)}</td></tr>`;
    })
    .join('');

  const htmlContent = `
    <h2>New ${formType} Submission</h2>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <table style="border-collapse:collapse;margin-top:12px">${rows}</table>
  `.trim();

  return {
    sender: { name: env.SENDER_NAME, email: env.SENDER_EMAIL },
    to: [{ email: env.NOTIFY_EMAIL_TO, name: 'Tomato Warning' }],
    replyTo: { email, name: fields.name ?? fields.contactName ?? email },
    subject: `New ${formType}: ${fields.name ?? fields.contactName ?? email}`,
    htmlContent,
  };
}

export async function handleSubscribe(
  request: Request,
  env: Env
): Promise<Response> {
  const body = await request.json() as SubscribeRequest;

  if (!body.email || !body.listId) {
    return Response.json(
      { error: 'email and listId are required' },
      { status: 400 }
    );
  }

  const listIdInt = parseInt(body.listId, 10);
  if (isNaN(listIdInt)) {
    return Response.json(
      { error: 'listId must be a valid number' },
      { status: 400 }
    );
  }

  const payload: BrevoContactPayload = {
    email: body.email,
    attributes: buildAttributes(body),
    listIds: [listIdInt],
    updateEnabled: true,
  };

  const result = await createOrUpdateContact(env.BREVO_API_KEY, payload);

  // Send notification email for retailer and nonprofit submissions
  const notifyListIds = [env.RETAILER_LIST_ID, env.NONPROFIT_LIST_ID];
  if (!result.alreadySubscribed && notifyListIds.includes(body.listId) && body.fields) {
    const formType = body.listId === env.RETAILER_LIST_ID ? 'Retailer Inquiry' : 'Fundraiser Application';
    const emailPayload = buildNotificationEmail(formType, body.email, body.fields, env);
    try {
      await sendTransactionalEmail(env.BREVO_API_KEY, emailPayload);
    } catch (err) {
      console.error('Notification email failed:', err);
    }
  }

  if (result.alreadySubscribed) {
    return Response.json({
      message: "You're already signed up.",
      already_subscribed: true,
    });
  }

  return Response.json({
    message: "You're on the list.",
    already_subscribed: false,
  });
}
