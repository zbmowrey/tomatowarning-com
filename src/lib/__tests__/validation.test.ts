import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validateRequired,
  validateZipCode,
  validateMaxLength,
  validateMinLength,
  validateForm,
} from '../validation';

describe('validateEmail', () => {
  it('returns null for a valid email', () => {
    expect(validateEmail('user@example.com')).toBeNull();
    expect(validateEmail('user+tag@sub.domain.org')).toBeNull();
  });

  it('returns an error for empty string', () => {
    expect(validateEmail('')).not.toBeNull();
  });

  it('returns an error for missing @', () => {
    expect(validateEmail('notanemail')).not.toBeNull();
  });

  it('returns an error for missing domain', () => {
    expect(validateEmail('user@')).not.toBeNull();
  });

  it('returns an error for missing local part', () => {
    expect(validateEmail('@example.com')).not.toBeNull();
  });

  it('returns a user-facing error message string', () => {
    expect(typeof validateEmail('bad')).toBe('string');
  });
});

describe('validateRequired', () => {
  it('returns null for a non-empty value', () => {
    expect(validateRequired('hello', 'Name')).toBeNull();
  });

  it('returns an error for empty string', () => {
    expect(validateRequired('', 'Name')).not.toBeNull();
  });

  it('returns an error for whitespace-only string', () => {
    expect(validateRequired('   ', 'Name')).not.toBeNull();
  });

  it('includes the field name in the error message', () => {
    const err = validateRequired('', 'Store Name');
    expect(err).toContain('Store Name');
  });

  it('returns null for value with surrounding whitespace but non-empty content', () => {
    expect(validateRequired('  hello  ', 'Field')).toBeNull();
  });
});

describe('validateZipCode', () => {
  it('returns null for a valid 5-digit zip', () => {
    expect(validateZipCode('12345')).toBeNull();
    expect(validateZipCode('00000')).toBeNull();
  });

  it('returns null for empty string (optional field)', () => {
    expect(validateZipCode('')).toBeNull();
  });

  it('returns an error for a 4-digit zip', () => {
    expect(validateZipCode('1234')).not.toBeNull();
  });

  it('returns an error for a 6-digit zip', () => {
    expect(validateZipCode('123456')).not.toBeNull();
  });

  it('returns an error for zip with letters', () => {
    expect(validateZipCode('1234a')).not.toBeNull();
  });

  it('returns an error for zip with hyphen (9-digit not supported)', () => {
    expect(validateZipCode('12345-6789')).not.toBeNull();
  });
});

describe('validateMaxLength', () => {
  it('returns null when value is within limit', () => {
    expect(validateMaxLength('hello', 10, 'Message')).toBeNull();
  });

  it('returns null when value is exactly at limit', () => {
    expect(validateMaxLength('hello', 5, 'Message')).toBeNull();
  });

  it('returns an error when value exceeds limit', () => {
    expect(validateMaxLength('hello!', 5, 'Message')).not.toBeNull();
  });

  it('includes the max number in the error message', () => {
    const err = validateMaxLength('toolong', 5, 'Message');
    expect(err).toContain('5');
  });

  it('returns null for empty string', () => {
    expect(validateMaxLength('', 5, 'Message')).toBeNull();
  });
});

describe('validateMinLength', () => {
  it('returns null when value meets minimum', () => {
    expect(validateMinLength('hello', 5, 'Message')).toBeNull();
  });

  it('returns null when value exceeds minimum', () => {
    expect(validateMinLength('hello world', 5, 'Message')).toBeNull();
  });

  it('returns an error when value is below minimum', () => {
    expect(validateMinLength('hi', 5, 'Message')).not.toBeNull();
  });

  it('includes the min number in the error message', () => {
    const err = validateMinLength('hi', 10, 'Message');
    expect(err).toContain('10');
  });

  it('returns an error for empty string when min > 0', () => {
    expect(validateMinLength('', 1, 'Message')).not.toBeNull();
  });
});

describe('validateForm', () => {
  it('returns empty object when all fields are valid', () => {
    const errors = validateForm(
      { email: 'user@example.com', name: 'Alice' },
      {
        email: [{ validator: validateEmail }],
        name: [{ validator: (v) => validateRequired(v, 'Name') }],
      }
    );
    expect(errors).toEqual({});
  });

  it('returns errors for invalid fields', () => {
    const errors = validateForm(
      { email: 'bad', name: '' },
      {
        email: [{ validator: validateEmail }],
        name: [{ validator: (v) => validateRequired(v, 'Name') }],
      }
    );
    expect(errors.email).toBeDefined();
    expect(errors.name).toBeDefined();
  });

  it('returns only the first error per field when multiple rules fail', () => {
    const errors = validateForm(
      { message: '' },
      {
        message: [
          { validator: (v) => validateRequired(v, 'Message') },
          { validator: (v) => validateMinLength(v, 10, 'Message') },
        ],
      }
    );
    expect(typeof errors.message).toBe('string');
  });

  it('handles conditional fields — absent field key means no validation', () => {
    // roleOther is not in rules when role != "Other"
    const errors = validateForm(
      { role: 'buyer', roleOther: '' },
      {
        role: [{ validator: (v) => validateRequired(v, 'Role') }],
        // roleOther intentionally excluded from rules
      }
    );
    expect(errors.roleOther).toBeUndefined();
  });

  it('validates conditional field when included in rules', () => {
    const errors = validateForm(
      { role: 'other', roleOther: '' },
      {
        role: [{ validator: (v) => validateRequired(v, 'Role') }],
        roleOther: [{ validator: (v) => validateRequired(v, 'Role description') }],
      }
    );
    expect(errors.roleOther).toBeDefined();
  });
});
