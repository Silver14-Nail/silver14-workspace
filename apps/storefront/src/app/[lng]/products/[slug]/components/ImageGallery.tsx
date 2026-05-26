'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 50;
    if (info.offset.x < -threshold && selectedIndex < images.length - 1) {
      onSelect(selectedIndex + 1);
    } else if (info.offset.x > threshold && selectedIndex > 0) {
      onSelect(selectedIndex - 1);
    }
  };

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3 md:gap-4 items-start select-none">
      <div
        className="flex justify-center sm:justify-start sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto no-scrollbar w-full sm:w-20 md:w-24"
        role="list"
      >
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            className={`flex-shrink-0 size-16 sm:size-20 md:size-24 overflow-hidden border transition-all duration-200 ${
              selectedIndex === idx ? 'border-[#1A1A1A]' : 'border-[#E8E8E8]'
            }`}
          >
            <ImageWithFallback src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      <div className="flex-1 aspect-square bg-[#F8F8F8] relative touch-pan-y w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className="w-full h-full cursor-grab active:cursor-grabbing flex flex-col items-start justify-start"
          >
            <ImageWithFallback
              src={images[selectedIndex]}
              alt={productName}
              className="w-full h-full object-cover object-top"
            />
          </motion.div>
        </AnimatePresence>

        {hasSale && (
          <div className="absolute top-4 left-4 bg-[#1A1A1A] text-white text-[10px] px-2 py-1 uppercase tracking-widest z-10">
            {t('gallery.saleBadge')}
          </div>
        )}
      </div>
    </div>
  );
});
