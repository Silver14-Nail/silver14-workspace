import { ArrowLeft, ChevronRight, CreditCard } from 'lucide-react';

interface BackButtonProps {
  label: string;
  onClick: () => void;
}

export function BackButton({ label, onClick }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-[#9A9A9A] text-xs mb-6 hover:text-[#1A1A1A] transition-colors"
    >
      <ArrowLeft className="size-3.5" aria-hidden />
      {label}
    </button>
  );
}

interface StepButtonProps {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

export function StepButton({ label, disabled, onClick }: StepButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-8 w-full flex items-center justify-center gap-2 bg-[#1A1A1A] text-white py-4 text-xs uppercase tracking-widest hover:bg-[#333] transition-colors disabled:bg-[#D0D0D0] disabled:cursor-not-allowed"
      style={{ letterSpacing: '0.15em' }}
    >
      {label} <ChevronRight className="size-4" aria-hidden />
    </button>
  );
}

interface PayButtonProps {
  label: string;
  processingLabel: string;
  amount: string;
  isProcessing: boolean;
  onClick: () => void;
}

export function PayButton({
  label,
  processingLabel,
  amount,
  isProcessing,
  onClick,
}: PayButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isProcessing}
      className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] text-white py-4 text-xs uppercase tracking-widest hover:bg-[#333] transition-colors disabled:bg-[#6A6A6A]"
      style={{ letterSpacing: '0.15em' }}
    >
      {isProcessing ? (
        <>
          <span
            className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
            aria-hidden
          />
          {processingLabel}
        </>
      ) : (
        <>
          <CreditCard className="size-4" aria-hidden />
          {label} {amount}
        </>
      )}
    </button>
  );
}
