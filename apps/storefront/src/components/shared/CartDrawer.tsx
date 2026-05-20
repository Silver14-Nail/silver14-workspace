'use client';

import { useState, useEffect } from 'react';
import { X, ShoppingBag, Minus, Plus, ArrowRight } from 'lucide-react';
import { Link } from './LinkBase';
import { useCart } from '../../hooks/useCart';
import { useCurrency } from '../../hooks/useCurrency';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { FREE_SHIPPING_THRESHOLD } from '../../config/commerce.config';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [hydrated, setHydrated] = useState(false);
  const { items, cartCount, subtotal, total, updateItem, removeItem, isLoading } = useCart();
  const { format } = useCurrency();

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 transition-opacity" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E8E8]">
          <div className="flex items-center gap-3">
            <ShoppingBag className="size-5 text-[#1A1A1A]" />
            <h2
              className="text-[#1A1A1A] text-sm uppercase tracking-widest"
              style={{ letterSpacing: '0.12em' }}
            >
              Shopping Bag ({cartCount})
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#F5F5F5] rounded transition-colors">
            <X className="size-5 text-[#1A1A1A]" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-7 h-7 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="size-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="size-7 text-[#9A9A9A]" />
            </div>
            <p className="text-[#1A1A1A] text-sm mb-2">Your bag is empty</p>
            <p className="text-[#9A9A9A] text-xs mb-6">Add items to get started</p>
            <button
              onClick={onClose}
              className="border border-[#E0E0E0] text-[#1A1A1A] px-8 py-3 text-xs uppercase tracking-widest hover:bg-[#F5F5F5] transition-colors"
              style={{ letterSpacing: '0.15em' }}
            >
              Shop Now
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-[#F0F0F0]">
                    <div className="size-20 flex-shrink-0 bg-[#F5F5F5] overflow-hidden">
                      <ImageWithFallback
                        src={item.thumbnail ?? ''}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[#1A1A1A] text-sm mb-1 truncate">
                            {item.productName}
                          </h3>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[#9A9A9A] hover:text-[#1A1A1A] transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <X className="size-4" />
                        </button>
                      </div>

                      {(item.sizeName || item.shapeName) && (
                        <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-[#5A5A5A] mb-3">
                          {item.sizeName && <span>Size: {item.sizeName}</span>}
                          {item.sizeName && item.shapeName && <span>·</span>}
                          {item.shapeName && <span>Shape: {item.shapeName}</span>}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-[#E0E0E0]">
                          <button
                            onClick={() => updateItem(item.id, item.quantity - 1)}
                            className="px-2 py-1 hover:bg-[#F5F5F5] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="px-3 text-xs text-[#1A1A1A] min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateItem(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stockQty}
                            className="px-2 py-1 hover:bg-[#F5F5F5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                        <span
                          className="text-[#1A1A1A] text-sm"
                          style={{ fontWeight: 500 }}
                        >
                          {format(item.lineTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#E8E8E8] px-6 py-5">
              <div className="space-y-2 mb-5">
                <div className="flex justify-between text-sm text-[#5A5A5A]">
                  <span>Subtotal</span>
                  <span>{format(subtotal)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#F0F0F0]">
                  <span
                    className="text-[#1A1A1A] text-xs uppercase tracking-widest"
                    style={{ letterSpacing: '0.1em' }}
                  >
                    Total
                  </span>
                  <span
                    className="text-[#1A1A1A]"
                    style={{
                      fontWeight: 500,
                      fontSize: '1.1rem',
                    }}
                  >
                    {format(total)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] text-white py-3.5 text-xs uppercase tracking-widest hover:bg-[#333] transition-colors"
                  style={{ letterSpacing: '0.15em' }}
                >
                  Checkout
                  <ArrowRight className="size-4" />
                </Link>
                <button
                  onClick={onClose}
                  className="w-full border border-[#E0E0E0] text-[#1A1A1A] py-3 text-xs uppercase tracking-widest hover:bg-[#F5F5F5] transition-colors"
                  style={{ letterSpacing: '0.15em' }}
                >
                  Continue Shopping
                </button>
              </div>

              <p className="text-[#9A9A9A] text-xs text-center mt-4">
                Free shipping on orders over {format(FREE_SHIPPING_THRESHOLD)}
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
