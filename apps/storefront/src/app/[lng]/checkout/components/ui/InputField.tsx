import { memo, useId } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface InputFieldProps {
  label: string;
  registration: UseFormRegisterReturn;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  error?: string;
}

export const InputField = memo(function InputField({
  label,
  registration,
  type = 'text',
  placeholder = '',
  required = false,
  autoComplete = '',
  error,
}: InputFieldProps) {
  const errorId = useId();

  return (
    <div>
      <label
        className="block text-[#6A6A6A] text-xs uppercase tracking-widest mb-1.5"
        style={{ letterSpacing: '0.1em' }}
      >
        {label}{' '}
        {required && (
          <>
            <span className="text-[#C0C0C0]" aria-hidden>*</span>
            <span className="sr-only">(required)</span>
          </>
        )}
      </label>
      <input
        {...registration}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`w-full border px-4 py-3 text-sm text-[#1A1A1A] bg-white placeholder:text-[#B0B0B0] outline-none transition-colors ${
          error
            ? 'border-[#C0392B] focus:border-[#C0392B]'
            : 'border-[#E0E0E0] focus:border-[#9A9A9A]'
        }`}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-[#C0392B] text-xs">
          {error}
        </p>
      )}
    </div>
  );
});
