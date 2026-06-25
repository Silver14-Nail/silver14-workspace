'use client';

import { useRef } from 'react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

interface Props {
  images: string[];
  productName: string;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function ImageGallery({ images, productName, selectedIndex, onSelect }: Props) {
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(deltaX) < 40) return;

    if (deltaX < 0) {
      // swipe left → next
      onSelect((selectedIndex + 1) % images.length);
    } else {
      // swipe right → prev
      onSelect((selectedIndex - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className="relative aspect-square overflow-hidden bg-white"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <ImageWithFallback
          src={images[selectedIndex]}
          alt={productName}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover object-center"
        />

        {/* Dot indicators — mobile only */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 sm:hidden">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`block rounded-full transition-all ${
                  idx === selectedIndex
                    ? 'w-4 h-1.5 bg-[#1A1A1A]'
                    : 'w-1.5 h-1.5 bg-[#1A1A1A]/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              className={`relative aspect-square bg-white overflow-hidden border-2 transition-all ${
                selectedIndex === idx
                  ? 'border-[#1A1A1A]'
                  : 'border-transparent hover:border-[#C0C0C0]'
              }`}
            >
              <ImageWithFallback
                src={img}
                alt={`${productName} - View ${idx + 1}`}
                fill
                sizes="20vw"
                className="object-contain object-center"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
