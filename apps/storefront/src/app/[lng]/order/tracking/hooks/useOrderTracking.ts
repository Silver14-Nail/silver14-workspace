'use client';

import { useState, useCallback } from 'react';
import { useCart, MockOrder } from '@/context/CartContext';
import { TrackingFormData } from '../types';

export function useOrderTracking() {
  const { getOrder } = useCart();

  const [result, setResult] = useState<MockOrder | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TrackingFormData>({ orderId: '', phone: '' });

  const handleInputChange = useCallback((field: keyof TrackingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const trackOrder = useCallback(async () => {
    if (!formData.orderId.trim() || !formData.phone.trim()) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 700)); // Simulate API
    const order = getOrder(formData.orderId.trim(), formData.phone.trim());
    setResult(order);
    setLoading(false);
  }, [formData, getOrder]);

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
