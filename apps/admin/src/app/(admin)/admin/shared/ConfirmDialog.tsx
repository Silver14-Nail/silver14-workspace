'use client';

import { useState, useEffect } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setLoading(false);
      setError('');
    }
  }, [open]);

  if (!open) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/50" onClick={handleClose} />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 pointer-events-auto">
          {variant === 'danger' && (
            <div className="flex items-center justify-center w-11 h-11 rounded-full bg-red-50 mb-4 mx-auto">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
          )}

          <h3 className="text-sm font-semibold text-[#111827] text-center leading-snug">{title}</h3>
          <p className="mt-1.5 text-xs text-[#6B7280] text-center leading-relaxed">{description}</p>

          {error && (
            <div className="mt-3 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
              <p className="text-xs text-red-600 text-center">{error}</p>
            </div>
          )}

          <div className="flex gap-2.5 mt-5">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#374151] hover:bg-[#F3F4F6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${
                variant === 'danger'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-[#111827] hover:bg-[#374151]'
              }`}
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {loading ? 'Processing...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
