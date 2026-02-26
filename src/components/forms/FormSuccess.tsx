import { useEffect, useRef } from 'preact/hooks';
import type { JSX } from 'preact';

export interface FormSuccessProps {
  message: string;
}

export function FormSuccess({ message }: FormSuccessProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      tabIndex={-1}
      class="rounded p-4 bg-green-50 border border-green-200 text-green-800 outline-none"
    >
      {message}
    </div>
  );
}
