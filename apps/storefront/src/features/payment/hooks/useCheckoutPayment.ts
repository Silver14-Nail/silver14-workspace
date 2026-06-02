'use client';

import { useState, useCallback } from 'react';
import { useCart } from '@/hooks/useCart';
import { clearCheckoutSessionId } from '@/features/checkout/checkout.storage';
import {
  getStoredCustomerTokens,
  isAccessTokenExpired,
} from '@/features/auth/customer-auth.storage';
import { createPaymentSession } from '../payment.api';
import type { PaymentMethodOption, ProviderSession, PaymentFlowStatus } from '../types';

function getToken(): string | null {
  const tokens = getStoredCustomerTokens();
  return tokens && !isAccessTokenExpired(tokens) ? tokens.accessToken : null;
}

interface UseCheckoutPaymentOptions {
  checkoutSessionId: string | null;
  /**
   * Called after payment succeeds AND cart / session storage are cleared.
   * The parent (useCheckout) navigates to the confirmation step here.
   */
  onComplete: (orderId: string) => void;
}

export interface UseCheckoutPaymentReturn {
  // ── Selection ────────────────────────────────────────────────────────────────
  selectedOption: PaymentMethodOption | null;
  /** Changing the selection resets providerSession and status back to idle. */
  setSelectedOption: (option: PaymentMethodOption | null) => void;

  // ── Status ───────────────────────────────────────────────────────────────────
  status: PaymentFlowStatus;
  providerSession: ProviderSession | null;
  error: string | null;

  // ── Actions (called by PaymentStep / renderers) ───────────────────────────
  /**
   * Creates the provider session. PaymentStep calls this when the user
   * clicks "Continue to payment".
   */
  requestSession: () => Promise<void>;

  /**
   * Called by the active renderer when payment is confirmed.
   * Clears cart and session storage, then fires onComplete(orderId).
   */
  handleProviderSuccess: (orderId: string) => Promise<void>;

  handleProviderError: (err: string) => void;
  handleProviderCancel: () => void;
  retry: () => void;
}

/**
 * Manages option selection and the provider session lifecycle.
 *
 * Design contract — to add a new provider, ONLY these files change:
 *   1. PAYMENT_METHOD_OPTIONS (payment-options.ts) — add the option
 *   2. createPaymentSession (payment.api.ts) — add the backend call
 *   3. RENDERER_MAP (ProviderRenderer.tsx) — add the UI component
 *
 * This hook, PaymentStep, useCheckout, and page.tsx require zero changes.
 */
export function useCheckoutPayment({
  checkoutSessionId,
  onComplete,
}: UseCheckoutPaymentOptions): UseCheckoutPaymentReturn {
  const { clearCart } = useCart();

  const [selectedOption, setSelectedOptionRaw] = useState<PaymentMethodOption | null>(null);
  const [status, setStatus] = useState<PaymentFlowStatus>('idle');
  const [providerSession, setProviderSession] = useState<ProviderSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Selection ─────────────────────────────────────────────────────────────────

  const setSelectedOption = useCallback((option: PaymentMethodOption | null) => {
    setSelectedOptionRaw(option);
    setProviderSession(null);
    setStatus('idle');
    setError(null);
  }, []);

  // ── Session creation ──────────────────────────────────────────────────────────

  const requestSession = useCallback(async () => {
    if (!selectedOption || !checkoutSessionId) return;
    if (status === 'requesting' || status === 'ready') return; // already in-flight or done

    setStatus('requesting');
    setError(null);

    try {
      const session = await createPaymentSession(selectedOption.provider, checkoutSessionId, {
        paymentMethod: selectedOption.paymentMethod,
        preferredMode: selectedOption.preferredMode,
        token: getToken(),
      });
      setProviderSession(session);
      setStatus('ready');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to start payment session';
      setError(msg);
      setStatus('error');
    }
  }, [selectedOption, checkoutSessionId, status]);

  // ── Provider callbacks ─────────────────────────────────────────────────────────

  const handleProviderSuccess = useCallback(
    async (orderId: string) => {
      setStatus('success');
      clearCheckoutSessionId();
      try {
        await clearCart();
      } catch {
        // Non-fatal: cart may already be empty or stale
      }
      onComplete(orderId);
    },
    [clearCart, onComplete],
  );

  const handleProviderError = useCallback((err: string) => {
    setError(err);
    setStatus('failed');
  }, []);

  const handleProviderCancel = useCallback(() => {
    // Reset back to option selection — let the user try again or pick a different method
    setProviderSession(null);
    setStatus('idle');
    setError(null);
  }, []);

  const retry = useCallback(() => {
    setProviderSession(null);
    setStatus('idle');
    setError(null);
  }, []);

  return {
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
  };
}
