'use client';

import { memo } from 'react';
import { motion } from 'motion/react';
import { useT } from 'next-i18next/client';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

interface ImageGalleryProps {
  images: string[];
  productName: string;
  hasSale: boolean;
  selectedIndex: number;
  onSelect: (idx: number) => void;
}

export const ImageGallery = memo(function ImageGallery({
  images,
  productName,
  hasSale,
  selectedIndex,
  onSelect,
}: ImageGalleryProps) {
  const { t } = useT('product-details');

  const handleDragEnd = (_event: any, info: any) => {
    const threshold = 50;
    if (info.offset.x < -threshold && selectedIndex < images.length - 1) {
      onSelect(selectedIndex + 1);
    } else if (info.offset.x > threshold && selectedIndex > 0) {
      onSelect(selectedIndex - 1);
    }
  };

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3 md:gap-4 items-start select-none">
      {/* Thumbnail strip */}
      <div
        className="flex sm:flex-col justify-start gap-2 overflow-x-auto sm:overflow-y-auto no-scrollbar w-full sm:w-20 md:w-24 flex-shrink-0"
        role="list"
      >
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            className={`relative flex-shrink-0 size-16 sm:size-20 md:size-24 overflow-hidden border transition-all duration-200 ${
              selectedIndex === idx ? 'border-[#1A1A1A]' : 'border-[#E8E8E8]'
            }`}
          >
            <ImageWithFallback
              src={img}
              alt=""
              fill
              sizes="96px"
              className="object-cover object-center"
            />
          </button>
        ))}
      </div>

      {/* Main image — all images rendered simultaneously so Next.js preloads them;
          CSS opacity transition switches between them instantly with no network wait. */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        className="w-full sm:flex-1 sm:min-w-0 relative touch-pan-y bg-[#F8F8F8] cursor-grab active:cursor-grabbing"
        style={{ aspectRatio: '1 / 1' }}
      >
        {images.map((img, idx) => (
          <div
            key={img}
            className="absolute inset-0 transition-opacity duration-150"
            style={{ opacity: idx === selectedIndex ? 1 : 0, pointerEvents: idx === selectedIndex ? 'auto' : 'none' }}
          >
            <ImageWithFallback
              src={img}
              alt={idx === 0 ? productName : ''}
              fill
              sizes="(max-width: 640px) 100vw, 60vw"
              className="object-cover object-center"
              priority={idx === 0}
            />
          </div>
        ))}

        {hasSale && (
          <div className="absolute top-4 left-4 bg-[#1A1A1A] text-white text-[10px] px-2 py-1 uppercase tracking-widest z-10">
            {t('gallery.saleBadge')}
          </div>
        )}
      </motion.div>
    </div>
  );
});
