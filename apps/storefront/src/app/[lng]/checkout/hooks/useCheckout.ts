'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  getCheckoutStep,
  setCheckoutStep,
  getPendingCoupon,
  clearPendingCoupon,
} from '@/features/checkout/checkout.storage';
import type { CheckoutSession, ShippingMethod } from '@/features/checkout/checkout.types';
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
      // 200 with null while order hasn't been created yet
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
    // Restore for both authenticated and guest users — guests need their session
    // after returning from a payment gateway (e.g., OnePay redirect-back).
    return getCheckoutSessionId();
  });

  const [step, setStepRaw] = useState<'contact' | 'shipping' | 'payment' | 'confirmation'>(() => {
    // Restore step only if there is an active checkout session — prevents
    // jumping to a later step when the user starts a fresh checkout.
    const hasSession = typeof window !== 'undefined' && !!getCheckoutSessionId();
    return hasSession ? (getCheckoutStep() ?? 'contact') : 'contact';
  });

  const setStep = useCallback((s: 'contact' | 'shipping' | 'payment' | 'confirmation') => {
    setStepRaw(s);
    setCheckoutStep(s);
  }, []);
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

  // ── Post-redirect: Lemon Squeezy return ──────────────────────────────────
  // Lemon Squeezy redirects back to this page with ?payment=success.
  // All other providers call handlePaymentSuccess() directly from their renderer.

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);

    if (params.get('payment') !== 'success') {
      // Don't wipe the session when returning from a payment gateway with error —
      // the user may want to retry. Only clear if no payment-related params present.
      const isGatewayReturn = params.has('error') || params.has('status') || params.has('orderId');
      if (!getToken() && !isGatewayReturn) clearCheckoutSessionId();
      return;
    }

    window.history.replaceState({}, '', window.location.pathname);

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
    setOrderPollingDone(true);

    const storedSessionId = getCheckoutSessionId();
    clearCheckoutSessionId();
    setSessionId(null);

    clearCart().catch(() => {});

    if (storedSessionId) {
      pollForOrder(storedSessionId, getToken()).then((id) => {
        if (id) setCompletedOrderId(id);
      });
    }
  }, []);

  // ── Session lifecycle ─────────────────────────────────────────────────────

  const ensureSession = useCallback(async (): Promise<string | null> => {
    // Guest users: reuse stored session if available (no account to link)
    if (sessionId && !getToken()) return sessionId;
    if (!cartId) return null;
    try {
      const isNewSession = !sessionId;
      const s = await checkoutApi.createSession(cartId, getToken(), selectedCurrency);
      setCheckoutSessionId(s.id);
      setSessionId(s.id);

      // Apply pending coupon only on first creation, not on user-link re-calls
      if (isNewSession) {
        const pending = getPendingCoupon();
        if (pending?.code) {
          try {
            const updated = await checkoutApi.applyCoupon(s.id, pending.code, getToken());
            queryClient.setQueryData(['checkout-session', s.id], updated);
          } catch {}
          clearPendingCoupon();
        }
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

  // ── Payment success (called by PaymentStep on any provider success) ────────
  //
  // The renderer already cleared the cart and session storage via
  // handleProviderSuccess in useCheckoutPayment. This just updates
  // the checkout step state and sets the order ID for the confirmation screen.

  const handlePaymentSuccess = useCallback((orderId: string) => {
    setCompletedOrderId(orderId);
    setOrderPollingDone(true);
    clearCheckoutSessionId();
    setSessionId(null);
    setStep('confirmation');
  }, []);

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
    cartItems: items,
    subtotal,
    discountAmount,
    shippingCost,
    finalTotal,
    currency,
    setStep,
    setSelectedMethodId,
    handleContactNext,
    handleShippingNext,
    handlePaymentSuccess,
    handleApplyCoupon,
    handleRemoveCoupon,
  };
}
