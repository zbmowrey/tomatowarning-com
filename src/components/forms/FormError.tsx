import type { JSX } from 'preact';

export interface FormErrorProps {
  message: string;
  onRetry: () => void;
}

export function FormError({ message, onRetry }: FormErrorProps): JSX.Element {
  return (
    <div
      role="alert"
      aria-live="assertive"
      class="rounded p-4 bg-red-50 border border-red-200 text-red-800"
    >
      <p>{message}</p>
      <button
        type="button"
        onClick={onRetry}
        class="mt-2 text-sm underline hover:no-underline"
      >
        Try again
      </button>
    </div>
  );
}
