'use client';

import { useT } from 'next-i18next/client';

export default function SizeGuidePage() {
  const { t } = useT('size-guide');

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      {/* Hero */}
      <div className="mx-auto mb-14 max-w-4xl px-4 text-center sm:px-6">
        <h1
          className="mb-5 text-[#1A1A1A]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 300,
            lineHeight: 1.15,
          }}
        >
          {t('hero.title')}
        </h1>

        <div className="mx-auto mb-6 h-px w-10 bg-[#C0A882]" />

        <p className="mx-auto max-w-xl text-sm leading-relaxed text-[#5A5A5A]">
          {t('hero.description')}
        </p>

        <p className="mx-auto mt-2 max-w-xl text-xs italic leading-relaxed text-[#9A9A9A]">
          {t('hero.warning')}
        </p>
      </div>

      {/* How to Measure */}
      <section className="mx-auto mb-16 max-w-4xl px-4 sm:px-6">
        <h2
          className="mb-8 text-center text-[#1A1A1A]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.75rem',
            fontWeight: 400,
            letterSpacing: '0.04em',
          }}
        >
          {t('measure.title')}
        </h2>

        <div className="overflow-hidden rounded-sm border border-[#F0F0F0] shadow-sm">
          <img
            src="/images/InstructionGuide/image2.jpg"
            alt={t('measure.alt')}
            className="w-full object-cover"
          />
        </div>
      </section>

      {/* Size Chart */}
      <section className="mx-auto mb-16 max-w-4xl px-4 sm:px-6">
        <h2
          className="mb-8 text-center text-[#1A1A1A]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.75rem',
            fontWeight: 400,
            letterSpacing: '0.04em',
          }}
        >
          {t('sizeChart.title')}
        </h2>

        <div className="overflow-hidden rounded-sm border border-[#F0F0F0] shadow-sm">
          <img
            src="/images/InstructionGuide/image3.jpg"
            alt={t('sizeChart.alt')}
            className="w-full object-cover"
          />
        </div>
      </section>

      {/* Nail Shapes */}
      <section className="mx-auto mb-16 max-w-4xl px-4 sm:px-6">
        <h2
          className="mb-8 text-center text-[#1A1A1A]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.75rem',
            fontWeight: 400,
            letterSpacing: '0.04em',
          }}
        >
          {t('shapes.title')}
        </h2>

        <div className="overflow-hidden rounded-sm border border-[#F0F0F0] shadow-sm">
          <img
            src="/images/InstructionGuide/image4.jpg"
            alt={t('shapes.alt')}
            className="w-full object-cover"
          />
        </div>
      </section>

      {/* How to Use */}
      <section className="mx-auto mb-6 max-w-4xl px-4 sm:px-6">
        <h2
          className="mb-4 text-center text-[#1A1A1A]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.75rem',
            fontWeight: 400,
            letterSpacing: '0.04em',
          }}
        >
          {t('usage.title')}
        </h2>

        {/* Notes */}
        <div className="mb-8 rounded-sm border border-[#E8DDD0] bg-[#FAF8F5] p-6">
          <p
            className="mb-4 text-xs uppercase tracking-widest text-[#8A7A6A]"
            style={{ letterSpacing: '0.15em' }}
          >
            {t('usage.notesLabel')}
          </p>

          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="flex-shrink-0 text-lg">✨</span>

              <p className="text-sm leading-relaxed text-[#3A3A3A]">{t('usage.adhesive')}</p>
            </div>

            <div className="flex gap-3">
              <span className="flex-shrink-0 text-lg">✨</span>

              <p className="text-sm leading-relaxed text-[#3A3A3A]">{t('usage.glue')}</p>
            </div>
          </div>
        </div>

        {/* How to Use images */}
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-[#F0F0F0] bg-[#FAF8F5] shadow-sm">
            <p className="border-b border-[#F0F0F0] bg-[#FAF8F5] py-3 text-center text-[11px] uppercase tracking-[0.18em] text-[#9A9A9A]">
              {t('usage.tabsTitle')}
            </p>

            <div className="flex items-start justify-center p-4">
              <img
                src="/images/InstructionGuide/image1.jpg"
                alt={t('usage.tabsAlt')}
                className="h-auto w-full object-contain"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#F0F0F0] bg-[#FAF8F5] shadow-sm">
            <p className="border-b border-[#F0F0F0] bg-[#FAF8F5] py-3 text-center text-[11px] uppercase tracking-[0.18em] text-[#9A9A9A]">
              {t('usage.glueTitle')}
            </p>

            <div className="flex items-start justify-center p-4">
              <img
                src="/images/InstructionGuide/image5.jpg"
                alt={t('usage.glueAlt')}
                className="h-auto w-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="mt-14 px-4 text-center">
        <p className="mb-5 text-sm text-[#9A9A9A]">{t('cta.description')}</p>

        <a
          href="/products"
          className="inline-block bg-[#1A1A1A] px-10 py-3.5 text-xs uppercase tracking-widest text-white transition-colors hover:bg-[#3A3A3A]"
          style={{ letterSpacing: '0.15em' }}
        >
          {t('cta.button')}
        </a>
      </div>
    </div>
  );
}
