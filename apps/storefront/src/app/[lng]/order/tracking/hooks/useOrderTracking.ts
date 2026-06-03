'use client';

import axios from 'axios';
import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { TrackingFormData, TrackedOrder } from '../types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

const http = axios.create({ baseURL: BASE, withCredentials: true });

async function fetchTrackedOrder(orderId: string, phone: string): Promise<TrackedOrder | null> {
  try {
    const { data } = await http.get<TrackedOrder>(
      `/client-api/orders/track?orderId=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(phone)}`,
    );
    return data;
  } catch {
    return null;
  }
}

export type PaymentStatus = 'success' | 'pending' | 'error' | null;

export function useOrderTracking() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<TrackedOrder | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TrackingFormData>({ orderId: '', phone: '' });
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(null);

  // Pre-fill orderId and show banner from OnePay return redirect
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');
    const error = searchParams.get('error');

    if (orderId) {
      setFormData((prev) => ({ ...prev, orderId }));
    }

    if (status === 'success') setPaymentStatus('success');
    else if (status === 'pending') setPaymentStatus('pending');
    else if (error) setPaymentStatus('error');
  }, [searchParams]);

  const handleInputChange = useCallback((field: keyof TrackingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const trackOrder = useCallback(async () => {
    if (!formData.orderId.trim() || !formData.phone.trim()) return;
    setLoading(true);
    const order = await fetchTrackedOrder(formData.orderId.trim(), formData.phone.trim());
    setResult(order);
    setLoading(false);
  }, [formData]);

  const resetTracking = useCallback(() => {
    setResult(undefined);
    setFormData({ orderId: '', phone: '' });
  }, []);

  return {
    formData,
    result,
    loading,
    paymentStatus,
    handleInputChange,
    trackOrder,
    resetTracking,
  };
}
