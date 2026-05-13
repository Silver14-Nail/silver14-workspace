import { useState, useEffect } from 'react';

import { X, ShoppingBag, Minus, Plus, ArrowRight } from 'lucide-react';
import { Link } from './LinkBase';
import { useCart } from '../../context/CartContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [hydrated, setHydrated] = useState(false);
  const { state, dispatch, cartCount, subtotal, discountAmount, total } = useCart();

  useEffect(() => {
    setHydrated(true);
  }, []);

  const updateQuantity = (productId: string, size: string, shape: string, newQuantity: number) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { productId, size, shape, quantity: newQuantity },
    });
  };

  const removeItem = (productId: string, size: string, shape: string) => {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: { productId, size, shape },
    });
  };

  if (!hydrated) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 transition-opacity" onClick={onClose} />
      )}

      {/* Drawer */}
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

        {/* Content */}
        {state.items.length === 0 ? (
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
            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                {state.items.map((item) => {
                  const displayPrice = item.product.salePrice ?? item.product.price;
                  const itemTotal = displayPrice * item.quantity;

                  return (
                    <div
                      key={`${item.product.id}-${item.size}-${item.shape}`}
                      className="flex gap-4 pb-4 border-b border-[#F0F0F0]"
                    >
                      {/* Image */}
                      <div className="size-20 flex-shrink-0 bg-[#F5F5F5] overflow-hidden">
                        <ImageWithFallback
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-[#1A1A1A] text-sm mb-1 truncate">
                              {item.product.name}
                            </h3>
                            <p className="text-[#9A9A9A] text-xs">{item.product.collection}</p>
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id, item.size, item.shape)}
                            className="text-[#9A9A9A] hover:text-[#1A1A1A] transition-colors p-1"
                          >
                            <X className="size-4" />
                          </button>
                        </div>

                        {/* Variant Info */}
                        <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-[#5A5A5A] mb-3">
                          <span>Size: {item.size}</span>
                          <span>·</span>
                          <span>Shape: {item.shape}</span>
                        </div>

                        {/* Quantity + Price */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-[#E0E0E0]">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.size,
                                  item.shape,
                                  item.quantity - 1,
                                )
                              }
                              className="px-2 py-1 hover:bg-[#F5F5F5] transition-colors"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="px-3 text-xs text-[#1A1A1A] min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.size,
                                  item.shape,
                                  item.quantity + 1,
                                )
                              }
                              className="px-2 py-1 hover:bg-[#F5F5F5] transition-colors"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>
                          <span
                            className="text-[#1A1A1A] text-sm"
                            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
                          >
                            €{itemTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[#E8E8E8] px-6 py-5">
              {/* Totals */}
              <div className="space-y-2 mb-5">
                <div className="flex justify-between text-sm text-[#5A5A5A]">
                  <span>Subtotal</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5A5A5A]">Discount</span>
                    <span className="text-[#4A7A5A]">−€{discountAmount.toFixed(2)}</span>
                  </div>
                )}
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
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 500,
                      fontSize: '1.1rem',
                    }}
                  >
                    €{total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Actions */}
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
                Free shipping on orders over €50
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
