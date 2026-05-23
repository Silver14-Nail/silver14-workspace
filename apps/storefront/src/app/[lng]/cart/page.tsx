'use client';

import { useState, useEffect } from 'react';
import { useIsMutating } from '@tanstack/react-query';
import { useCart } from '@/hooks/useCart';
import {
  EmptyCart,
  CartHeader,
  FreeShippingBanner,
  CartItemList,
  OrderSummary,
} from './components';
import type { CartItemType } from './types';

function CartSkeleton() {
  return (
    <div className="min-h-screen pt-16 md:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header skeleton */}
        <div className="h-8 w-48 bg-[#F0F0F0] animate-pulse mb-6" />
        <div className="h-2 w-full bg-[#F0F0F0] animate-pulse mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          {/* Items skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 py-6 border-b border-[#F0F0F0]">
                <div className="size-24 bg-[#F0F0F0] animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-3/4 bg-[#F0F0F0] animate-pulse" />
                  <div className="h-3 w-1/2 bg-[#F0F0F0] animate-pulse" />
                  <div className="h-8 w-24 bg-[#F0F0F0] animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          {/* Summary skeleton */}
          <div className="space-y-4">
            <div className="h-4 w-full bg-[#F0F0F0] animate-pulse" />
            <div className="h-4 w-3/4 bg-[#F0F0F0] animate-pulse" />
            <div className="h-12 w-full bg-[#F0F0F0] animate-pulse mt-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  // Prevent SSR from rendering <EmptyCart> before client-side fetch runs.
  // Server has no localStorage/cookies so the cart query is disabled → data is
  // undefined → cartCount = 0 → would flash empty cart before items load.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { items, cartCount, subtotal, updateItem, removeItem, isLoading } = useCart();

  // Show skeleton if:
  //  1. Not yet mounted (SSR / hydration)
  //  2. Query is fetching for the first time
  //  3. Cart appears empty but a mutation is in-flight (race: add-item resolves after navigation)
  const isMutating = useIsMutating();
  if (!mounted || isLoading || (cartCount === 0 && isMutating > 0)) return <CartSkeleton />;

  if (cartCount === 0) return <EmptyCart />;

  const handleQuantityChange = (item: CartItemType, delta: number) => {
    const next = item.quantity + delta;
    if (next <= 0) {
      removeItem(item.id);
    } else {
      updateItem(item.id, next);
    }
  };

  const handleRemove = (item: CartItemType) => removeItem(item.id);

  return (
    <div className="min-h-screen pt-16 md:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CartHeader cartCount={cartCount} />
        <FreeShippingBanner subtotal={subtotal} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          <CartItemList
            items={items}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemove}
          />
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
