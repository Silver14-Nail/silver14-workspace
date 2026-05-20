'use client';

import { useState, type FormEvent } from 'react';
import { useT } from 'next-i18next/client';

import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { LinkBase } from '@/components/shared/LinkBase';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useCustomerAuth();
  const { t } = useT('account');

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      setError(t('errors.forgotPasswordFailed'));
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
            fontSize: '1.45rem',
            fontWeight: 500,
            letterSpacing: '0.03em',
            lineHeight: 1,
            opacity: 0.9,
          }}
        >
          Silver14 Nail
        </p>

        <h1 className="mt-2 text-2xl text-[#1A1A1A]">{t('forgotPasswordTitle')}</h1>

        {sent ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm leading-6 text-[#3A7A3A]">{t('forgotPasswordSent')}</p>
            <LinkBase
              href="/account"
              className="inline-block text-xs uppercase tracking-[0.14em] text-[#1A1A1A] underline-offset-2 hover:underline"
            >
              {t('backToSignIn')}
            </LinkBase>
          </div>
        ) : (
          <>
            <p className="mt-3 text-sm leading-6 text-[#6A6A6A]">
              {t('forgotPasswordDescription')}
            </p>

            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              <label className="grid gap-1.5 text-sm font-medium text-[#5A5A5A]">
                {t('email')}
                <input
                  autoComplete="email"
                  className="border border-[#E0E0E0] px-4 py-3 text-sm font-normal text-[#1A1A1A] outline-none focus:border-[#9A9A9A]"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  value={email}
                />
              </label>

              {error ? <p className="text-sm text-rose-600">{error}</p> : null}

              <button
                className="bg-[#1A1A1A] px-4 py-3 text-xs uppercase tracking-[0.14em] text-white disabled:bg-[#9A9A9A]"
                disabled={submitting}
                type="submit"
              >
                {submitting ? t('pleaseWait') : t('sendResetLink')}
              </button>

              <LinkBase
                href="/account"
                className="text-center text-xs text-[#6A6A6A] underline-offset-2 hover:underline"
              >
                {t('backToSignIn')}
              </LinkBase>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
