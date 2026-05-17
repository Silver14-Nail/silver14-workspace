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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Desktop Image */}
        <ImageWithFallback
          src={heroImages.desktop}
          alt="Silver14 Nail Hero"
          className="
            absolute inset-0
            hidden md:block
            w-full h-full
            object-cover object-center
          "
        />

        {/* Mobile Image */}
        <ImageWithFallback
          src={heroImages.mobile}
          alt="Silver14 Nail Hero Mobile"
          className="
            absolute inset-0
            block md:hidden
            w-full h-full
            object-cover object-center
          "
        />

        {/* Softer overlay */}
        <div className="absolute inset-0 bg-black/35" />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-center px-6 max-w-[720px] mx-auto"
        >
          {/* Eyebrow */}
          <p className="text-white/80 uppercase tracking-[0.35em] text-[11px] md:text-xs mb-6">
            {t('hero.eyebrow')}
          </p>

          {/* Title */}
          <h1
            className="text-white mb-6"
            style={{
              // fontFamily: "'Pirata One', 'UnifrakturMaguntia', 'Old English Text MT', cursive",
              fontWeight: 300,
              fontSize: 'clamp(3.5rem, 9vw, 6.5rem)',
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            {t('hero.title')}
          </h1>

          {/* Description */}
          <div className="space-y-5 mb-10">
            <p className="text-white font-semibold text-[18px] md:text-[22px] leading-snug">
              {t('hero.descriptionLine1')}
            </p>

            <p className="text-white/85 text-[15px] md:text-[18px] leading-relaxed max-w-[640px] mx-auto">
              {t('hero.descriptionLine2')}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-4 w-full max-w-[520px] mx-auto">
            <LinkBase
              href="/products"
              className="
          h-[64px]
          bg-white
          text-black
          uppercase
          tracking-[0.25em]
          text-[13px]
          flex items-center justify-center gap-3
          transition-all duration-300
          hover:bg-neutral-100
        "
            >
              {t('hero.shopNow')}
              <ArrowRight className="size-4" />
            </LinkBase>

            <LinkBase
              href="/wholesales"
              className="
          h-[64px]
          border border-white/70
          text-white
          uppercase
          tracking-[0.25em]
          text-[13px]
          flex items-center justify-center
          transition-all duration-300
          hover:bg-white/10
        "
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
