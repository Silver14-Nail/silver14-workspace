'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  createAdminTwoFactorSetup,
  enableAdminTwoFactor,
} from './admin-auth.api';
import { useAdminAuth } from './admin-auth-provider';
import type { AdminTwoFactorSetup } from './admin-auth.types';

export function TwoFactorSetupPanel() {
  const { tokens } = useAdminAuth();
  const [setup, setSetup] = useState<AdminTwoFactorSetup | null>(null);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const startSetup = async () => {
    if (!tokens) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      setSetup(await createAdminTwoFactorSetup(tokens.accessToken));
    } catch {
      setMessage('Unable to start two-factor setup.');
    } finally {
      setLoading(false);
    }
  };

  const enableTwoFactor = async () => {
    if (!tokens) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await enableAdminTwoFactor(tokens.accessToken, code);
      setSetup({ enabled: true });
      setCode('');
      setMessage('Two-factor authentication is enabled.');
    } catch {
      setMessage('Invalid authenticator code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-5">
      <div>
        <p className="text-sm leading-6 text-neutral-500">
          Add Silver14 Nail Admin to Google Authenticator or Microsoft
          Authenticator, then enter the 6-digit code to enable 2FA for this
          account.
        </p>
      </div>

      {setup?.enabled ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          Two-factor authentication is enabled for this admin account.
        </div>
      ) : null}

      {setup?.enabled === false ? (
        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          <div className="w-fit max-w-full rounded-md border border-neutral-200 bg-white p-4">
            <QRCodeSVG
              className="h-auto max-w-full"
              size={180}
              value={setup.otpAuthUrl}
            />
          </div>
          <div className="grid content-start gap-4">
            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-neutral-400">
                Manual setup key
              </p>
              <p className="mt-1 break-all text-sm font-medium text-neutral-800">
                {setup.setupKey}
              </p>
            </div>
            <label className="grid gap-1.5 text-sm font-medium text-neutral-700">
              Authenticator code
              <input
                className="w-full max-w-xs rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-normal tracking-[0.3em] text-neutral-950 outline-none focus:border-neutral-600"
                inputMode="numeric"
                maxLength={6}
                onChange={(event) => setCode(event.target.value)}
                value={code}
              />
            </label>
            <button
              className="w-full rounded-md bg-neutral-950 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400 sm:w-fit"
              disabled={loading || code.replace(/\s/g, '').length !== 6}
              onClick={enableTwoFactor}
              type="button"
            >
              Verify and enable
            </button>
          </div>
        </div>
      ) : null}

      {!setup ? (
        <button
          className="w-full rounded-md bg-neutral-950 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400 sm:w-fit"
          disabled={loading || !tokens}
          onClick={startSetup}
          type="button"
        >
          Set up two-factor authentication
        </button>
      ) : null}

      {message ? <p className="text-sm text-neutral-600">{message}</p> : null}
    </div>
  );
}
