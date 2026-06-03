'use client';

import { Shield, ArrowRight, RefreshCw } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useT } from 'next-i18next/client';
import { BackButton } from '../ui/Buttons';
import { PaymentMethodSelector } from '@/features/payment/components/PaymentMethodSelector';
import { ProviderRenderer } from '@/features/payment/components/ProviderRenderer';
import { useCheckoutPayment } from '@/features/payment/hooks/useCheckoutPayment';
import { PAYMENT_METHOD_OPTIONS } from '@/features/payment/payment-options';
import type { PaymentMethodOption } from '@/features/payment/types';

const OPTION_GROUPS: { label: string; ids: string[] }[] = [];

// ── Props ─────────────────────────────────────────────────────────────────────

interface PaymentStepProps {
  /** Checkout session UUID — passed to the payment API and renderers. */
  sessionId: string | null;
  finalTotal: number;
  currency: string;
  onBack: () => void;
  /** Called after payment succeeds and cart is cleared. */
  onSuccess: (orderId: string) => void;
}

// ── PaymentStep ───────────────────────────────────────────────────────────────

/**
 * Payment step — fully provider-agnostic.
 *
 * This component does NOT contain any provider-specific logic.
 * Adding a new payment provider requires ONLY:
 *   1. Adding to PAYMENT_METHOD_OPTIONS (payment-options.ts)
 *   2. Adding a case to createPaymentSession (payment.api.ts)
 *   3. Adding a renderer to RENDERER_MAP (ProviderRenderer.tsx)
 *
 * This file never changes for new providers.
 */
export function PaymentStep({ sessionId, onBack, onSuccess }: PaymentStepProps) {
  const { t } = useT('checkout');
  const params = useParams();
  const lng = (params?.lng as string) ?? 'en';

  // Apply i18n translations to payment options
  const visibleOptions = PAYMENT_METHOD_OPTIONS.map((o) => ({
    ...o,
    label: t(`payment.methods.${o.id}.label`, { defaultValue: o.label }),
    description: t(`payment.methods.${o.id}.description`, { defaultValue: o.description }),
  }));

  const {
    selectedOption,
    setSelectedOption,
    status,
    providerSession,
    error,
    requestSession,
    handleProviderSuccess,
    handleProviderError,
    handleProviderCancel,
    retry,
  } = useCheckoutPayment({ checkoutSessionId: sessionId, onComplete: onSuccess, locale: lng });

  // ── Derived booleans ────────────────────────────────────────────────────────

  const isIdle = status === 'idle';
  const isRequesting = status === 'requesting';
  const isReady = status === 'ready' && !!providerSession;
  const isError = status === 'error' || status === 'failed';
  const showSelector = isIdle || isError;
  const canContinue = !!selectedOption && isIdle;

  return (
    <div className="bg-white dark:bg-[#141414] p-6 sm:p-8">
      <BackButton label="Back to shipping" onClick={onBack} />

      <h2
        className="text-[#1A1A1A] dark:text-white mb-6"
        style={{ fontWeight: 400, fontSize: '1.4rem' }}
      >
        Payment
      </h2>

      {/* ── Method selector ───────────────────────────────────────────────── */}
      {showSelector && (
        <>
          <PaymentMethodSelector
            options={visibleOptions}
            groups={OPTION_GROUPS}
            selected={selectedOption?.id ?? null}
            onChange={(opt: PaymentMethodOption) => setSelectedOption(opt)}
            disabled={isRequesting}
          />

          {/* Error banner */}
          {isError && error && (
            <div className="mt-4 flex items-start gap-2 text-[#DC2626] text-xs p-3 bg-[#FEF2F2] dark:bg-[#2E1A1A]">
              <span className="flex-shrink-0 mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* CTA */}
          <div className="mt-6 space-y-2.5">
            {isError ? (
              <button
                type="button"
                onClick={retry}
                className="w-full flex items-center justify-center gap-2 border border-[#1A1A1A] dark:border-white text-[#1A1A1A] dark:text-white py-4 text-xs uppercase tracking-[0.15em] hover:bg-[#1A1A1A] hover:text-white dark:hover:bg-white dark:hover:text-[#1A1A1A] transition-all"
                style={{ letterSpacing: '0.15em' }}
              >
                <RefreshCw className="size-3.5" aria-hidden />
                Try again
              </button>
            ) : (
              <button
                type="button"
                disabled={!canContinue}
                onClick={requestSession}
                className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] py-4 text-xs uppercase tracking-[0.15em] hover:bg-[#333] dark:hover:bg-[#E0E0E0] transition-colors disabled:bg-[#D0D0D0] dark:disabled:bg-[#3A3A3A] disabled:cursor-not-allowed"
                style={{ letterSpacing: '0.15em' }}
              >
                Continue to payment
                <ArrowRight className="size-4" aria-hidden />
              </button>
            )}
          </div>
        </>
      )}

      {/* ── Loading (session creation in flight) ──────────────────────────── */}
      {isRequesting && (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="size-10 border-2 border-[#E0E0E0] dark:border-[#3A3A3A] border-t-[#4A7A5A] rounded-full animate-spin" />
          <p className="text-[#9A9A9A] dark:text-[#6A6A6A] text-sm">
            Preparing secure payment&hellip;
          </p>
        </div>
      )}

      {/* ── Provider-specific UI ──────────────────────────────────────────── */}
      {isReady && (
        <div className="mt-2">
          {/* Breadcrumb: selected method + change link */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-[#1A1A1A] dark:text-white text-sm font-medium">
              {selectedOption?.label}
            </p>
            <button
              type="button"
              onClick={() => setSelectedOption(null)}
              className="text-[#9A9A9A] dark:text-[#6A6A6A] text-xs hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
            >
              Change
            </button>
          </div>

          <ProviderRenderer
            session={providerSession!}
            onSuccess={handleProviderSuccess}
            onError={handleProviderError}
            onCancel={handleProviderCancel}
          />
        </div>
      )}

      {/* ── Security footer ───────────────────────────────────────────────── */}
      {!isReady && (
        <div className="flex items-center justify-center gap-2 text-[#9A9A9A] dark:text-[#6A6A6A] text-[11px] mt-6">
          <Shield className="size-3.5 text-[#4A7A5A] flex-shrink-0" aria-hidden />
          <span>All transactions are encrypted and processed securely.</span>
        </div>
      )}
    </div>
  );
}
