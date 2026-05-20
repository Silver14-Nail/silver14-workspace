'use client';

import { useCart } from '@/hooks/useCart';
import {
  EmptyCart,
  CartHeader,
  FreeShippingBanner,
  CartItemList,
  OrderSummary,
} from './components';
import type { CartItemType } from './types';

export default function CartPage() {
  const { items, cartCount, subtotal, updateItem, removeItem, isLoading } = useCart();

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 md:pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
