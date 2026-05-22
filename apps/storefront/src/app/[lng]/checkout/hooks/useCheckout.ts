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
      /* 404 = not yet created, keep polling */
    }
  }
  return null;
}

export function useCheckout() {
  const queryClient = useQueryClient();
  const { cartId, items, subtotal, clearCart } = useCart();
  const selectedCurrency = useAppSelector((s) => s.currency.code);

  const [sessionId, setSessionId] = useState<string | null>(getCheckoutSessionId);
  const [step, setStep] = useState<'contact' | 'shipping' | 'payment' | 'confirmation'>('contact');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmFirstName, setConfirmFirstName] = useState('');
  const [confirmPhone, setConfirmPhone] = useState('');

  // Contact defaults — updated on session restore so the form can reset with pre-filled data
  const [contactDefaults, setContactDefaults] = useState<ContactFormData>(DEFAULT_CONTACT);

  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');

  // ── Server state ──────────────────────────────────────────────────────────

  const { data: session } = useQuery<CheckoutSession | null>({
    queryKey: ['checkout-session', sessionId],
    queryFn: () =>
      sessionId ? checkoutApi.getSession(sessionId, getToken()) : Promise.resolve(null),
    enabled: !!sessionId,
    staleTime: 60_000,
    retry: false,
  });

  const { data: shippingMethods = [] } = useQuery<ShippingMethod[]>({
    queryKey: ['shipping-methods'],
    queryFn: () => checkoutApi.getShippingMethods(getToken()),
    staleTime: 10 * 60 * 1000,
  });

  // ── Session lifecycle ─────────────────────────────────────────────────────

  const initSession = useCallback(async () => {
    if (sessionId || !cartId) return;
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to start checkout');
    }
  }, [cartId, sessionId, selectedCurrency, queryClient]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  // Auto-select first shipping method once loaded
  useEffect(() => {
    if (shippingMethods.length > 0 && !selectedMethodId) {
      setSelectedMethodId(shippingMethods[0].id);
    }
  }, [shippingMethods, selectedMethodId]);

  // Restore step + form defaults from a resumed session
  useEffect(() => {
    if (!session) return;

    if (session.status === 'EXPIRED' || session.status === 'ABANDONED') {
      clearCheckoutSessionId();
      setSessionId(null);
      setError('Your checkout session has expired. Please start again.');
      return;
    }
    if (session.status === 'COMPLETED') {
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
      if (!sessionId) return;
      setIsSubmitting(true);
      setError(null);
      try {
        await checkoutApi.updateContact(sessionId, data, getToken());
        setConfirmEmail(data.email);
        setConfirmPhone(data.phone);
        const [first = ''] = data.fullName.split(' ');
        setConfirmFirstName(first);
        queryClient.invalidateQueries({ queryKey: ['checkout-session', sessionId] });
        setStep('shipping');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to save contact info');
      } finally {
        setIsSubmitting(false);
      }
    },
    [sessionId, queryClient],
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
          // Show confirmation immediately — don't make user wait for webhook
          const capturedSessionId = sessionId;
          await clearCart();
          clearCheckoutSessionId();
          setSessionId(null);
          setStep('confirmation');
          // Poll for order ID in background; update when ready
          pollForOrder(capturedSessionId!, getToken()).then((id) => {
            if (id) setCompletedOrderId(id);
          });
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Payment failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [sessionId, clearCart],
  );

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
  // Use session currency (authoritative — set from Redux at session creation time).
  // Fall back to 'USD' before a session exists so SSR and the first client render match.
  const currency = totals?.currency ?? 'USD';
  const finalTotal = totals?.total ?? subtotal + (shippingCost ?? 0);

  return {
    // State
    step,
    session,
    sessionId,
    isSubmitting,
    error,
    completedOrderId,
    confirmEmail,
    confirmFirstName,
    confirmPhone,
    // Form defaults (for RHF initialization + session restore reset)
    contactDefaults,
    // Shipping method (outside RHF form)
    selectedMethodId,
    shippingMethods,
    // Payment
    paymentMethod,
    // Cart / totals
    cartItems: items,
    subtotal,
    discountAmount,
    shippingCost,
    finalTotal,
    currency,
    // Setters
    setStep,
    setPaymentMethod,
    setSelectedMethodId,
    // Handlers
    handleContactNext,
    handleShippingNext,
    handleStripeConfirm,
    handlePaypalCreate,
    handlePaypalCapture,
    handleApplyCoupon,
    handleRemoveCoupon,
  };
}
