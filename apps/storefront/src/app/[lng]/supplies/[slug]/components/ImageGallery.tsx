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
      <div className="aspect-square bg-[#F8F8F8] overflow-hidden">
        <ImageWithFallback
          src={images[selectedIndex]}
          alt={productName}
          className="w-full h-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              className={`aspect-square bg-[#F8F8F8] overflow-hidden border-2 transition-all ${
                selectedIndex === idx
                  ? 'border-[#1A1A1A]'
                  : 'border-transparent hover:border-[#C0C0C0]'
              }`}
            >
              <ImageWithFallback
                src={img}
                alt={`${productName} - View ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
