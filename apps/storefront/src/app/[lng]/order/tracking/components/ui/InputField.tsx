'use client';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
}

export default function InputField({
  label,
  required = false,
  className = '',
  ...props
}: InputFieldProps) {
  return (
    <div>
      <label className="block text-[#6A6A6A] text-xs uppercase tracking-widest mb-1.5">
        {label} {required && <span className="text-[#C0C0C0]">*</span>}
      </label>
      <input
        {...props}
        className={`w-full border border-[#E0E0E0] px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#C0C0C0] 
                   focus:border-[#9A9A9A] transition-colors outline-none ${className}`}
      />
    </div>
  );
}
