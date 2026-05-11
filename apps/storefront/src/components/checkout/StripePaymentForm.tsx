import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { CreditCard, Shield } from 'lucide-react';

interface StripePaymentFormProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

export function StripePaymentForm({ amount, onSuccess, onError }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        onError(error.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      // In a real implementation, you would send paymentMethod.id to your server
      // For now, we'll simulate success
      onSuccess(paymentMethod.id);
    } catch (err: any) {
      onError(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '14px',
        color: '#1A1A1A',
        '::placeholder': {
          color: '#B0B0B0',
        },
        fontFamily: 'system-ui, sans-serif',
      },
      invalid: {
        color: '#DC2626',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-4 bg-[#F8F8F8] mb-6">
        <label
          className="block text-[#6A6A6A] text-xs uppercase tracking-widest mb-3"
          style={{ letterSpacing: '0.1em' }}
        >
          Card Information
        </label>
        <div className="bg-white border border-[#E0E0E0] px-4 py-3">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <div className="flex items-center gap-2 text-[#9A9A9A] text-xs mb-6">
        <Shield className="size-3.5 text-[#4A7A5A]" />
        <span>Your payment information is encrypted and secure. We never store card details.</span>
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] text-white py-4 text-xs uppercase tracking-widest hover:bg-[#333] transition-colors disabled:bg-[#6A6A6A] disabled:cursor-not-allowed"
        style={{ letterSpacing: '0.15em' }}
      >
        {isProcessing ? (
          <>
            <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="size-4" />
            Pay ${amount.toFixed(2)}
          </>
        )}
      </button>
    </form>
  );
}
