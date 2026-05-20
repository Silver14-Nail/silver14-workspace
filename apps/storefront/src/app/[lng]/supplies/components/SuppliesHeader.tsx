import { TFunction } from 'i18next';

interface Props {
  t: TFunction;
}

export function SuppliesHeader({ t }: Props) {
  return (
    <div className="text-center py-14 px-4 border-b border-[#E8E8E8]">
      <p
        className="text-[#9A9A9A] uppercase tracking-[0.2em] text-xs mb-3"
        style={{ letterSpacing: '0.2em' }}
      >
        {t('subtitle')}
      </p>
      <h1
        className="text-[#1A1A1A]"
        style={{
          fontWeight: 400,
          fontSize: 'clamp(1.8rem, 5vw, 3rem)',
        }}
      >
        {t('title')}
      </h1>
    </div>
  );
}
