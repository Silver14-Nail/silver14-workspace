'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Stripe, StripeCardElement } from '@stripe/stripe-js';
import { useCart } from '@/hooks/useCart';
import { useAppSelector } from '@/store/hooks';
import {
  getStoredCustomerTokens,
  isAccessTokenExpired,
} from '@/features/auth/customer-auth.storage';
import { checkoutApi } from '@/features/checkout/checkout.api';
import {
  getCheckoutSessionId,
  setCheckoutSessionId,
  clearCheckoutSessionId,
  getPendingCoupon,
  clearPendingCoupon,
} from '@/features/checkout/checkout.storage';
import type { CheckoutSession, ShippingMethod } from '@/features/checkout/checkout.types';
import type { PaymentMethod } from '../types';
import type { ContactFormData, ShippingFormData } from '../schemas';
import { DEFAULT_CONTACT } from '../constants';

function getToken(): string | null {
  const tokens = getStoredCustomerTokens();
  return tokens && !isAccessTokenExpired(tokens) ? tokens.accessToken : null;
}

async function pollForOrder(
  sessionId: string,
  token: string | null,
  attempts = 12,
  intervalMs = 3000,
): Promise<string | null> {
  for (let i = 0; i < attempts; i++) {
    await new Promise<void>((r) => setTimeout(r, intervalMs));
    try {
      const order = await checkoutApi.getSessionOrder(sessionId, token);
      if (order?.id) return order.id;
    } catch {
      /* getSessionOrder returns 200 with null (not a 404) while order is not yet created */
    }
  }
  return null;
}

export function useCheckout() {
  const queryClient = useQueryClient();
  const { cartId, items, subtotal: cartSubtotal, clearCart } = useCart();
  const selectedCurrency = useAppSelector((s) => s.currency.code);
  const { user } = useAppSelector((s) => s.auth);

  const [wasStoredSession] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!getToken() && !!getCheckoutSessionId();
  });
  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    if (getToken()) return getCheckoutSessionId();
    // Do NOT clear here — the ?payment=success useEffect must read it first for guest LS redirects
    return null;
  });
  const [step, setStep] = useState<'contact' | 'shipping' | 'payment' | 'confirmation'>('contact');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
  const [orderPollingDone, setOrderPollingDone] = useState(false);
  const [isLsPayment, setIsLsPayment] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmFirstName, setConfirmFirstName] = useState('');
  const [confirmPhone, setConfirmPhone] = useState('');

  const [contactDefaults, setContactDefaults] = useState<ContactFormData>(DEFAULT_CONTACT);

  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('lemon_squeezy');

  // ── Server state ──────────────────────────────────────────────────────────

  const { data: session, isPending: isSessionPending } = useQuery<CheckoutSession | null>({
    queryKey: ['checkout-session', sessionId],
    queryFn: () =>
      sessionId ? checkoutApi.getSession(sessionId, getToken()) : Promise.resolve(null),
    enabled: !!sessionId,
    staleTime: 60_000,
    retry: false,
  });

  const isSessionLoading = wasStoredSession && !!sessionId && isSessionPending;

  const { data: shippingMethods = [] } = useQuery<ShippingMethod[]>({
    queryKey: ['shipping-methods'],
    queryFn: () => checkoutApi.getShippingMethods(getToken()),
    staleTime: 10 * 60 * 1000,
  });

  // ── Post-redirect: detect return from Lemon Squeezy ──────────────────────

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);

    if (params.get('payment') !== 'success') {
      // Clean up stale guest session on normal checkout load
      if (!getToken()) clearCheckoutSessionId();
      return;
    }

    window.history.replaceState({}, '', window.location.pathname);

    // Restore contact info saved before navigating to LS (survives page reload)
    try {
      const saved = sessionStorage.getItem('__checkout_contact');
      if (saved) {
        const { email, phone, firstName } = JSON.parse(saved) as {
          email: string;
          phone: string;
          firstName: string;
        };
        setConfirmEmail(email);
        setConfirmPhone(phone);
        setConfirmFirstName(firstName);
        sessionStorage.removeItem('__checkout_contact');
      }
    } catch {}

    setIsLsPayment(true);
    setStep('confirmation');
    // LS sends their own confirmation email — show confirmation immediately, don't block on our internal order ID
    setOrderPollingDone(true);

    const storedSessionId = getCheckoutSessionId();
    clearCheckoutSessionId();
    setSessionId(null);

    // Clear cart — page reloaded so clearCart must fire-and-forget here
    clearCart().catch(() => {});

    if (storedSessionId) {
      const token = getToken();
      // Poll silently in background to get our internal order reference (for tracking)
      pollForOrder(storedSessionId, token).then((id) => {
        if (id) setCompletedOrderId(id);
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Session lifecycle ─────────────────────────────────────────────────────

  const ensureSession = useCallback(async (): Promise<string | null> => {
    if (sessionId) return sessionId;
    if (!cartId) return null;
    try {
      const s = await checkoutApi.createSession(cartId, getToken(), selectedCurrency);
      setCheckoutSessionId(s.id);
      setSessionId(s.id);

      const pending = getPendingCoupon();
      if (pending?.code) {
        try {
          const updated = await checkoutApi.applyCoupon(s.id, pending.code, getToken());
          queryClient.setQueryData(['checkout-session', s.id], updated);
        } catch {
          // ignore — coupon may have expired
        }
        clearPendingCoupon();
      }
      return s.id;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to start checkout');
      return null;
    }
  }, [cartId, sessionId, selectedCurrency, queryClient]);

  useEffect(() => {
    if (!getToken()) return;
    ensureSession();
  }, [ensureSession]);

  useEffect(() => {
    if (shippingMethods.length > 0 && !selectedMethodId) {
      setSelectedMethodId(shippingMethods[0].id);
    }
  }, [shippingMethods, selectedMethodId]);

  useEffect(() => {
    if (!user) return;
    setContactDefaults((prev) => {
      if (prev.email) return prev;
      return { email: user.email, fullName: user.name, phone: '' };
    });
  }, [user]);

  useEffect(() => {
    if (!session) return;

    if (session.status === 'expired' || session.status === 'abandoned') {
      clearCheckoutSessionId();
      setSessionId(null);
      setError('Your checkout session has expired. Please start again.');
      return;
    }
    if (session.status === 'completed') {
      setStep('confirmation');
      return;
    }

    if (session.contactSnapshot) {
      const snap = session.contactSnapshot;
      setContactDefaults({ email: snap.email, phone: snap.phone, fullName: snap.fullName });
      setConfirmEmail(snap.email);
      setConfirmPhone(snap.phone);
      const [first = ''] = snap.fullName.split(' ');
      setConfirmFirstName(first);
    }

    if (session.shippingSnapshot?.shippingMethodId) {
      setSelectedMethodId(session.shippingSnapshot.shippingMethodId);
    }

    if (session.currentStep >= 3 && step === 'contact') setStep('payment');
    else if (session.currentStep >= 2 && step === 'contact') setStep('shipping');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id]);

  // ── Step: Contact ─────────────────────────────────────────────────────────

  const handleContactNext = useCallback(
    async (data: ContactFormData) => {
      const sid = sessionId ?? (await ensureSession());
      if (!sid) return;

      setIsSubmitting(true);
      setError(null);
      try {
        await checkoutApi.updateContact(sid, data, getToken());
        setConfirmEmail(data.email);
        setConfirmPhone(data.phone);
        const [first = ''] = data.fullName.split(' ');
        setConfirmFirstName(first);
        // Persist so LS redirect can restore after page reload
        try {
          sessionStorage.setItem(
            '__checkout_contact',
            JSON.stringify({ email: data.email, phone: data.phone, firstName: first }),
          );
        } catch {}
        queryClient.invalidateQueries({ queryKey: ['checkout-session', sid] });
        setStep('shipping');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to save contact info');
      } finally {
        setIsSubmitting(false);
      }
    },
    [sessionId, ensureSession, queryClient],
  );

  // ── Step: Shipping ────────────────────────────────────────────────────────

  const handleShippingNext = useCallback(
    async (data: ShippingFormData) => {
      if (!sessionId) return;
      setIsSubmitting(true);
      setError(null);
      try {
        const recipientName = `${data.firstName} ${data.lastName}`.trim();
        const street = data.apartment ? `${data.address}, ${data.apartment}` : data.address;

        await checkoutApi.updateShipping(
          sessionId,
          {
            ...(selectedMethodId ? { shippingMethodId: selectedMethodId } : {}),
            recipientName,
            street,
            city: data.city,
            country: data.country,
            postalCode: data.postalCode || undefined,
          },
          getToken(),
        );
        queryClient.invalidateQueries({ queryKey: ['checkout-session', sessionId] });
        setStep('payment');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to save shipping info');
      } finally {
        setIsSubmitting(false);
      }
    },
    [sessionId, selectedMethodId, queryClient],
  );

  // ── Payment: Stripe card ──────────────────────────────────────────────────

  const handleStripeConfirm = useCallback(
    async (stripe: Stripe, cardElement: StripeCardElement) => {
      if (!sessionId) return;
      setIsSubmitting(true);
      setError(null);
      try {
        const { clientSecret } = await checkoutApi.initiateStripe(sessionId, getToken());

        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: { card: cardElement } },
        );

        if (stripeError) throw new Error(stripeError.message ?? 'Card payment failed');

        if (paymentIntent?.status === 'succeeded') {
          const capturedSessionId = sessionId;
          const capturedToken = getToken();
          clearCheckoutSessionId();
          setSessionId(null);
          setStep('confirmation');

          try {
            const result = await checkoutApi.confirmStripePayment(
              paymentIntent.id,
              capturedSessionId!,
              capturedToken,
            );
            setCompletedOrderId(result.orderId);
            await clearCart();
            setOrderPollingDone(true);
          } catch {
            await clearCart();
            // Fallback: poll in case order was already created by a webhook.
            // Only mark polling done after the poll resolves — not before.
            pollForOrder(capturedSessionId!, capturedToken).then((id) => {
              if (id) setCompletedOrderId(id);
              setOrderPollingDone(true);
            });
          }
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Payment failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [sessionId, clearCart],
  );

  // ── Payment: Lemon Squeezy ────────────────────────────────────────────────

  const handleLsCheckout = useCallback(async () => {
    if (!sessionId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const redirectUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}${window.location.pathname}?payment=success`
          : '';

      const { checkoutUrl } = await checkoutApi.initiateLsCheckout(
        sessionId,
        redirectUrl,
        getToken(),
      );

      window.location.href = checkoutUrl;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to initiate checkout. Please try again.');
      setIsSubmitting(false);
    }
    // isSubmitting stays true — page is navigating away
  }, [sessionId]);

  // ── Payment: PayPal ───────────────────────────────────────────────────────

  const handlePaypalCreate = useCallback(async (): Promise<string> => {
    if (!sessionId) throw new Error('No active checkout session');
    const { paypalOrderId } = await checkoutApi.createPaypalOrder(sessionId, getToken());
    return paypalOrderId;
  }, [sessionId]);

  const handlePaypalCapture = useCallback(
    async (paypalOrderId: string) => {
      if (!sessionId) return;
      setIsSubmitting(true);
      setError(null);
      try {
        const result = await checkoutApi.capturePaypalOrder(paypalOrderId, sessionId, getToken());
        setCompletedOrderId(result.order.id);
        await clearCart();
        clearCheckoutSessionId();
        setSessionId(null);
        setOrderPollingDone(true);
        setStep('confirmation');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'PayPal payment failed');
      } finally {
        setIsSubmitting(false);
      }
    },
    [sessionId, clearCart],
  );

  // ── Coupon ────────────────────────────────────────────────────────────────

  const handleApplyCoupon = useCallback(
    async (code: string) => {
      if (!sessionId) return;
      const updated = await checkoutApi.applyCoupon(sessionId, code, getToken());
      queryClient.setQueryData(['checkout-session', sessionId], updated);
    },
    [sessionId, queryClient],
  );

  const handleRemoveCoupon = useCallback(async () => {
    if (!sessionId) return;
    const updated = await checkoutApi.removeCoupon(sessionId, getToken());
    queryClient.setQueryData(['checkout-session', sessionId], updated);
  }, [sessionId, queryClient]);

  // ── Derived state ─────────────────────────────────────────────────────────

  const totals = session?.totals ?? null;
  const shippingCost: number | null = totals?.shippingFee ?? null;
  const discountAmount = totals?.discountAmount ?? 0;
  const currency = totals?.currency ?? 'USD';
  const subtotal = totals?.subtotal ?? cartSubtotal;
  const finalTotal = totals?.total ?? cartSubtotal + (shippingCost ?? 0);

  return {
    step,
    session,
    sessionId,
    isSessionLoading,
    isSubmitting,
    error,
    completedOrderId,
    orderPollingDone,
    isLsPayment,
    confirmEmail,
    confirmFirstName,
    confirmPhone,
    contactDefaults,
    selectedMethodId,
    shippingMethods,
    paymentMethod,
    cartItems: items,
    subtotal,
    discountAmount,
    shippingCost,
    finalTotal,
    currency,
    setStep,
    setPaymentMethod,
    setSelectedMethodId,
    handleContactNext,
    handleShippingNext,
    handleStripeConfirm,
    handleLsCheckout,
    handlePaypalCreate,
    handlePaypalCapture,
    handleApplyCoupon,
    handleRemoveCoupon,
  };
}
