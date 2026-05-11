'use client';

import { useState, type FormEvent } from 'react';
import { User } from 'lucide-react';
import { useT } from 'next-i18next/client';

import { useCustomerAuth } from '@/features/auth/customer-auth-provider';
import { LinkBase } from '@/components/shared/LinkBase';

type AuthMode = 'login' | 'register';

export default function AccountPage() {
  const { login, logout, register, status, user } = useCustomerAuth();
  const { t } = useT('account');

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('customer@silver14.test');
  const [name, setName] = useState('Demo Customer');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (mode === 'register') {
        await register({ email, name, password });
      } else {
        await login(email, password);
      }
    } catch {
      setError(mode === 'register' ? t('errors.registerFailed') : t('errors.invalidCredentials'));
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'authenticated' && user) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] px-4 py-20">
        <section className="mx-auto max-w-xl bg-white p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-[#F5F5F5]">
              <User className="size-5 text-[#1A1A1A]" />
            </span>

            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#9A9A9A]">
                {t('customerAccount')}
              </p>

              <h1 className="text-2xl text-[#1A1A1A]">{user.name}</h1>
            </div>
          </div>

          <div className="space-y-2 border-y border-[#E8E8E8] py-5 text-sm text-[#5A5A5A]">
            <p>
              {t('email')}: {user.email}
            </p>

            <p>
              {t('role')}: {user.role}
            </p>
          </div>

          <p className="mt-5 text-sm leading-6 text-[#6A6A6A]">{t('accountDescription')}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkBase
              href="/products"
              className="inline-flex flex-1 justify-center bg-[#1A1A1A] px-4 py-3 text-xs uppercase tracking-[0.14em] text-white"
            >
              {t('continueShopping')}
            </LinkBase>

            <button
              className="inline-flex flex-1 justify-center border border-[#1A1A1A] px-4 py-3 text-xs uppercase tracking-[0.14em] text-[#1A1A1A]"
              onClick={logout}
              type="button"
            >
              {t('signOut')}
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-20">
      <section className="mx-auto max-w-md bg-white p-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[#9A9A9A]">Silver14 Nail</p>

        <h1 className="mt-2 text-2xl text-[#1A1A1A]">
          {mode === 'login' ? t('signInTitle') : t('createAccountTitle')}
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#6A6A6A]">{t('guestDescription')}</p>

        <div className="mt-6 grid grid-cols-2 border border-[#E0E0E0] text-xs uppercase tracking-[0.14em]">
          {(['login', 'register'] as const).map((option) => (
            <button
              className={`px-4 py-3 ${
                mode === option ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#6A6A6A]'
              }`}
              key={option}
              onClick={() => setMode(option)}
              type="button"
            >
              {option === 'login' ? t('signIn') : t('register')}
            </button>
          ))}
        </div>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          {mode === 'register' ? (
            <AccountInput label={t('name')} onChange={setName} value={name} autoComplete="name" />
          ) : null}

          <AccountInput
            label={t('email')}
            onChange={setEmail}
            type="email"
            value={email}
            autoComplete="email"
          />

          <AccountInput
            label={t('password')}
            onChange={setPassword}
            type="password"
            value={password}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <button
            className="bg-[#1A1A1A] px-4 py-3 text-xs uppercase tracking-[0.14em] text-white disabled:bg-[#9A9A9A]"
            disabled={submitting || status === 'checking'}
            type="submit"
          >
            {submitting ? t('pleaseWait') : mode === 'login' ? t('signIn') : t('createAccount')}
          </button>
        </form>
      </section>
    </main>
  );
}

function AccountInput({
  autoComplete,
  label,
  onChange,
  type = 'text',
  value,
}: {
  autoComplete?: string;
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-[#5A5A5A]">
      {label}

      <input
        autoComplete={autoComplete}
        className="border border-[#E0E0E0] px-4 py-3 text-sm font-normal text-[#1A1A1A] outline-none focus:border-[#9A9A9A]"
        onChange={(event) => onChange(event.target.value)}
        required
        type={type}
        value={value}
      />
    </label>
  );
}
