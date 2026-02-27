import { useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { FormField } from './FormField';
import { FormSuccess } from './FormSuccess';
import { FormError } from './FormError';
import { submitToEmailPlatform } from '@/lib/submit';
import { fireConversionEvent } from '@/lib/analytics';
import { validateEmail, validateRequired, validateMaxLength, validateForm } from '@/lib/validation';
import type { ValidationRule } from '@/lib/validation';

export interface RetailerSignupFormProps {
  formEndpoint: string;
  listId: string;
  analyticsEvent: 'retailer_signup';
  successMessage: string;
  alreadySubscribedMessage: string;
  noscriptFallbackUrl: string;
  sourceContext: string;
  privacyPolicyUrl: string;
}

type Status = 'idle' | 'submitting' | 'success' | 'already_subscribed' | 'error';

const roleOptions = [
  { value: 'store-owner', label: 'Store Owner' },
  { value: 'category-manager', label: 'Category Manager' },
  { value: 'buyer', label: 'Buyer' },
  { value: 'other', label: 'Other' },
];

export function RetailerSignupForm({
  formEndpoint,
  listId,
  successMessage,
  alreadySubscribedMessage,
  noscriptFallbackUrl,
  sourceContext,
  privacyPolicyUrl,
}: RetailerSignupFormProps): JSX.Element {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState('');
  const [roleOther, setRoleOther] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverMessage, setServerMessage] = useState('');

  async function handleSubmit(e: Event) {
    e.preventDefault();

    const data: Record<string, string> = { email, name, storeName, location, role, message };
    if (role === 'other') data.roleOther = roleOther;

    const rules: Record<string, ValidationRule[]> = {
      email: [{ validator: validateEmail }],
      name: [{ validator: (v) => validateRequired(v, 'Name') }],
      storeName: [{ validator: (v) => validateRequired(v, 'Store name') }],
      location: [{ validator: (v) => validateRequired(v, 'Location') }],
      role: [{ validator: (v) => validateRequired(v, 'Role') }],
      message: [{ validator: (v) => validateMaxLength(v, 500, 'Message') }],
    };
    if (role === 'other') {
      rules.roleOther = [{ validator: (v) => validateRequired(v, 'Role description') }];
    }

    const formErrors = validateForm(data, rules);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setStatus('submitting');

    const fields: Record<string, string> = { name, storeName, location, role };
    if (role === 'other' && roleOther) fields.roleOther = roleOther;
    if (message) fields.message = message;
    fields.sourceContext = sourceContext;

    const result = await submitToEmailPlatform(formEndpoint, { email, listId, fields });
    setServerMessage(result.status === 'success' ? successMessage : alreadySubscribedMessage);
    setStatus(result.status as Status);

    if (result.status === 'success') {
      fireConversionEvent('retailer_signup', { source_page: window.location.href });
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
        <FormField name="name" label="Name" type="text" required value={name} onInput={setName} error={errors.name} autoComplete="name" />
        <FormField name="storeName" label="Store name" type="text" required value={storeName} onInput={setStoreName} error={errors.storeName} autoComplete="organization" />
        <FormField name="location" label="Location (city, state)" type="text" required value={location} onInput={setLocation} error={errors.location} autoComplete="address-level2" />
        <FormField name="role" label="Role" type="select" required value={role} onInput={setRole} error={errors.role} options={roleOptions} />
        {role === 'other' && (
          <FormField name="roleOther" label="Describe your role" type="text" required value={roleOther} onInput={setRoleOther} error={errors.roleOther} />
        )}
        <FormField name="message" label="Message (optional)" type="textarea" value={message} onInput={setMessage} error={errors.message} maxLength={500} />
        <button type="submit" disabled={status === 'submitting'} class="bg-[var(--ef-color-3)] text-white rounded px-4 py-2 font-semibold shadow-md hover:shadow-lg hover:brightness-110 transition-all disabled:opacity-50">
          {status === 'submitting' ? 'Sending…' : 'Submit Inquiry'}
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
