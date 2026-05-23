import { LinkBase } from './LinkBase';
import { ShoppingBag, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@source/ui';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useCurrency } from '../../hooks/useCurrency';
import type { CartPreviewItem } from '../../hooks/useCart';

interface CartPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addedItem: CartPreviewItem | null;
}

export function CartPreviewDialog({ open, onOpenChange, addedItem }: CartPreviewDialogProps) {
  const { format } = useCurrency();

  if (!addedItem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-none shadow-xl max-w-md">
        <DialogHeader className="border-b border-[#F0F0F0] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 bg-[#F0F8F4] rounded-full">
              <Check className="size-5 text-[#4A7A5A]" />
            </div>
            <DialogTitle
              className="text-[#1A1A1A] text-left"
              style={{
                fontSize: '1.4rem',
              }}
            >
              Added to Bag
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex gap-4 py-4">
          <div className="size-20 bg-[#F5F5F5] overflow-hidden flex-shrink-0">
            <ImageWithFallback
              src={addedItem.thumbnail ?? ''}
              alt={addedItem.productName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[#1A1A1A] text-sm mb-1 truncate">{addedItem.productName}</h3>
            {(addedItem.sizeName || addedItem.shapeName || addedItem.colorName) && (
              <div className="flex flex-wrap gap-2 text-xs text-[#5A5A5A]">
                {addedItem.colorName && <span>Color: {addedItem.colorName}</span>}
                {addedItem.sizeName && <span>Size: {addedItem.sizeName}</span>}
                {addedItem.sizeName && addedItem.shapeName && <span>/</span>}
                {addedItem.shapeName && <span>Shape: {addedItem.shapeName}</span>}
              </div>
            )}
            <div className="flex items-center gap-3 mt-2">
              <span
                className="text-[#1A1A1A] text-sm"
              >
                {format(addedItem.price)}
              </span>
              <span className="text-[#9A9A9A] text-xs">Qty: {addedItem.quantity}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#F0F0F0] pt-4 pb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-[#5A5A5A]">
              Cart Total ({addedItem.previewCartCount} {addedItem.previewCartCount === 1 ? 'item' : 'items'})
            </span>
            <span
              className="text-[#1A1A1A]"
              style={{
                fontSize: '1.1rem',
              }}
            >
              {format(addedItem.previewSubtotal)}
            </span>
          </div>
          <p className="text-[#9A9A9A] text-xs">Shipping calculated at checkout</p>
        </div>

        <div className="flex flex-col gap-3">
          <LinkBase
            href="/cart"
            onClick={() => onOpenChange(false)}
            className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] text-white py-3 text-xs uppercase tracking-[0.15em] hover:bg-[#333] transition-colors"
          >
            <ShoppingBag className="size-4" />
            View Bag & Checkout
          </LinkBase>
          <button
            onClick={() => onOpenChange(false)}
            className="w-full border border-[#E0E0E0] text-[#1A1A1A] py-3 text-xs uppercase tracking-widest hover:bg-[#F5F5F5] transition-colors"
            style={{ letterSpacing: '0.15em' }}
          >
            Continue Shopping
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
