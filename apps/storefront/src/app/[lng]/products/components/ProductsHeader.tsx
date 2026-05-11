import { COLLECTIONS } from '@/MOCK_DATAS/products';
import { TFunction } from 'i18next';

interface Props {
  activeCollection: string;
  t: TFunction;
}

export function ProductsHeader({ activeCollection, t }: Props) {
  const currentCollection = COLLECTIONS.find((c) => c.id === activeCollection);

  return (
    <div className="text-center py-14 px-4 border-b border-[#E8E8E8]">
      <p
        className="text-[#9A9A9A] uppercase tracking-[0.2em] text-xs mb-3"
        style={{ letterSpacing: '0.2em' }}
      >
        {activeCollection !== 'all' ? currentCollection?.label : t('allProducts')}
      </p>
      <h1
        className="text-[#1A1A1A]"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 400,
          fontSize: 'clamp(1.8rem, 5vw, 3rem)',
        }}
      >
        {activeCollection !== 'all' ? currentCollection?.label : t('theCollection')}
      </h1>
    </div>
  );
}
