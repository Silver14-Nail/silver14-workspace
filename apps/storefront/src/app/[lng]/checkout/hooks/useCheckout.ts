'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Stripe, StripeCardElement } from '@stripe/stripe-js';
import { useCart } from '@/hooks/useCart';
import {
  getStoredCustomerTokens,
  isAccessTokenExpired,
} from '@/features/auth/customer-auth.storage';
import { checkoutApi } from '@/features/checkout/checkout.api';
import {
  getCheckoutSessionId,
  setCheckoutSessionId,
  clearCheckoutSessionId,
} from '@/features/checkout/checkout.storage';
import type { CheckoutSession, ShippingMethod } from '@/features/checkout/checkout.types';
import type { Step, ContactDetails, ShippingDetails, PaymentMethod } from '../types';
import { DEFAULT_CONTACT, DEFAULT_SHIPPING } from '../constants';

function getToken(): string | null {
  const tokens = getStoredCustomerTokens();
  return tokens && !isAccessTokenExpired(tokens) ? tokens.accessToken : null;
}

async function pollForOrder(
  sessionId: string,
  token: string | null,
  attempts = 6,
  intervalMs = 2500,
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

  const [sessionId, setSessionId] = useState<string | null>(getCheckoutSessionId);
  const [step, setStep] = useState<Step>('contact');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmFirstName, setConfirmFirstName] = useState('');
  const [confirmPhone, setConfirmPhone] = useState('');

  // Local form state — committed to backend on "Next"
  const [contact, setContact] = useState<ContactDetails>(DEFAULT_CONTACT);
  const [shipping, setShipping] = useState<ShippingDetails>(DEFAULT_SHIPPING);
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
      const s = await checkoutApi.createSession(cartId, getToken());
      setCheckoutSessionId(s.id);
      setSessionId(s.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to start checkout');
    }
  }, [cartId, sessionId]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  // Auto-select first method once loaded
  useEffect(() => {
    if (shippingMethods.length > 0 && !selectedMethodId) {
      setSelectedMethodId(shippingMethods[0].id);
    }
  }, [shippingMethods, selectedMethodId]);

  // Restore step + form values from a resumed session
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
      setContact((p) => ({ ...p, email: snap.email, phone: snap.phone, fullName: snap.fullName }));
      setConfirmEmail(snap.email);
      setConfirmPhone(snap.phone);
      const [first = ''] = snap.fullName.split(' ');
      setConfirmFirstName(first);
    }

    if (session.shippingSnapshot) {
      setSelectedMethodId(session.shippingSnapshot.shippingMethodId);
    }

    if (session.currentStep >= 3 && step === 'contact') setStep('payment');
    else if (session.currentStep >= 2 && step === 'contact') setStep('shipping');
    // Run once per session load (session.id change means a new/restored session)
  }, [session?.id]);
  // ── Step: Contact ─────────────────────────────────────────────────────────

  const handleContactNext = useCallback(async () => {
    if (!sessionId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await checkoutApi.updateContact(
        sessionId,
        { email: contact.email, phone: contact.phone, fullName: contact.fullName },
        getToken(),
      );
      setConfirmEmail(contact.email);
      setConfirmPhone(contact.phone);
      const [first = ''] = contact.fullName.split(' ');
      setConfirmFirstName(first);
      queryClient.invalidateQueries({ queryKey: ['checkout-session', sessionId] });
      setStep('shipping');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save contact info');
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionId, contact, queryClient]);

  // ── Step: Shipping ────────────────────────────────────────────────────────

  const handleShippingNext = useCallback(async () => {
    if (!sessionId || !selectedMethodId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const recipientName = `${shipping.firstName} ${shipping.lastName}`.trim();
      const street = shipping.apartment
        ? `${shipping.address}, ${shipping.apartment}`
        : shipping.address;

      await checkoutApi.updateShipping(
        sessionId,
        {
          shippingMethodId: selectedMethodId,
          recipientName,
          street,
          city: shipping.city,
          country: shipping.country,
          postalCode: shipping.postalCode || undefined,
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
  }, [sessionId, shipping, selectedMethodId, queryClient]);

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
          // Webhook creates the order async — poll for up to ~15 s
          const orderId = await pollForOrder(sessionId, getToken());
          setCompletedOrderId(orderId);
          await clearCart();
          clearCheckoutSessionId();
          setSessionId(null);
          setStep('confirmation');
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
  const currency = totals?.currency ?? 'EUR';
  const finalTotal = totals?.total ?? subtotal + (shippingCost ?? 0);

  const isContactValid = Boolean(contact.email && contact.phone && contact.fullName);
  const isShippingValid = Boolean(
    shipping.firstName &&
      shipping.lastName &&
      shipping.address &&
      shipping.city &&
      selectedMethodId,
  );

  const updateContact = useCallback(
    <K extends keyof ContactDetails>(key: K, value: ContactDetails[K]) =>
      setContact((p) => ({ ...p, [key]: value })),
    [],
  );

  const updateShipping = useCallback(
    <K extends keyof ShippingDetails>(key: K, value: ShippingDetails[K]) =>
      setShipping((p) => ({ ...p, [key]: value })),
    [],
  );

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
    // Forms
    contact,
    shipping,
    selectedMethodId,
    paymentMethod,
    shippingMethods,
    // Cart / totals
    cartItems: items,
    subtotal,
    discountAmount,
    shippingCost,
    finalTotal,
    currency,
    // Validation
    isContactValid,
    isShippingValid,
    // Setters
    setStep,
    setPaymentMethod,
    setSelectedMethodId,
    updateContact,
    updateShipping,
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
