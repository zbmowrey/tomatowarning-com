import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/preact';
import { FormField } from '../FormField';

describe('FormField', () => {
  const baseProps = {
    name: 'email',
    label: 'Email address',
    type: 'email' as const,
    value: '',
    onInput: vi.fn(),
  };

  it('renders a label with the correct text', () => {
    render(<FormField {...baseProps} />);
    expect(screen.getByLabelText('Email address')).toBeTruthy();
  });

  it('renders an input associated with the label', () => {
    render(<FormField {...baseProps} />);
    const input = screen.getByLabelText('Email address');
    expect(input.tagName).toBe('INPUT');
  });

  it('sets inputmode attribute when inputMode prop is provided', () => {
    render(<FormField {...baseProps} inputMode="email" />);
    const input = screen.getByLabelText('Email address');
    expect(input.getAttribute('inputmode')).toBe('email');
  });

  it('sets autocomplete attribute when autoComplete prop is provided', () => {
    render(<FormField {...baseProps} autoComplete="email" />);
    const input = screen.getByLabelText('Email address');
    expect(input.getAttribute('autocomplete')).toBe('email');
  });

  // WCAG: aria-required
  it('renders aria-required="true" and required when required is true', () => {
    render(<FormField {...baseProps} required />);
    // Label contains a hidden " *" span so use exact:false
    const input = screen.getByLabelText('Email address', { exact: false });
    expect(input.getAttribute('aria-required')).toBe('true');
    expect(input.hasAttribute('required')).toBe(true);
  });

  it('does not render aria-required when required is false/omitted', () => {
    render(<FormField {...baseProps} />);
    const input = screen.getByLabelText('Email address');
    expect(input.getAttribute('aria-required')).toBeNull();
  });

  // WCAG: aria-invalid + aria-describedby
  it('renders aria-invalid="true" when error is provided', () => {
    render(<FormField {...baseProps} error="Please enter a valid email." />);
    const input = screen.getByLabelText('Email address');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('renders aria-describedby pointing to {name}-error when error is present', () => {
    render(<FormField {...baseProps} error="Please enter a valid email." />);
    const input = screen.getByLabelText('Email address');
    expect(input.getAttribute('aria-describedby')).toBe('email-error');
  });

  it('renders error message element with correct id', () => {
    render(<FormField {...baseProps} error="Please enter a valid email." />);
    const errorEl = document.getElementById('email-error');
    expect(errorEl).toBeTruthy();
    expect(errorEl?.textContent).toBe('Please enter a valid email.');
  });

  it('does not render aria-invalid when error is null', () => {
    render(<FormField {...baseProps} error={null} />);
    const input = screen.getByLabelText('Email address');
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('does not render aria-describedby when error is null', () => {
    render(<FormField {...baseProps} error={null} />);
    const input = screen.getByLabelText('Email address');
    expect(input.getAttribute('aria-describedby')).toBeNull();
  });

  it('calls onInput when input value changes', () => {
    const onInput = vi.fn();
    render(<FormField {...baseProps} onInput={onInput} />);
    const input = screen.getByLabelText('Email address');
    fireEvent.input(input, { target: { value: 'test@example.com' } });
    expect(onInput).toHaveBeenCalledWith('test@example.com');
  });

  // Textarea
  it('renders a textarea when type is textarea', () => {
    render(<FormField {...baseProps} name="message" label="Message" type="textarea" />);
    const textarea = screen.getByLabelText('Message');
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('sets maxlength on textarea when maxLength is provided', () => {
    render(
      <FormField {...baseProps} name="message" label="Message" type="textarea" maxLength={500} />
    );
    const textarea = screen.getByLabelText('Message');
    expect(textarea.getAttribute('maxlength')).toBe('500');
  });

  // Select
  it('renders a select with options when type is select', () => {
    render(
      <FormField
        {...baseProps}
        name="role"
        label="Role"
        type="select"
        options={[
          { value: 'buyer', label: 'Buyer' },
          { value: 'other', label: 'Other' },
        ]}
      />
    );
    const select = screen.getByLabelText('Role');
    expect(select.tagName).toBe('SELECT');
    expect(screen.getByText('Buyer')).toBeTruthy();
    expect(screen.getByText('Other')).toBeTruthy();
  });
});
