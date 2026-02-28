import { useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { FormField } from './FormField';
import { FormSuccess } from './FormSuccess';
import { FormError } from './FormError';
import { submitToEmailPlatform } from '@/lib/submit';
import { fireConversionEvent } from '@/lib/analytics';
import { validateEmail, validateRequired, validateForm } from '@/lib/validation';
import type { ConversionEventName } from '@/lib/analytics';

export interface FooterSignupFormProps {
  formEndpoint: string;
  consumerListId: string;
  retailerListId: string;
  nonprofitListId: string;
  successMessage: string;
  alreadySubscribedMessage: string;
  noscriptFallbackUrl: string;
  privacyPolicyUrl: string;
}

type Status = 'idle' | 'submitting' | 'success' | 'already_subscribed' | 'error';
type AudienceType = 'consumer' | 'retailer' | 'nonprofit';

const audienceOptions = [
  { value: 'consumer', label: 'Consumer' },
  { value: 'retailer', label: 'Retailer' },
  { value: 'nonprofit', label: 'Nonprofit/Organization' },
];

const analyticsEventMap: Record<AudienceType, ConversionEventName> = {
  consumer: 'consumer_signup',
  retailer: 'retailer_signup',
  nonprofit: 'nonprofit_signup',
};

export function FooterSignupForm({
  formEndpoint,
  consumerListId,
  retailerListId,
  nonprofitListId,
  successMessage,
  alreadySubscribedMessage,
  noscriptFallbackUrl,
  privacyPolicyUrl,
}: FooterSignupFormProps): JSX.Element {
  const [email, setEmail] = useState('');
  const [audienceType, setAudienceType] = useState<string>('consumer');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverMessage, setServerMessage] = useState('');

  function getListId(audience: string): string {
    if (audience === 'retailer') return retailerListId;
    if (audience === 'nonprofit') return nonprofitListId;
    return consumerListId;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();

    const formErrors = validateForm(
      { email, audienceType },
      {
        email: [{ validator: validateEmail }],
        audienceType: [{ validator: (v) => validateRequired(v, 'Audience type') }],
      }
    );
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setStatus('submitting');

    const listId = getListId(audienceType);
    const result = await submitToEmailPlatform(formEndpoint, { email, listId });
    if (result.status === 'success') {
      setServerMessage(successMessage);
    } else if (result.status === 'already_subscribed') {
      setServerMessage(alreadySubscribedMessage);
    } else {
      setServerMessage(result.message);
    }
    setStatus(result.status as Status);

    if (result.status === 'success') {
      const eventName = analyticsEventMap[audienceType as AudienceType] ?? 'consumer_signup';
      // product_variety is intentionally omitted for footer signups (not a product page)
      fireConversionEvent(eventName, { source_page: window.location.href });
    }
  }

  if (status === 'success') return <FormSuccess message={serverMessage} />;
  if (status === 'already_subscribed') return <FormSuccess message={serverMessage} />;
  if (status === 'error') {
    return (
      <FormError message={serverMessage || 'Something went wrong. Please try again.'} onRetry={() => setStatus('idle')} />
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div class="flex flex-col gap-3">
        <h3 class="text-xl font-bold text-[var(--premium-white)] m-0 tracking-tight">Join the Warning Path</h3>
        <p class="text-[var(--premium-white)] opacity-80 m-0 mb-2 text-sm leading-relaxed">
          Sign up to be the first to know when the latest small batches drop, get exclusive access to reserve jars, and receive updates directly from the weather center.
        </p>
        <FormField name="email" label="Email address" type="email" required value={email} onInput={setEmail} error={errors.email} inputMode="email" autoComplete="email" />
        <FormField name="audienceType" label="I am a…" type="select" required value={audienceType} onInput={setAudienceType} error={errors.audienceType} options={audienceOptions} />
        <button type="submit" disabled={status === 'submitting'} class="bg-[var(--ef-color-3)] text-white rounded px-4 py-2 font-semibold shadow-md hover:shadow-lg hover:brightness-110 transition-all disabled:opacity-50">
          {status === 'submitting' ? 'Signing up…' : 'Sign Up'}
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
