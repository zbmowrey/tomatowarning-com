import type { JSX } from 'preact';

export interface FormFieldProps {
  name: string;
  label: string;
  type: 'text' | 'email' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  value: string;
  onInput: (value: string) => void;
  error?: string | null;
  options?: { value: string; label: string }[];
  maxLength?: number;
  minLength?: number;
  inputMode?: 'email' | 'text' | 'numeric';
  autoComplete?: string;
}

export function FormField({
  name,
  label,
  type,
  required,
  placeholder,
  value,
  onInput,
  error,
  options,
  maxLength,
  minLength,
  inputMode,
  autoComplete,
}: FormFieldProps): JSX.Element {
  const fieldId = name;
  const errorId = `${name}-error`;
  const hasError = error != null && error !== '';

  const sharedProps = {
    id: fieldId,
    name,
    required: required || undefined,
    'aria-required': required ? ('true' as const) : undefined,
    'aria-invalid': hasError ? ('true' as const) : undefined,
    'aria-describedby': hasError ? errorId : undefined,
    placeholder,
  };

  let field: JSX.Element;

  if (type === 'select') {
    field = (
      <select
        {...sharedProps}
        value={value}
        onInput={(e) => onInput((e.target as HTMLSelectElement).value)}
        class="w-full border border-storm-charcoal/20 rounded-md px-3 py-2 bg-white/70 focus:outline-none focus:ring-2 focus:ring-accent-gold focus:border-accent-gold transition-all duration-200"
      >
        <option value="">Select…</option>
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  } else if (type === 'textarea') {
    field = (
      <textarea
        {...sharedProps}
        value={value}
        maxLength={maxLength}
        minLength={minLength}
        onInput={(e) => onInput((e.target as HTMLTextAreaElement).value)}
        class="w-full border border-storm-charcoal/20 rounded-md px-3 py-2 bg-white/70 focus:outline-none focus:ring-2 focus:ring-accent-gold focus:border-accent-gold transition-all duration-200 resize-y"
        rows={4}
      />
    );
  } else {
    field = (
      <input
        {...sharedProps}
        type={type}
        value={value}
        inputMode={inputMode}
        autocomplete={autoComplete}
        maxLength={maxLength}
        minLength={minLength}
        onInput={(e) => onInput((e.target as HTMLInputElement).value)}
        class="w-full border border-storm-charcoal/20 rounded-md px-3 py-2 bg-white/70 focus:outline-none focus:ring-2 focus:ring-accent-gold focus:border-accent-gold transition-all duration-200"
      />
    );
  }

  return (
    <div class="flex flex-col gap-1">
      <label for={fieldId} class="text-sm font-medium">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {field}
      {hasError && (
        <span id={errorId} class="text-sm text-red-600" aria-live="polite">
          {error}
        </span>
      )}
    </div>
  );
}
