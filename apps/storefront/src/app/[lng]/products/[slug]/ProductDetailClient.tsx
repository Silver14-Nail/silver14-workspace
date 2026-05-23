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
import type { StorefrontProductDetail, StorefrontProduct } from '@/types/product';

interface ProductDetailClientProps {
  product: StorefrontProductDetail | null;
  related: StorefrontProduct[];
}

export function ProductDetailClient({ product, related }: ProductDetailClientProps) {
  const pd = useProductDetail(product, related);

  const decrement = useCallback(
    () => pd.updateSelection('quantity', Math.max(1, pd.selections.quantity - 1)),
    [pd],
  );
  const increment = useCallback(
    () => pd.updateSelection('quantity', pd.selections.quantity + 1),
    [pd],
  );

  if (!pd.product) return <ProductNotFound />;

  const { product: p } = pd;

  return (
    <div className="min-h-screen pt-16 md:pt-20 pb-20 md:pb-12">
      <Breadcrumb productName={p.name} onBack={() => pd.router.back()} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Left — gallery */}
          <ImageGallery
            images={p.images}
            productName={p.name}
            hasSale={false}
            selectedIndex={pd.selectedImage}
            onSelect={pd.setSelectedImage}
          />

          {/* Right — info + accordion */}
          <div>
            <ProductInfo
              product={p}
              selections={pd.selections}
              canAddToCart={pd.canAddToCart}
              isCustomSize={pd.isCustomSize}
              inWishlist={pd.inWishlist}
              availableSizes={pd.availableSizesForShape}
              variantComputedPrice={pd.selectedVariant?.computedPrice ?? null}
              onUpdateSelection={pd.updateSelection}
              onAddToCart={pd.handleAddToCart}
              onToggleWishlist={pd.handleWishlist}
            />
            <TrustBadges />
            <ProductAccordion
              variant="desktop"
              productDescription={p.description}
              processingTime={p.processingTime}
              openSection={pd.openSection}
              onToggle={pd.toggleSection}
            />
          </div>
        </div>
      </div>

      <ProductAccordion
        variant="mobile"
        productDescription={p.description}
        processingTime={p.processingTime}
        openSection={pd.openSection}
        onToggle={pd.toggleSection}
      />

      <RelatedProducts products={pd.related} />

      <MobileCartBar
        inStock={p.inStock}
        canAddToCart={pd.canAddToCart}
        isCustomSize={pd.isCustomSize}
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
      />
    </div>
  );
}
