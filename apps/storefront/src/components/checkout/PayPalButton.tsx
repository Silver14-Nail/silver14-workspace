import { useEffect, useRef, useState } from 'react';
import { createPayPalOrder, capturePayPalPayment } from '@source/api-client';

interface PayPalButtonProps {
  amount: number;
  orderId: string;
  onSuccess: (paypalOrderId: string) => void;
  onError: (error: string) => void;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export function PayPalButton({ amount, orderId, onSuccess, onError }: PayPalButtonProps) {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Load PayPal SDK script
    if (!window.paypal && !document.querySelector('script[src*="paypal"]')) {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.VITE_PAYPAL_CLIENT_ID || 'sandbox'}&currency=USD`;
      script.async = true;
      script.onload = () => {
        setScriptLoaded(true);
        setIsLoading(false);
      };
      script.onerror = () => {
        onError('Failed to load PayPal SDK');
        setIsLoading(false);
      };
      document.body.appendChild(script);
    } else if (window.paypal) {
      setScriptLoaded(true);
      setIsLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    if (scriptLoaded && window.paypal && paypalRef.current && !paypalRef.current.hasChildNodes()) {
      window.paypal
        .Buttons({
          style: {
            layout: 'vertical',
            color: 'black',
            shape: 'rect',
            label: 'pay',
          },
          createOrder: async () => {
            try {
              const result = await createPayPalOrder(amount, orderId);
              if (result.success && result.orderId) {
                return result.orderId;
              }
              throw new Error(result.error || 'Failed to create PayPal order');
            } catch (err: any) {
              onError(err.message);
              throw err;
            }
          },
          onApprove: async (data: any) => {
            try {
              const result = await capturePayPalPayment(data.orderID);
              if (result.success) {
                onSuccess(data.orderID);
              } else {
                onError(result.error || 'Payment capture failed');
              }
            } catch (err: any) {
              onError(err.message);
            }
          },
          onError: (err: any) => {
            onError('PayPal payment error: ' + (err.message || 'Unknown error'));
          },
        })
        .render(paypalRef.current);
    }
  }, [scriptLoaded, amount, orderId, onSuccess, onError]);

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="size-8 border-2 border-[#E0E0E0] border-t-[#1A1A1A] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[#9A9A9A] text-sm">Loading PayPal...</p>
      </div>
    );
  }

  return (
    <div>
      <div ref={paypalRef} className="min-h-[150px]" />
    </div>
  );
}
