import { useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { FormField } from './FormField';
import { FormSuccess } from './FormSuccess';
import { FormError } from './FormError';
import { validateEmail, validateRequired, validateMinLength, validateForm } from '@/lib/validation';

export interface PressInquiryFormProps {
  submitEndpoint?: string;
  fallbackMailto: string;
  successMessage: string;
  privacyPolicyUrl: string;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function PressInquiryForm({
  submitEndpoint,
  fallbackMailto,
  successMessage,
  privacyPolicyUrl,
}: PressInquiryFormProps): JSX.Element {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [outlet, setOutlet] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');

  if (!submitEndpoint) {
    return (
      <p>
        <a href={fallbackMailto}>Contact us via email</a>
      </p>
    );
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();

    const formErrors = validateForm(
      { name, email, outlet, message },
      {
        name: [{ validator: (v) => validateRequired(v, 'Name') }],
        email: [{ validator: validateEmail }],
        message: [{ validator: (v) => validateMinLength(v, 10, 'Message') }],
      }
    );
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setStatus('submitting');

    try {
      const response = await fetch(submitEndpoint!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, outlet, message }),
      });
      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') return <FormSuccess message={successMessage} />;
  if (status === 'error') {
    return (
      <FormError message="Something went wrong. Please try again." onRetry={() => setStatus('idle')} />
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div class="flex flex-col gap-4">
        <FormField name="name" label="Name" type="text" required value={name} onInput={setName} error={errors.name} autoComplete="name" />
        <FormField name="email" label="Email address" type="email" required value={email} onInput={setEmail} error={errors.email} inputMode="email" autoComplete="email" />
        <FormField name="outlet" label="Outlet or publication" type="text" value={outlet} onInput={setOutlet} error={errors.outlet} autoComplete="organization" />
        <FormField name="message" label="Message" type="textarea" required value={message} onInput={setMessage} error={errors.message} minLength={10} />
        <button type="submit" disabled={status === 'submitting'} class="bg-blue-600 text-white rounded px-4 py-2 font-semibold disabled:opacity-50">
          {status === 'submitting' ? 'Sending…' : 'Send Inquiry'}
        </button>
        <p class="text-sm text-gray-600">
          <a href={privacyPolicyUrl} class="underline">Privacy Policy</a>
        </p>
      </div>
    </form>
  );
}
