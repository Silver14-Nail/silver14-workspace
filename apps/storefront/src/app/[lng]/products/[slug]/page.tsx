'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Minus,
  Plus,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Star,
  Truck,
  Package,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { ProductCard } from '@/components/shared/ProductCard';
import { CartPreviewDialog } from '@/components/shared/CartPreviewDialog';
import { getProductById, getRelatedProducts } from '@/MOCK_DATAS/products';
import { useCart, CartItem } from '@/context/CartContext';

export default function ProductDetailPage() {
  const { lng, slug } = useParams<{ lng: string; slug: string }>();
  const router = useRouter();
  const { dispatch, cartCount, subtotal } = useCart();

  const product = getProductById(slug || '');
  const related = product ? getRelatedProducts(product) : [];

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedShape, setSelectedShape] = useState('');
  const [selectedLength, setSelectedLength] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showCartPreview, setShowCartPreview] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);
  const [openSection, setOpenSection] = useState<string | null>('description');

  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#9A9A9A] mb-4">Product not found</p>
          <Link
            href={`/${lng}/products`}
            className="text-[#1A1A1A] text-xs uppercase tracking-widest underline"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const displayPrice = product.salePrice ?? product.price;
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    brand: {
      '@type': 'Brand',
      name: 'Silver14 Nail',
    },
    description: product.description,
    image: product.images,
    name: product.name,
    offers: {
      '@type': 'Offer',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      price: displayPrice,
      priceCurrency: 'USD',
    },
    sku: product.id,
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedShape || !selectedLength) return;
    const newItem: CartItem = {
      product,
      size: selectedSize,
      shape: selectedShape,
      length: selectedLength,
      quantity,
    };
    dispatch({
      type: 'ADD_ITEM',
      payload: newItem,
    });
    setLastAddedItem(newItem);
    setShowCartPreview(true);
  };

  const canAddToCart = product.inStock && selectedSize && selectedShape && selectedLength;

  const accordionSections = [
    {
      key: 'description',
      title: 'Description',
      content: (
        <div>
          <p className="text-[#5A5A5A] text-sm leading-relaxed mb-4">{product.description}</p>
          <p className="text-[#5A5A5A] text-sm">
            <span className="text-[#1A1A1A]">Material:</span> {product.material}
          </p>
          <p className="text-[#5A5A5A] text-sm mt-1">
            <span className="text-[#1A1A1A]">Processing Time:</span> {product.processingTime}
          </p>
        </div>
      ),
    },
    {
      key: 'size-guide',
      title: 'Size Guide',
      content: (
        <div className="text-sm text-[#5A5A5A] space-y-3">
          <p>To find your perfect size, measure the widest part of each nail bed in millimetres.</p>
          <div className="border border-[#E5E5E5] overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-[#F5F5F5]">
                <tr>
                  <th
                    className="px-4 py-2.5 text-left text-[#1A1A1A] uppercase tracking-widest"
                    style={{ letterSpacing: '0.1em' }}
                  >
                    Size
                  </th>
                  <th
                    className="px-4 py-2.5 text-left text-[#1A1A1A] uppercase tracking-widest"
                    style={{ letterSpacing: '0.1em' }}
                  >
                    Nail Width
                  </th>
                  <th
                    className="px-4 py-2.5 text-left text-[#1A1A1A] uppercase tracking-widest"
                    style={{ letterSpacing: '0.1em' }}
                  >
                    Hand Size
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {[
                  ['XS', '< 13mm', 'Very small'],
                  ['S', '13-15mm', 'Small'],
                  ['M', '15-17mm', 'Medium'],
                  ['L', '17-19mm', 'Large'],
                  ['XL', '> 19mm', 'Extra large'],
                  ['Custom', 'Your measurements', 'Any size'],
                ].map(([size, width, hand]) => (
                  <tr key={size} className="hover:bg-[#FAFAFA]">
                    <td className="px-4 py-2.5">{size}</td>
                    <td className="px-4 py-2.5">{width}</td>
                    <td className="px-4 py-2.5">{hand}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#9A9A9A]">
            * If ordering Custom Size, please include your measurements in the order notes at
            checkout.
          </p>
        </div>
      ),
    },
    {
      key: 'shipping',
      title: 'Shipping & Returns',
      content: (
        <div className="text-sm text-[#5A5A5A] space-y-2 leading-relaxed">
          <p>
            <strong className="text-[#1A1A1A]">Worldwide Shipping</strong> - We ship to 60+
            countries including all EU member states.
          </p>
          <p>
            <strong className="text-[#1A1A1A]">Delivery Time</strong> - EU: 7-14 business days |
            USA/UK: 10-18 business days
          </p>
          <p>
            <strong className="text-[#1A1A1A]">Free Shipping</strong> - On all orders over $50
          </p>
          <p>
            <strong className="text-[#1A1A1A]">Returns</strong> - Unopened items accepted within 14
            days of delivery. Custom orders are non-refundable.
          </p>
          <p>
            <strong className="text-[#1A1A1A]">Exchange Policy</strong> - Size exchanges accepted
            within 7 days. Please contact us to arrange.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen pt-16 md:pt-20">
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
        type="application/ld+json"
      />
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center gap-2 text-xs text-[#9A9A9A]">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 hover:text-[#1A1A1A] transition-colors"
        >
          <ArrowLeft className="size-3" />
          Back
        </button>
        <span>/</span>
        <Link href={`/${lng}/products`} className="hover:text-[#1A1A1A] transition-colors">
          Shop
        </Link>
        <span>/</span>
        <span className="text-[#1A1A1A]">{product.name}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Image Gallery */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 size-16 md:size-20 overflow-hidden border-2 transition-colors ${selectedImage === idx ? 'border-[#1A1A1A]' : 'border-transparent'}`}
                >
                  <ImageWithFallback
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
            {/* Main Image */}
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex-1 aspect-square bg-[#F5F5F5] overflow-hidden"
            >
              <ImageWithFallback
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          {/* Product Info */}
          <div className="md:pt-4">
            {/* Collection */}
            <p
              className="text-[#9A9A9A] uppercase text-xs tracking-widest mb-2"
              style={{ letterSpacing: '0.15em' }}
            >
              {product.collection}
            </p>

            {/* Name */}
            <h1
              className="text-[#1A1A1A] mb-4"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
                fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
                lineHeight: 1.2,
              }}
            >
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`size-3.5 ${star <= Math.round(product.rating) ? 'fill-[#C0C0C0] text-[#C0C0C0]' : 'text-[#E0E0E0]'}`}
                  />
                ))}
              </div>
              <span className="text-[#9A9A9A] text-xs">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-8">
              <span
                className="text-[#1A1A1A]"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 500,
                  fontSize: '1.6rem',
                }}
              >
                ${displayPrice.toFixed(2)}
              </span>
              {product.salePrice && (
                <>
                  <span className="text-[#9A9A9A] line-through" style={{ fontSize: '1.1rem' }}>
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="bg-[#F0F0F0] text-[#6A6A6A] text-xs px-2 py-0.5 uppercase tracking-wider">
                    Save ${(product.price - product.salePrice).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            <div className="w-12 h-px bg-[#E0E0E0] mb-8" />

            {/* Size Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p
                  className="text-[#1A1A1A] text-xs uppercase tracking-widest"
                  style={{ letterSpacing: '0.12em' }}
                >
                  Size <span className="text-[#C0C0C0]">*</span>
                </p>
                <button className="text-[#9A9A9A] text-xs underline">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-xs border transition-all ${
                      selectedSize === size
                        ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                        : 'border-[#E0E0E0] text-[#1A1A1A] hover:border-[#9A9A9A]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Shape Selector */}
            <div className="mb-6">
              <p
                className="text-[#1A1A1A] text-xs uppercase tracking-widest mb-3"
                style={{ letterSpacing: '0.12em' }}
              >
                Shape <span className="text-[#C0C0C0]">*</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.availableShapes.map((shape) => (
                  <button
                    key={shape}
                    onClick={() => setSelectedShape(shape)}
                    className={`px-4 py-2 text-xs border transition-all ${
                      selectedShape === shape
                        ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                        : 'border-[#E0E0E0] text-[#1A1A1A] hover:border-[#9A9A9A]'
                    }`}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>

            {/* Length Selector */}
            <div className="mb-8">
              <p
                className="text-[#1A1A1A] text-xs uppercase tracking-widest mb-3"
                style={{ letterSpacing: '0.12em' }}
              >
                Length <span className="text-[#C0C0C0]">*</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.availableLengths.map((length) => (
                  <button
                    key={length}
                    onClick={() => setSelectedLength(length)}
                    className={`px-4 py-2 text-xs border transition-all ${
                      selectedLength === length
                        ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                        : 'border-[#E0E0E0] text-[#1A1A1A] hover:border-[#9A9A9A]'
                    }`}
                  >
                    {length}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity + CTA */}
            <div className="flex gap-3 mb-4">
              <div className="flex items-center border border-[#E0E0E0]">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-3 text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="px-4 text-sm text-[#1A1A1A] min-w-[2.5rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-3 text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs uppercase tracking-widest transition-all ${
                  canAddToCart
                    ? 'bg-[#1A1A1A] text-white hover:bg-[#333]'
                    : 'bg-[#E0E0E0] text-[#9A9A9A] cursor-not-allowed'
                }`}
                style={{ letterSpacing: '0.15em' }}
              >
                <ShoppingBag className="size-4" />
                {!product.inStock ? 'Sold Out' : !canAddToCart ? 'Select Options' : 'Add to Bag'}
              </button>
            </div>

            {!selectedSize && (
              <p className="text-[#C0C0C0] text-xs mb-6">Please select size, shape, and length</p>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 py-5 border-y border-[#F0F0F0] mb-8">
              {[
                { icon: Truck, label: 'Free shipping over $50' },
                { icon: RotateCcw, label: '14-day returns' },
                { icon: Package, label: 'Handmade with care' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 text-center">
                  <Icon className="size-4 text-[#9A9A9A]" />
                  <span className="text-[#7A7A7A] text-[10px] leading-tight">{label}</span>
                </div>
              ))}
            </div>

            {/* Accordion */}
            <div className="space-y-0">
              {accordionSections.map((section) => (
                <div key={section.key} className="border-t border-[#F0F0F0]">
                  <button
                    onClick={() => setOpenSection(openSection === section.key ? null : section.key)}
                    className="w-full flex items-center justify-between py-4 text-[#1A1A1A] text-xs uppercase tracking-widest hover:opacity-70 transition-opacity"
                    style={{ letterSpacing: '0.12em' }}
                  >
                    {section.title}
                    {openSection === section.key ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </button>
                  {openSection === section.key && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="pb-5 overflow-hidden"
                    >
                      {section.content}
                    </motion.div>
                  )}
                </div>
              ))}
              <div className="border-t border-[#F0F0F0]" />
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="border-t border-[#F0F0F0] py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p
                className="text-[#9A9A9A] uppercase tracking-[0.2em] text-xs mb-3"
                style={{ letterSpacing: '0.2em' }}
              >
                You May Also Like
              </p>
              <h2
                className="text-[#1A1A1A]"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 400,
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                }}
              >
                Related Products
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cart Preview Dialog */}
      <CartPreviewDialog
        open={showCartPreview}
        onOpenChange={setShowCartPreview}
        addedItem={lastAddedItem}
        cartCount={cartCount}
        subtotal={subtotal}
      />
    </div>
  );
}
