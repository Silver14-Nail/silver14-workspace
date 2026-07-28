'use client';

import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Loader2, X, CheckCircle2, AlertCircle } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { useAdminTheme } from '@/app/context/AdminThemeContext';

interface ChangePasswordModalProps {
  onClose: () => void;
}

export default function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const { t } = useTranslation('common');
  const { theme } = useAdminTheme();
  const { changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isDark = theme === 'dark';

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError(t('changePassword.errors.tooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('changePassword.errors.mismatch'));
      return;
    }

    setIsSubmitting(true);
    const result = await changePassword(currentPassword, newPassword);
    setIsSubmitting(false);

    if (result.ok) {
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setError(result.error);
    }
  }

  const inputClass = `w-full px-3.5 py-2.5 pr-10 rounded-lg text-sm outline-none transition-colors border ${
    isDark
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-gray-500'
      : 'bg-white border-[#E5E7EB] text-[#1A1A1A] placeholder-[#9CA3AF] focus:border-[#1A1A1A]'
  }`;
  const labelClass = `block text-xs font-medium mb-1.5 uppercase tracking-wide ${
    isDark ? 'text-gray-400' : 'text-[#6B7280]'
  }`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
      <div
        className={`w-full max-w-sm rounded-xl border shadow-xl overflow-hidden ${
          isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-[#E5E7EB]'
        }`}
      >
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isDark ? 'border-gray-700' : 'border-[#E5E7EB]'
          }`}
        >
          <h2 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>
            {t('changePassword.title')}
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-md transition-colors ${
              isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-[#9CA3AF] hover:bg-[#F3F4F6]'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="p-5">
            <div
              className={`flex items-center gap-2.5 px-4 py-3 rounded-lg mb-4 ${
                isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <p className="text-emerald-600 text-xs">{t('changePassword.success')}</p>
            </div>
            <button
              onClick={onClose}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isDark
                  ? 'bg-white text-gray-900 hover:bg-gray-200'
                  : 'bg-[#1A1A1A] text-white hover:bg-[#2D2D2D]'
              }`}
            >
              {t('changePassword.cancel')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <p className={`text-xs -mt-1 ${isDark ? 'text-gray-400' : 'text-[#6B7280]'}`}>
              {t('changePassword.description')}
            </p>

            <div>
              <label className={labelClass}>{t('changePassword.currentPassword')}</label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>{t('changePassword.newPassword')}</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>{t('changePassword.confirmPassword')}</label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-0.5 ${
                    isDark
                      ? 'text-gray-400 hover:text-white'
                      : 'text-[#9CA3AF] hover:text-[#1A1A1A]'
                  }`}
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg ${
                  isDark ? 'bg-red-500/10' : 'bg-red-50'
                }`}
              >
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-xs">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                  isDark
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                    : 'border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]'
                }`}
              >
                {t('changePassword.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${
                  isDark
                    ? 'bg-white text-gray-900 hover:bg-gray-200'
                    : 'bg-[#1A1A1A] text-white hover:bg-[#2D2D2D]'
                }`}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? t('changePassword.submitting') : t('changePassword.submit')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
