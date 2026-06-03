'use client';

import { useEffect } from 'react';
import { ExternalLink, Shield } from 'lucide-react';
import { useT } from 'next-i18next/client';
import type { ProviderRendererProps } from '../../types';

/**
 * OnePAY redirect renderer.
 *
 * OnePAY is a redirect-only gateway — the user's browser must be
 * navigated to the signed OnePAY paygate URL.
 *
 * Flow:
 *  1. Parent calls POST /payments/onepay/initiate → gets redirectUrl
 *  2. ProviderSession.sessionData.mode = "redirect"
 *  3. This component auto-redirects window.location.href
 */
export function OnepayRenderer({ session, onError, onCancel }: ProviderRendererProps) {
  const { sessionData } = session;

  // Guard: must be redirect mode — report error via effect to avoid calling side-effects during render
  useEffect(() => {
    if (sessionData.mode !== 'redirect') {
      onError('OnePAY renderer received unexpected mode: ' + (sessionData as any).mode);
    }
  }, [sessionData, onError]);

  if (sessionData.mode !== 'redirect') {
    return null;
  }

  return <OnepayRedirect url={sessionData.redirectUrl} onError={onError} onCancel={onCancel} />;
}

function OnepayRedirect({
  url,
  onError,
  onCancel,
}: {
  url: string;
  onError: (err: string) => void;
  onCancel: () => void;
}) {
  const { t } = useT('checkout');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.href = url;
    } else {
      onError('Cannot redirect in server environment');
    }
  }, [url, onError]);

  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <div
        className="size-10 border-2 border-[#E0E0E0] border-t-[#4A7A5A] rounded-full animate-spin"
        aria-hidden
      />
      <div>
        <p className="text-[#1A1A1A] dark:text-white text-sm font-medium mb-1">
          {t('payment.onepay.redirecting')}
        </p>
        <p className="text-[#9A9A9A] dark:text-[#6A6A6A] text-xs max-w-xs">
          {t('payment.onepay.redirectDescription')}
        </p>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <a
          href={url}
          className="inline-flex items-center gap-1.5 text-[#4A7A5A] text-sm hover:underline"
        >
          {t('payment.onepay.redirectManual')}
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
        <button
          type="button"
          onClick={onCancel}
          className="text-[#9A9A9A] dark:text-[#6A6A6A] text-xs hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
        >
          {t('payment.onepay.cancel')}
        </button>
      </div>
      <div className="flex items-center justify-center gap-2 text-[#9A9A9A] dark:text-[#6A6A6A] text-[11px] mt-4">
        <Shield className="size-3.5 text-[#4A7A5A] flex-shrink-0" aria-hidden />
        <span>{t('payment.onepay.securedBy')}</span>
      </div>
    </div>
  );
}
