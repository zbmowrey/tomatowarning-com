import { useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { FormField } from './FormField';
import { FormSuccess } from './FormSuccess';
import { FormError } from './FormError';
import { submitToEmailPlatform } from '@/lib/submit';
import { fireConversionEvent } from '@/lib/analytics';
import { validateEmail, validateForm } from '@/lib/validation';

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

export function FooterSignupForm({
  formEndpoint,
  consumerListId,
  successMessage,
  alreadySubscribedMessage,
  noscriptFallbackUrl,
  privacyPolicyUrl,
}: FooterSignupFormProps): JSX.Element {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverMessage, setServerMessage] = useState('');

  async function handleSubmit(e: Event) {
    e.preventDefault();

    const formErrors = validateForm(
      { email },
      {
        email: [{ validator: validateEmail }],
      }
    );
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setStatus('submitting');

    const result = await submitToEmailPlatform(formEndpoint, { email, listId: consumerListId });
    if (result.status === 'success') {
      setServerMessage(successMessage);
    } else if (result.status === 'already_subscribed') {
      setServerMessage(alreadySubscribedMessage);
    } else {
      setServerMessage(result.message);
    }
    setStatus(result.status as Status);

    if (result.status === 'success') {
      fireConversionEvent('consumer_signup', { source_page: window.location.href });
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
          Get launch updates and exclusive offers
        </p>
        <FormField name="email" label="Email address" type="email" required value={email} onInput={setEmail} error={errors.email} inputMode="email" autoComplete="email" />
        <button type="submit" disabled={status === 'submitting'} class="bg-[var(--ef-color-3)] text-white rounded px-4 py-2 font-semibold shadow-md hover:shadow-lg hover:brightness-110 transition-all disabled:opacity-50">
          {status === 'submitting' ? 'Signing up…' : 'Sign Up'}
        </button>
        <p class="text-xs" style={{ color: '#A9A29A' }}>
          Are you a retailer or organization? <a href="/retailers/" class="underline" style={{ color: '#A9A29A' }}>Contact us</a>
        </p>
        <p class="text-sm" style={{ color: '#A9A29A' }}>
          <a href={privacyPolicyUrl} class="underline" style={{ color: '#A9A29A' }}>Privacy Policy</a>
        </p>
      </div>
      <noscript>
        <p><a href={noscriptFallbackUrl}>Sign up via our hosted form</a></p>
      </noscript>
    </form>
  );
}
