'use client';

import { useState, useEffect, useRef } from 'react';
import { Shield, CreditCard, ExternalLink } from 'lucide-react';
import { checkoutApi } from '@/features/checkout/checkout.api';
import {
  getStoredCustomerTokens,
  isAccessTokenExpired,
} from '@/features/auth/customer-auth.storage';
import type { ProviderRendererProps } from '../../types';

// ── Airwallex SDK type stubs ──────────────────────────────────────────────────

interface AirwallexSDK {
  init: (opts: { env: string; origin: string; locale?: string }) => Promise<void>;
  createElement: (
    type: 'card' | 'dropIn' | 'applePay' | 'googlePay',
    opts: { intent_id: string; client_secret: string; currency: string },
  ) => AirwallexElement;
  confirmPaymentIntent: (opts: {
    element: AirwallexElement;
    id: string;
    client_secret: string;
  }) => Promise<{ id: string; status: string }>;
  destroyElement: (type: string) => void;
}

interface AirwallexElement {
  mount: (selector: string) => void;
  on: (event: string, handler: (e: unknown) => void) => void;
  destroy: () => void;
}

declare global {
  interface Window {
    Airwallex?: AirwallexSDK;
  }
}

const AIRWALLEX_ENV =
  (process.env.NEXT_PUBLIC_AIRWALLEX_ENV as 'demo' | 'prod' | undefined) ?? 'demo';

const SDK_URLS: Record<string, string> = {
  demo: 'https://checkout-demo.airwallex.com/assets/elements.bundle.min.js',
  staging: 'https://checkout-staging.airwallex.com/assets/elements.bundle.min.js',
  prod: 'https://checkout.airwallex.com/assets/elements.bundle.min.js',
};

function sdkUrl(): string {
  return SDK_URLS[AIRWALLEX_ENV] ?? SDK_URLS['demo'];
}

// ── Auth token helper ─────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  const tokens = getStoredCustomerTokens();
  return tokens && !isAccessTokenExpired(tokens) ? tokens.accessToken : null;
}

// ── SDK loader ────────────────────────────────────────────────────────────────

let sdkLoaded = false;
async function loadAirwallexSdk(): Promise<AirwallexSDK> {
  if (window.Airwallex) return window.Airwallex;
  if (sdkLoaded) {
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 200));
      if (window.Airwallex) return window.Airwallex;
    }
    throw new Error('Airwallex SDK did not initialise in time');
  }

  sdkLoaded = true;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = sdkUrl();
    script.async = true;
    script.onload = async () => {
      if (!window.Airwallex) return reject(new Error('Airwallex SDK not found after load'));
      await window.Airwallex.init({ env: AIRWALLEX_ENV, origin: window.location.origin });
      resolve(window.Airwallex);
    };
    script.onerror = () => reject(new Error('Failed to load Airwallex SDK'));
    document.head.appendChild(script);
  });
}

// ── Status states ─────────────────────────────────────────────────────────────

type AirwallexStatus = 'loading' | 'ready' | 'processing' | 'succeeded' | 'error';

// ── Redirection handler for hosted checkout ───────────────────────────────────

function AirwallexHostedRedirect(hostedUrl: string, onError: (err: string) => void) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.href = hostedUrl;
    } else {
      onError('Cannot redirect in server environment');
    }
  }, [hostedUrl, onError]);

  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <span
        className="size-6 border-2 border-[#D0D0D0] border-t-[#4A7A5A] rounded-full animate-spin"
        aria-hidden
      />
      <p className="text-[#9A9A9A] dark:text-[#6A6A6A] text-sm">
        Redirecting to Airwallex hosted checkout…
      </p>
    </div>
  );
}

// ── Main renderer ─────────────────────────────────────────────────────────────

/**
 * Airwallex Elements renderer supporting:
 *   - `client_sdk` mode: embedded Card / Apple Pay / Google Pay elements
 *   - `hosted` mode: redirect to Airwallex hosted checkout
 *
 * After SDK payment confirmation, calls the backend verify endpoint
 * to create the order, then fires `onSuccess(orderId)`.
 *
 * Requirements:
 *   - NEXT_PUBLIC_AIRWALLEX_ENV = 'demo' | 'staging' | 'prod'
 *   - Backend: POST /client-api/payments/airwallex/payment-intent
 *              POST /client-api/payments/airwallex/checkout-session
 */
export function AirwallexRenderer({
  session,
  onSuccess,
  onError,
  onCancel,
}: ProviderRendererProps) {
  const { sessionData, checkoutSessionId } = session;

  // ── Hosted checkout: redirect immediately ──────────────────────────────────
  if (sessionData.mode === 'hosted') {
    return AirwallexHostedRedirect(sessionData.hostedUrl, onError);
  }

  // ── Client SDK mode ───────────────────────────────────────────────────────
  const { providerRef: intentId, clientSecret, amount, currency } = sessionData;

  const [status, setStatus] = useState<AirwallexStatus>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const elementRef = useRef<AirwallexElement | null>(null);
  const sdkRef = useRef<AirwallexSDK | null>(null);
  const mountId = 'airwallex-card-mount';

  useEffect(() => {
    let unmounted = false;

    loadAirwallexSdk()
      .then((sdk) => {
        if (unmounted) return;
        sdkRef.current = sdk;

        const el = sdk.createElement('card', {
          intent_id: intentId,
          client_secret: clientSecret,
          currency,
        });
        elementRef.current = el;
        el.mount(`#${mountId}`);

        el.on('ready', () => {
          if (!unmounted) setStatus('ready');
        });
        el.on('error', (e: unknown) => {
          if (!unmounted) {
            const msg = (e as { message?: string })?.message ?? 'Card element error';
            setErrorMsg(msg);
            setStatus('error');
          }
        });
      })
      .catch((err: Error) => {
        if (!unmounted) {
          setErrorMsg(err.message);
          setStatus('error');
        }
      });

    return () => {
      unmounted = true;
      elementRef.current?.destroy();
      sdkRef.current?.destroyElement('card');
    };
  }, []);

  const handleConfirm = async () => {
    if (!sdkRef.current || !elementRef.current || isProcessing) return;
    setIsProcessing(true);
    setErrorMsg(null);
    setStatus('processing');

    try {
      const result = await sdkRef.current.confirmPaymentIntent({
        element: elementRef.current,
        id: intentId,
        client_secret: clientSecret,
      });

      if (result.status === 'SUCCEEDED') {
        setStatus('succeeded');
        // Call backend to create the order
        try {
          const verifyRes = await checkoutApi.verifyAirwallexPayment(
            intentId,
            checkoutSessionId,
            getToken(),
          );
          onSuccess(verifyRes.orderId);
        } catch {
          // Fallback: Airwallex webhook will create the order.
          // Notify success optimistically so the user sees confirmation.
          onSuccess(intentId);
        }
      } else {
        setErrorMsg(`Payment status: ${result.status}`);
        setStatus('ready');
        setIsProcessing(false);
      }
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Payment failed');
      setStatus('ready');
      setIsProcessing(false);
    }
  };

  const formattedAmount =
    amount != null
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency || 'USD',
        }).format(amount)
      : null;

  return (
    <div className="space-y-4">
      {/* Card element mount point */}
      <div
        id={mountId}
        className={`min-h-[180px] border border-[#E0E0E0] dark:border-[#2A2A2A] bg-[#FAFAFA] dark:bg-[#1A1A1A] p-4 transition-opacity ${
          status === 'loading' ? 'opacity-0' : 'opacity-100'
        }`}
        aria-label="Card details form"
      />

      {status === 'loading' && (
        <div className="flex items-center gap-2 text-[#9A9A9A] dark:text-[#6A6A6A] text-sm py-2">
          <span
            className="size-4 border-2 border-[#D0D0D0] border-t-[#4A7A5A] rounded-full animate-spin"
            aria-hidden
          />
          Loading secure payment form…
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-start gap-2 text-[#DC2626] text-xs p-3 bg-[#FEF2F2] dark:bg-[#2E1A1A]">
          <Shield className="size-4 flex-shrink-0 mt-0.5" aria-hidden />
          <span>
            {errorMsg || 'Could not load the payment form.'}{' '}
            <a
              href="https://www.airwallex.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline inline-flex items-center gap-0.5"
            >
              Airwallex status <ExternalLink className="size-3" />
            </a>
          </span>
        </div>
      )}

      {errorMsg && status !== 'error' && <p className="text-[#DC2626] text-xs px-1">{errorMsg}</p>}

      {/* Security notice */}
      <div className="flex items-center gap-2 text-[#9A9A9A] dark:text-[#6A6A6A] text-xs">
        <Shield className="size-3.5 text-[#4A7A5A] flex-shrink-0" aria-hidden />
        <span>256-bit SSL encryption · Secured by Airwallex</span>
      </div>

      {/* Actions */}
      {status !== 'error' && status !== 'succeeded' && (
        <div className="flex flex-col gap-2.5 pt-1">
          <button
            type="button"
            disabled={status !== 'ready' || isProcessing}
            onClick={handleConfirm}
            className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] py-4 text-xs uppercase tracking-[0.15em] hover:bg-[#333] dark:hover:bg-[#E0E0E0] transition-colors disabled:bg-[#9A9A9A] disabled:cursor-not-allowed"
            style={{ letterSpacing: '0.15em' }}
          >
            {isProcessing ? (
              <>
                <span className="size-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <CreditCard className="size-4" aria-hidden />
                Pay {formattedAmount ?? ''}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="text-[#9A9A9A] dark:text-[#6A6A6A] text-xs hover:text-[#1A1A1A] dark:hover:text-white transition-colors disabled:opacity-30"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
