'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useT } from 'next-i18next/client';

import { ProductCard } from '@/components/shared/ProductCard';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { LinkBase } from '@/components/shared/LinkBase';
import { products, heroImages } from '@/MOCK_DATAS/products';

const newArrivals = products.filter((p) => p.isNew).slice(0, 4);
const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);

const SectionTitle = ({
  eyebrow,
  title,
  center = false,
}: {
  eyebrow: string;
  title: string;
  center?: boolean;
}) => (
  <div className={center ? 'text-center' : ''}>
    <p className="text-[#9A9A9A] uppercase text-xs tracking-[0.2em] mb-3">{eyebrow}</p>
    <h2
      className="text-[#1A1A1A]"
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontWeight: 400,
        fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
        letterSpacing: '0.02em',
      }}
    >
      {title}
    </h2>
  </div>
);

export default function HomePage() {
  const { t } = useT('home');

  return (
    <>
      {/* HERO */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <ImageWithFallback
          src={heroImages.main}
          alt="Silver14 Nail Hero"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/50" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-center px-6 max-w-2xl mx-auto"
        >
          <p className="text-white/70 uppercase tracking-[0.3em] text-xs mb-5">
            {t('hero.eyebrow')}
          </p>

          <h1
            className="text-white mb-6"
            style={{
              fontFamily: "'Pirata One', 'UnifrakturMaguntia', 'Old English Text MT', cursive",
              fontWeight: 400,
              fontSize: 'clamp(3rem, 8vw, 5.5rem)',
              letterSpacing: '0.02em',
              lineHeight: 1.1,
            }}
          >
            {t('hero.title')}
          </h1>

          <p className="text-white/80 mb-10 text-sm md:text-base leading-relaxed tracking-wide">
            <b className="text-[16px]">{t('hero.descriptionLine1')}</b>
            <br />
            {t('hero.descriptionLine2')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LinkBase
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#1A1A1A] px-9 py-4 text-xs uppercase tracking-[0.15em]"
            >
              {t('hero.shopNow')} <ArrowRight className="size-3.5" />
            </LinkBase>

            <LinkBase
              href="/wholesales"
              className="inline-flex items-center justify-center gap-2 border border-white text-white px-9 py-4 text-xs uppercase tracking-[0.15em]"
            >
              {t('hero.wholesale')}
            </LinkBase>
          </div>
        </motion.div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="flex justify-between mb-12">
          <SectionTitle
            eyebrow={t('sections.newArrivalsEyebrow')}
            title={t('sections.newArrivalsTitle')}
          />
          <LinkBase href="/products?filter=new" className="text-xs uppercase">
            {t('sections.viewAll')}
          </LinkBase>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="flex justify-between mb-12">
          <SectionTitle
            eyebrow={t('sections.bestSellersEyebrow')}
            title={t('sections.bestSellersTitle')}
          />
          <LinkBase href="/products?filter=bestseller" className="text-xs uppercase">
            {t('sections.viewAll')}
          </LinkBase>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {bestSellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1A1A1A] py-16 text-center">
        <h2 className="text-white text-2xl mb-4">{t('cta.title')}</h2>
        <p className="text-white/60 mb-8 max-w-md mx-auto">{t('cta.description')}</p>

        <LinkBase
          href="/wholesales"
          className="bg-white text-black px-8 py-3 uppercase text-xs tracking-widest"
        >
          {t('cta.button')} <ArrowRight className="inline size-3 ml-2" />
        </LinkBase>
      </section>
    </>
  );
}
