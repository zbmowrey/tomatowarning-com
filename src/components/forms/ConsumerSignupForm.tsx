import { useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { FormField } from './FormField';
import { FormSuccess } from './FormSuccess';
import { FormError } from './FormError';
import { submitToEmailPlatform } from '@/lib/submit';
import { fireConversionEvent } from '@/lib/analytics';
import { validateEmail, validateZipCode, validateForm } from '@/lib/validation';
import type { ValidationRule } from '@/lib/validation';

export interface ConsumerSignupFormProps {
  formEndpoint: string;
  listId: string;
  analyticsEvent: 'consumer_signup';
  successMessage: string;
  alreadySubscribedMessage: string;
  noscriptFallbackUrl: string;
  sourceContext?: string;
  showZipCode?: boolean;
  privacyPolicyUrl: string;
}

type Status = 'idle' | 'submitting' | 'success' | 'already_subscribed' | 'error';

export function ConsumerSignupForm({
  formEndpoint,
  listId,
  successMessage,
  alreadySubscribedMessage,
  noscriptFallbackUrl,
  sourceContext,
  showZipCode = true,
  privacyPolicyUrl,
}: ConsumerSignupFormProps): JSX.Element {
  const [email, setEmail] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverMessage, setServerMessage] = useState('');

  async function handleSubmit(e: Event) {
    e.preventDefault();

    const data: Record<string, string> = { email };
    if (showZipCode) data.zipCode = zipCode;

    const rules: Record<string, ValidationRule[]> = {
      email: [{ validator: validateEmail }],
    };
    if (showZipCode) {
      rules.zipCode = [{ validator: validateZipCode }];
    }

    const formErrors = validateForm(data, rules);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setStatus('submitting');

    const fields: Record<string, string> = {};
    if (showZipCode && zipCode) fields.zipCode = zipCode;

    const result = await submitToEmailPlatform(formEndpoint, { email, listId, fields });
    setServerMessage(result.status === 'success' ? successMessage : alreadySubscribedMessage);
    setStatus(result.status as Status);

    if (result.status === 'success') {
      const props: { source_page: string; product_variety?: string } = {
        source_page: window.location.href,
      };
      if (sourceContext) props.product_variety = sourceContext;
      fireConversionEvent('consumer_signup', props);
    }
  }

  if (status === 'success') return <FormSuccess message={serverMessage} />;
  if (status === 'already_subscribed') return <FormSuccess message={serverMessage} />;
  if (status === 'error') {
    return (
      <FormError
        message="Something went wrong. Please try again."
        onRetry={() => setStatus('idle')}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div class="flex flex-col gap-4">
        <FormField
          name="email"
          label="Email address"
          type="email"
          required
          value={email}
          onInput={setEmail}
          error={errors.email}
          inputMode="email"
          autoComplete="email"
        />
        {showZipCode && (
          <FormField
            name="zipCode"
            label="Zip code (optional)"
            type="text"
            value={zipCode}
            onInput={setZipCode}
            error={errors.zipCode}
            inputMode="numeric"
            autoComplete="postal-code"
          />
        )}
        <button
          type="submit"
          disabled={status === 'submitting'}
          class="bg-[var(--ef-color-3)] text-white rounded px-4 py-2 font-semibold shadow-md hover:shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
        >
          {status === 'submitting' ? 'Signing up…' : 'Notify Me'}
        </button>
        <p class="text-sm text-gray-600">
          <a href={privacyPolicyUrl} class="underline">
            Privacy Policy
          </a>
        </p>
      </div>
      <noscript>
        <p>
          <a href={noscriptFallbackUrl}>Sign up via our hosted form</a>
        </p>
      </noscript>
    </form>
  );
}
