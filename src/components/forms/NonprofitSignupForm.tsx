import { useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { FormField } from './FormField';
import { FormSuccess } from './FormSuccess';
import { FormError } from './FormError';
import { submitToEmailPlatform } from '@/lib/submit';
import { fireConversionEvent } from '@/lib/analytics';
import { validateEmail, validateRequired, validateForm } from '@/lib/validation';
import type { ValidationRule } from '@/lib/validation';

export interface NonprofitSignupFormProps {
  formEndpoint: string;
  listId: string;
  analyticsEvent: 'nonprofit_signup';
  successMessage: string;
  alreadySubscribedMessage: string;
  noscriptFallbackUrl: string;
  sourceContext: string;
  privacyPolicyUrl: string;
}

type Status = 'idle' | 'submitting' | 'success' | 'already_subscribed' | 'error';

const orgTypeOptions = [
  { value: 'youth-sports', label: 'Youth Sports' },
  { value: 'nonprofit-501c3', label: 'Nonprofit 501(c)(3)' },
  { value: 'school', label: 'School' },
  { value: 'church-religious', label: 'Church/Religious' },
  { value: 'community-group', label: 'Community Group' },
  { value: 'other', label: 'Other' },
];

export function NonprofitSignupForm({
  formEndpoint,
  listId,
  successMessage,
  alreadySubscribedMessage,
  noscriptFallbackUrl,
  sourceContext,
  privacyPolicyUrl,
}: NonprofitSignupFormProps): JSX.Element {
  const [email, setEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('');
  const [orgTypeOther, setOrgTypeOther] = useState('');
  const [location, setLocation] = useState('');
  const [campaignSize, setCampaignSize] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverMessage, setServerMessage] = useState('');

  async function handleSubmit(e: Event) {
    e.preventDefault();

    const data: Record<string, string> = { email, contactName, orgName, orgType, location };
    if (orgType === 'other') data.orgTypeOther = orgTypeOther;

    const rules: Record<string, ValidationRule[]> = {
      email: [{ validator: validateEmail }],
      contactName: [{ validator: (v) => validateRequired(v, 'Contact name') }],
      orgName: [{ validator: (v) => validateRequired(v, 'Organization name') }],
      orgType: [{ validator: (v) => validateRequired(v, 'Organization type') }],
      location: [{ validator: (v) => validateRequired(v, 'Location') }],
    };
    if (orgType === 'other') {
      rules.orgTypeOther = [{ validator: (v) => validateRequired(v, 'Organization description') }];
    }

    const formErrors = validateForm(data, rules);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setStatus('submitting');

    const fields: Record<string, string> = { contactName, orgName, orgType, location };
    if (orgType === 'other' && orgTypeOther) fields.orgTypeOther = orgTypeOther;
    if (campaignSize) fields.campaignSize = campaignSize;
    fields.sourceContext = sourceContext;

    const result = await submitToEmailPlatform(formEndpoint, { email, listId, fields });
    setServerMessage(result.status === 'success' ? successMessage : alreadySubscribedMessage);
    setStatus(result.status as Status);

    if (result.status === 'success') {
      fireConversionEvent('nonprofit_signup', { source_page: window.location.href });
    }
  }

  if (status === 'success') return <FormSuccess message={serverMessage} />;
  if (status === 'already_subscribed') return <FormSuccess message={serverMessage} />;
  if (status === 'error') {
    return (
      <FormError message="Something went wrong. Please try again." onRetry={() => setStatus('idle')} />
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div class="flex flex-col gap-4">
        <FormField name="email" label="Email address" type="email" required value={email} onInput={setEmail} error={errors.email} inputMode="email" autoComplete="email" />
        <FormField name="contactName" label="Contact name" type="text" required value={contactName} onInput={setContactName} error={errors.contactName} autoComplete="name" />
        <FormField name="orgName" label="Organization name" type="text" required value={orgName} onInput={setOrgName} error={errors.orgName} autoComplete="organization" />
        <FormField name="orgType" label="Organization type" type="select" required value={orgType} onInput={setOrgType} error={errors.orgType} options={orgTypeOptions} />
        {orgType === 'other' && (
          <FormField name="orgTypeOther" label="Describe your organization" type="text" required value={orgTypeOther} onInput={setOrgTypeOther} error={errors.orgTypeOther} />
        )}
        <FormField name="location" label="Location (city, state)" type="text" required value={location} onInput={setLocation} error={errors.location} autoComplete="address-level2" />
        <FormField name="campaignSize" label="Campaign size (optional)" type="text" value={campaignSize} onInput={setCampaignSize} error={errors.campaignSize} />
        <button type="submit" disabled={status === 'submitting'} class="bg-[var(--ef-color-3)] text-white rounded px-4 py-2 font-semibold shadow-md hover:shadow-lg hover:brightness-110 transition-all disabled:opacity-50">
          {status === 'submitting' ? 'Submitting…' : 'Submit Application'}
        </button>
        <p class="text-sm text-gray-600">
          <a href={privacyPolicyUrl} class="underline">Privacy Policy</a>
        </p>
      </div>
      <noscript>
        <p><a href={noscriptFallbackUrl}>Sign up via our hosted form</a></p>
      </noscript>
    </form>
  );
}
