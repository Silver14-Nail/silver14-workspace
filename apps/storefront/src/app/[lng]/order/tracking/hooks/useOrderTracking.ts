'use client';

import { useState, useCallback } from 'react';
import type { TrackingFormData, TrackedOrder } from '../types';
import { getBase } from '@/lib/api-base';

async function fetchTrackedOrder(orderId: string, phone: string): Promise<TrackedOrder | null> {
  try {
    const res = await fetch(
      `${getBase()}/client-api/orders/track?orderId=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(phone)}`,
    );
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export function useOrderTracking() {
  const [result, setResult] = useState<TrackedOrder | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TrackingFormData>({ orderId: '', phone: '' });

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
    handleInputChange,
    trackOrder,
    resetTracking,
  };
}
