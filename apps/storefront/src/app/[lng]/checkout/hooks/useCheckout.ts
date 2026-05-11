import { useState, useCallback } from 'react';
import {
  createMockOrder,
  generateOrderId,
  getShippingCost,
} from '@/features/checkout/checkout.utils';
import { useCart } from '@/context/CartContext';
import type { Step, CardDetails, CheckoutState } from '../types';
import type {
  ContactDetails,
  PaymentMethod,
  ShippingDetails,
} from '@/features/checkout/checkout.utils';
import { DEFAULT_CARD, DEFAULT_CONTACT, DEFAULT_SHIPPING } from '../constants';

export function useCheckout() {
  const { state, subtotal, discountAmount, total, dispatch, addOrder } = useCart();

  const [step, setStep] = useState<Step>('contact');
  const [checkoutType, setCheckoutType] = useState<CheckoutState['checkoutType']>('guest');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [contact, setContact] = useState<ContactDetails>(DEFAULT_CONTACT);
  const [shipping, setShipping] = useState<ShippingDetails>(DEFAULT_SHIPPING);
  const [payment, setPayment] = useState<PaymentMethod>('card');
  const [card, setCard] = useState<CardDetails>(DEFAULT_CARD);

  const shippingCost = getShippingCost(subtotal);
  const finalTotal = total + shippingCost;

  // Typed partial-update helpers — avoid re-renders from inline lambdas in JSX
  const updateContact = useCallback(
    <K extends keyof ContactDetails>(key: K, value: ContactDetails[K]) => {
      setContact((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const updateShipping = useCallback(
    <K extends keyof ShippingDetails>(key: K, value: ShippingDetails[K]) => {
      setShipping((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const updateCard = useCallback(<K extends keyof CardDetails>(key: K, value: CardDetails[K]) => {
    setCard((prev) => ({ ...prev, [key]: value }));
  }, []);

  const isContactValid = Boolean(contact.email && contact.phone);
  const isShippingValid = Boolean(
    shipping.firstName && shipping.lastName && shipping.address && shipping.city,
  );

  const handlePayment = useCallback(async () => {
    setIsProcessing(true);
    try {
      // Simulated async payment — replace with real gateway call
      await new Promise<void>((r) => setTimeout(r, 2000));
      const id = generateOrderId();
      setOrderId(id);
      addOrder(
        createMockOrder({
          id,
          contact,
          shipping,
          payment,
          items: state.items,
          subtotal,
          discount: discountAmount,
          total: finalTotal,
        }),
      );
      dispatch({ type: 'CLEAR_CART' });
      setStep('confirmation');
    } finally {
      // Always stop spinner even on error
      setIsProcessing(false);
    }
  }, [
    contact,
    shipping,
    payment,
    state.items,
    subtotal,
    discountAmount,
    finalTotal,
    addOrder,
    dispatch,
  ]);

  return {
    // State
    step,
    checkoutType,
    isProcessing,
    orderId,
    contact,
    shipping,
    payment,
    card,
    // Cart-derived
    cartItems: state.items,
    subtotal,
    discountAmount,
    shippingCost,
    finalTotal,
    // Validity
    isContactValid,
    isShippingValid,
    // Setters
    setStep,
    setCheckoutType,
    setPayment,
    updateContact,
    updateShipping,
    updateCard,
    // Actions
    handlePayment,
  };
}
