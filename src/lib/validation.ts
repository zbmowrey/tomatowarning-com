export type ValidationRule = {
  validator: (value: string) => string | null;
};

export function validateEmail(email: string): string | null {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) ? null : 'Please enter a valid email address.';
}

export function validateRequired(value: string, fieldName: string): string | null {
  return value.trim().length > 0 ? null : `${fieldName} is required.`;
}

export function validateZipCode(zip: string): string | null {
  if (zip === '') return null;
  return /^\d{5}$/.test(zip) ? null : 'Please enter a 5-digit zip code.';
}

export function validateMaxLength(value: string, max: number, fieldName: string): string | null {
  return value.length <= max ? null : `${fieldName} must be ${max} characters or fewer.`;
}

export function validateMinLength(value: string, min: number, fieldName: string): string | null {
  return value.length >= min ? null : `${fieldName} must be at least ${min} characters.`;
}

export function validateForm(
  data: Record<string, string>,
  rules: Record<string, ValidationRule[]>
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of Object.keys(rules)) {
    const value = data[field] ?? '';
    for (const rule of rules[field]) {
      const error = rule.validator(value);
      if (error !== null) {
        errors[field] = error;
        break;
      }
    }
  }
  return errors;
}
