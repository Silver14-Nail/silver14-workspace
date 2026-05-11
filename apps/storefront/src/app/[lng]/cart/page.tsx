'use client';

import { useCart } from '@/context/CartContext';
import {
  EmptyCart,
  CartHeader,
  FreeShippingBanner,
  CartItemList,
  OrderSummary,
} from './components';
import { CartItemType } from './types';
import { toItemKey } from './utils';

export default function CartPage() {
  const { state, dispatch, cartCount, subtotal } = useCart();

  if (cartCount === 0) return <EmptyCart />;

  const handleQuantityChange = (item: CartItemType, delta: number) =>
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { ...toItemKey(item), quantity: item.quantity + delta },
    });

  const handleRemove = (item: CartItemType) =>
    dispatch({ type: 'REMOVE_ITEM', payload: toItemKey(item) });

  return (
    <div className="min-h-screen pt-16 md:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CartHeader cartCount={cartCount} />
        <FreeShippingBanner subtotal={subtotal} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          <CartItemList
            items={state.items}
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
