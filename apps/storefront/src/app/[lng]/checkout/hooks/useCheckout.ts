import { useState, useCallback } from 'react';
import { getShippingCost } from '@/features/checkout/checkout.utils';
import { useCart } from '@/hooks/useCart';
import type { Step, CardDetails, CheckoutState } from '../types';
import type {
  ContactDetails,
  PaymentMethod,
  ShippingDetails,
} from '@/features/checkout/checkout.utils';
import { DEFAULT_CARD, DEFAULT_CONTACT, DEFAULT_SHIPPING } from '../constants';

export function useCheckout() {
  const { items, subtotal, total, clearCart } = useCart();

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
      // Placeholder: real payment gateway integration (Stripe/PayPal) goes here
      await new Promise<void>((r) => setTimeout(r, 2000));
      const mockId = `ORD-${Date.now().toString(36).toUpperCase()}`;
      setOrderId(mockId);
      await clearCart();
      setStep('confirmation');
    } finally {
      setIsProcessing(false);
    }
  }, [clearCart]);

  return {
    step,
    checkoutType,
    isProcessing,
    orderId,
    contact,
    shipping,
    payment,
    card,
    cartItems: items,
    subtotal,
    discountAmount: 0,
    shippingCost,
    finalTotal,
    isContactValid,
    isShippingValid,
    setStep,
    setCheckoutType,
    setPayment,
    updateContact,
    updateShipping,
    updateCard,
    handlePayment,
  };
}
