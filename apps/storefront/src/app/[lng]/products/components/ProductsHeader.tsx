import { TFunction } from 'i18next';

interface Props {
  activeCollectionLabel: string | null;
  t: TFunction;
}

export function ProductsHeader({ activeCollectionLabel, t }: Props) {
  return (
    <div className="text-center py-14 px-4 border-b border-[#E8E8E8]">
      <p
        className="text-[#9A9A9A] uppercase tracking-[0.2em] text-xs mb-3"
        style={{ letterSpacing: '0.2em' }}
      >
        {activeCollectionLabel ? activeCollectionLabel : t('allProducts')}
      </p>
      <h1
        className="text-[#1A1A1A]"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 400,
          fontSize: 'clamp(1.8rem, 5vw, 3rem)',
        }}
      >
        {activeCollectionLabel ? activeCollectionLabel : t('theCollection')}
      </h1>
    </div>
  );
}
