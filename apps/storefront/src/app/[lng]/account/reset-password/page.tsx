'use client';

import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { useT } from 'next-i18next/client';

import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { LinkBase } from '@/components/shared/LinkBase';

export default function ResetPasswordPage() {
  const { resetPassword } = useCustomerAuth();
  const { t } = useT('account');
  const searchParams = useSearchParams();

  const tokenFromUrl = searchParams.get('token') ?? '';

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError(t('errors.passwordMismatch'));
      return;
    }

    setSubmitting(true);

    try {
      await resetPassword(token, newPassword);
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : t('errors.resetPasswordFailed'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-20">
      <section className="mx-auto max-w-md bg-white p-8">
        <p
          className="text-[#9A9A9A]"
          style={{
            fontFamily: "'Grenze Gotisch', 'Pirata One', cursive",
            fontSize: '1.45rem',
            fontWeight: 500,
            letterSpacing: '0.03em',
            lineHeight: 1,
            opacity: 0.9,
          }}
        >
          Silver14 Nail
        </p>

        <h1 className="mt-2 text-2xl text-[#1A1A1A]">{t('resetPasswordTitle')}</h1>

        {done ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm leading-6 text-[#3A7A3A]">{t('resetPasswordSuccess')}</p>
            <LinkBase
              href="/account"
              className="inline-block bg-[#1A1A1A] px-4 py-3 text-xs uppercase tracking-[0.14em] text-white"
            >
              {t('signIn')}
            </LinkBase>
          </div>
        ) : (
          <>
            <p className="mt-3 text-sm leading-6 text-[#6A6A6A]">
              {t('resetPasswordDescription')}
            </p>

            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              {!tokenFromUrl && (
                <label className="grid gap-1.5 text-sm font-medium text-[#5A5A5A]">
                  {t('resetToken')}
                  <input
                    className="border border-[#E0E0E0] px-4 py-3 text-sm font-normal text-[#1A1A1A] outline-none focus:border-[#9A9A9A]"
                    onChange={(e) => setToken(e.target.value)}
                    required
                    type="text"
                    value={token}
                  />
                </label>
              )}

              <label className="grid gap-1.5 text-sm font-medium text-[#5A5A5A]">
                {t('newPassword')}
                <input
                  autoComplete="new-password"
                  className="border border-[#E0E0E0] px-4 py-3 text-sm font-normal text-[#1A1A1A] outline-none focus:border-[#9A9A9A]"
                  minLength={8}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  type="password"
                  value={newPassword}
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium text-[#5A5A5A]">
                {t('confirmPassword')}
                <input
                  autoComplete="new-password"
                  className="border border-[#E0E0E0] px-4 py-3 text-sm font-normal text-[#1A1A1A] outline-none focus:border-[#9A9A9A]"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  type="password"
                  value={confirmPassword}
                />
              </label>

              {error ? <p className="text-sm text-rose-600">{error}</p> : null}

              <button
                className="bg-[#1A1A1A] px-4 py-3 text-xs uppercase tracking-[0.14em] text-white disabled:bg-[#9A9A9A]"
                disabled={submitting || !token}
                type="submit"
              >
                {submitting ? t('pleaseWait') : t('resetPassword')}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
