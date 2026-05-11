import { memo } from 'react';

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}

/**
 * Memoized to prevent re-renders when sibling fields update.
 * onChange must be a stable reference (useCallback) for memo to be effective.
 */
export const InputField = memo(function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  autoComplete = '',
}: InputFieldProps) {
  return (
    <div>
      <label
        className="block text-[#6A6A6A] text-xs uppercase tracking-widest mb-1.5"
        style={{ letterSpacing: '0.1em' }}
      >
        {label}{' '}
        {required && (
          <span className="text-[#C0C0C0]" aria-hidden>
            *
          </span>
        )}
        {required && <span className="sr-only">(required)</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="w-full border border-[#E0E0E0] px-4 py-3 text-sm text-[#1A1A1A] bg-white placeholder:text-[#B0B0B0] outline-none focus:border-[#9A9A9A] transition-colors"
      />
    </div>
  );
});
