'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useAdminAuth } from '@/features/admin/auth/admin-auth-provider';
import type { AdminTwoFactorChallenge } from '@/features/admin/auth/admin-auth.types';
import { useAdminTranslation } from '@/features/admin/i18n/admin-i18n-provider';

export default function LoginPage() {
  const { login, status, verifyTwoFactor } = useAdminAuth();
  const { t } = useAdminTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('owner@silver14.test');
  const [password, setPassword] = useState('password123');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorChallenge, setTwoFactorChallenge] =
    useState<AdminTwoFactorChallenge | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await login(email, password);

      if ('twoFactorRequired' in response) {
        setTwoFactorChallenge(response);
        return;
      }

      router.replace('/');
    } catch {
      setError(t('login.invalidCredentials'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleTwoFactorSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!twoFactorChallenge) {
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await verifyTwoFactor(twoFactorChallenge.challengeId, twoFactorCode);
      router.replace('/');
    } catch {
      setError(t('login.invalidTwoFactorCode'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f6f3] px-5 text-neutral-950">
      <section className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">{t('common.brand')}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {twoFactorChallenge ? t('login.twoFactorTitle') : t('login.title')}
        </h1>
        <p className="mt-2 text-sm leading-6 text-neutral-500">
          {twoFactorChallenge ? t('login.twoFactorDescription') : t('login.description')}
        </p>
        {twoFactorChallenge ? (
          <form className="mt-6 grid gap-4" onSubmit={handleTwoFactorSubmit}>
            <label className="grid gap-1.5 text-sm font-medium text-neutral-700">
              {t('form.twoFactorCode')}
              <input
                autoComplete="one-time-code"
                className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-normal tracking-[0.3em] text-neutral-950 outline-none focus:border-neutral-600"
                inputMode="numeric"
                maxLength={6}
                onChange={(event) => setTwoFactorCode(event.target.value)}
                value={twoFactorCode}
              />
            </label>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            <button
              className="rounded-md bg-neutral-950 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
              disabled={
                submitting ||
                status === 'checking' ||
                twoFactorCode.replace(/\s/g, '').length !== 6
              }
              type="submit"
            >
              {submitting ? t('login.verifyingTwoFactor') : t('action.verifyTwoFactor')}
            </button>
            <button
              className="text-sm font-medium text-neutral-500 hover:text-neutral-950"
              onClick={() => {
                setTwoFactorChallenge(null);
                setTwoFactorCode('');
                setError('');
              }}
              type="button"
            >
              {t('action.backToPassword')}
            </button>
          </form>
        ) : (
          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-1.5 text-sm font-medium text-neutral-700">
            {t('form.email')}
            <input
              className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-normal text-neutral-950 outline-none focus:border-neutral-600"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-neutral-700">
            {t('form.password')}
            <input
              className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-normal text-neutral-950 outline-none focus:border-neutral-600"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </label>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <button
            className="rounded-md bg-neutral-950 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
            disabled={submitting || status === 'checking'}
            type="submit"
          >
            {submitting ? t('login.signingIn') : t('action.signIn')}
          </button>
          </form>
        )}
      </section>
    </main>
  );
}
