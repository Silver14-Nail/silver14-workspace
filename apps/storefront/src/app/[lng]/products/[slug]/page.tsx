'use client';

import { useCallback } from 'react';
import { CartPreviewDialog } from '@/components/shared/CartPreviewDialog';
import { useProductDetail } from './hooks/useProductDetail';
import {
  ProductNotFound,
  Breadcrumb,
  ImageGallery,
  ProductInfo,
  TrustBadges,
  ProductAccordion,
  RelatedProducts,
  MobileCartBar,
} from './components';

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen pt-16 md:pt-20 pb-20 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
        <div className="h-4 bg-[#F0F0F0] rounded w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          <div className="bg-[#F0F0F0] aspect-[3/4] rounded" />
          <div className="space-y-4 pt-4">
            <div className="h-3 bg-[#F0F0F0] rounded w-24" />
            <div className="h-8 bg-[#F0F0F0] rounded w-3/4" />
            <div className="h-6 bg-[#F0F0F0] rounded w-20" />
            <div className="h-px bg-[#F0F0F0] my-6" />
            <div className="h-3 bg-[#F0F0F0] rounded w-full" />
            <div className="h-3 bg-[#F0F0F0] rounded w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const pd = useProductDetail();

  if (pd.loading) return <ProductDetailSkeleton />;
  if (!pd.product) return <ProductNotFound />;

  const { product } = pd;

  const decrement = useCallback(
    () => pd.updateSelection('quantity', Math.max(1, pd.selections.quantity - 1)),
    [pd],
  );
  const increment = useCallback(
    () => pd.updateSelection('quantity', pd.selections.quantity + 1),
    [pd],
  );

  return (
    <div className="min-h-screen pt-16 md:pt-20 pb-20 md:pb-12">
      <Breadcrumb productName={product.name} onBack={() => pd.router.back()} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Left — gallery */}
          <ImageGallery
            images={product.images}
            productName={product.name}
            hasSale={Boolean(product.salePrice)}
            selectedIndex={pd.selectedImage}
            onSelect={pd.setSelectedImage}
          />

          {/* Right — info + accordion */}
          <div>
            <ProductInfo
              product={product}
              selections={pd.selections}
              canAddToCart={pd.canAddToCart}
              inWishlist={pd.inWishlist}
              onUpdateSelection={pd.updateSelection}
              onAddToCart={pd.handleAddToCart}
              onToggleWishlist={pd.handleWishlist}
            />
            <TrustBadges />
            <ProductAccordion
              variant="desktop"
              productDescription={product.description}
              processingTime={product.processingTime}
              openSection={pd.openSection}
              onToggle={pd.toggleSection}
            />
          </div>
        </div>
      </div>

      {/* Mobile accordion (outside grid, full width) */}
      <ProductAccordion
        variant="mobile"
        productDescription={product.description}
        processingTime={product.processingTime}
        openSection={pd.openSection}
        onToggle={pd.toggleSection}
      />

      <RelatedProducts products={pd.related} />

      <MobileCartBar
        inStock={product.inStock}
        canAddToCart={pd.canAddToCart}
        inWishlist={pd.inWishlist}
        selections={pd.selections}
        onDecrement={decrement}
        onIncrement={increment}
        onAddToCart={pd.handleAddToCart}
        onToggleWishlist={pd.handleWishlist}
      />

      <CartPreviewDialog
        open={pd.showCartPreview}
        onOpenChange={pd.setShowCartPreview}
        addedItem={pd.lastAddedItem}
        cartCount={pd.cartCount}
        subtotal={pd.subtotal}
      />
    </div>
  );
}
