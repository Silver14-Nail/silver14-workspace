import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

interface Props {
  images: string[];
  productName: string;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function ImageGallery({ images, productName, selectedIndex, onSelect }: Props) {
  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden bg-white">
        <ImageWithFallback
          src={images[selectedIndex]}
          alt={productName}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover object-center"
        />
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
