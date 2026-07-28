'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCart } from '@/hooks/useCart';
import { useAppSelector } from '@/store/hooks';
import {
  getStoredCustomerTokens,
  isAccessTokenExpired,
} from '@/features/auth/customer-auth.storage';
import { checkoutApi } from '@/features/checkout/checkout.api';
import { cartApi } from '@/features/cart/cart.api';
import { getLocalCart, broadcastGuestCartId } from '@/features/cart/cart.storage';
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

export function useCheckout() {
  const queryClient = useQueryClient();
  const { cartId, items, subtotal: cartSubtotal } = useCart();
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

  // ── Post-redirect: payment gateway return ────────────────────────────────
  // Providers call handlePaymentSuccess() directly from their renderer. This
  // only guards against wiping an in-progress guest session when the browser
  // is redirected back with a gateway error (e.g. OnePAY failure redirect) —
  // the user may want to retry rather than start over.

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);

    const isGatewayReturn = params.has('error') || params.has('status') || params.has('orderId');
    if (!getToken() && !isGatewayReturn) clearCheckoutSessionId();
  }, []);

  // ── Session lifecycle ─────────────────────────────────────────────────────

  // Tracks the sessionId that has already been confirmed (via a successful
  // createSession call) to belong to the current auth state — including the
  // guest→account upgrade createSession() performs on login. Once set, later
  // calls for the same sessionId can skip re-syncing the cart and re-hitting
  // the API entirely.
  const linkedSessionIdRef = useRef<string | null>(null);

  const ensureSession = useCallback(async (): Promise<string | null> => {
    // Guest users: reuse stored session if available (no account to link)
    if (sessionId && !getToken()) return sessionId;

    // Logged-in users: once this session has been confirmed linked to the
    // account, subsequent calls (e.g. re-visiting the contact step) don't
    // need to re-sync the cart or re-create/re-link the session again.
    if (sessionId && linkedSessionIdRef.current === sessionId) return sessionId;

    let resolvedCartId = cartId;

    // Cart lives in localStorage (cartId === null). Before creating a checkout
    // session we sync local items to the API — the first addItem creates the
    // cart and returns its id; subsequent calls reuse it via x-cart-id header.
    if (!resolvedCartId) {
      const localItems = getLocalCart().items;
      if (localItems.length === 0) {
        setError('Your cart is empty. Please add items before checking out.');
        return null;
      }

      const toDto = (item: (typeof localItems)[number]) => ({
        variantId: item.variant.id,
        quantity: item.quantity,
        isCustomSize: item.isCustomSize,
        customMeasurements: item.customMeasurements ?? undefined,
      });

      // The first successful call creates the cart and returns its id; every
      // other item only needs that id (via x-cart-id), not each other's
      // response, so once we have it the rest can go out in parallel instead
      // of one-request-at-a-time — the dominant cost of ensureSession() on
      // carts with several items.
      let syncedCartId: string | null = null;
      let anchorIndex = -1;
      for (let i = 0; i < localItems.length; i++) {
        try {
          const res = await cartApi.addItem(toDto(localItems[i]), null, null);
          syncedCartId = res.cartId;
          anchorIndex = i;
          break;
        } catch {
          // Try the next item as the anchor — ignore per-item failures.
        }
      }

      if (syncedCartId) {
        const rest = localItems.filter((_, i) => i !== anchorIndex);
        if (rest.length > 0) {
          await Promise.allSettled(
            rest.map((item) => cartApi.addItem(toDto(item), null, syncedCartId)),
          );
        }
      }

      if (!syncedCartId) {
        setError('Could not sync your cart. Please check your connection and try again.');
        return null;
      }
      broadcastGuestCartId(syncedCartId);
      resolvedCartId = syncedCartId;
    }

    if (!resolvedCartId) return null;

    try {
      const isNewSession = !sessionId;
      const s = await checkoutApi.createSession(resolvedCartId, getToken(), selectedCurrency);
      setCheckoutSessionId(s.id);
      setSessionId(s.id);
      linkedSessionIdRef.current = s.id;

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
      setIsSubmitting(true);
      setError(null);
      try {
        const sid = sessionId ?? (await ensureSession());
        if (!sid) return;

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
  // Always derive subtotal from client cart items — server session totals may lag
  // (e.g., cart synced from Safari localStorage may have fewer items than shown).
  const exchangeRate = totals?.exchangeRate ?? 1;
  const subtotal = cartSubtotal * exchangeRate;
  const finalTotal = shippingCost !== null
    ? subtotal - discountAmount + shippingCost
    : subtotal - discountAmount;

  return {
    step,
    session,
    sessionId,
    isSessionLoading,
    isSubmitting,
    error,
    completedOrderId,
    orderPollingDone,
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
