'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/shared/ProductCard';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { LinkBase } from '@/components/shared/LinkBase';
import type { StorefrontProduct } from '@/types/product';
import type { ApiCampaign, ApiCampaignTranslation } from '@/lib/campaigns.api';

interface HomeStrings {
  heroEyebrow: string;
  heroTitle: string;
  heroShopNow: string;
  heroWholesale: string;
  heroDescLine1: string;
  heroDescLine2: string;
  newArrivalsEyebrow: string;
  newArrivalsTitle: string;
  bestSellersEyebrow: string;
  bestSellersTitle: string;
  viewAll: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaButton: string;
}

interface HomePageClientProps {
  heroCampaign: ApiCampaign | null;
  heroTranslation: ApiCampaignTranslation | null;
  newArrivals: StorefrontProduct[];
  bestSellers: StorefrontProduct[];
  strings: HomeStrings;
  lng: string;
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-[#9A9A9A] uppercase text-xs tracking-[0.2em] mb-3">{eyebrow}</p>
      <h2
        className="text-[#1A1A1A]"
        style={{ fontWeight: 400, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', letterSpacing: '0.02em' }}
      >
        {title}
      </h2>
    </div>
  );
}

function ProductSectionSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-[#F0F0F0] aspect-[3/4] mb-4" />
          <div className="h-4 bg-[#F0F0F0] rounded w-3/4 mb-2" />
          <div className="h-3 bg-[#F0F0F0] rounded w-1/4" />
        </div>
      ))}
    </div>
  );
}

export function HomePageClient({
  heroCampaign,
  heroTranslation,
  newArrivals,
  bestSellers,
  strings,
  lng,
}: HomePageClientProps) {
  const desktopSrc = heroCampaign?.desktopImageUrl ?? '/images/home/main-banner_desktop.svg';
  const mobileSrc = heroCampaign?.mobileImageUrl ?? '/images/home/main-banner_mobile.JPG';

  const eyebrow = heroTranslation?.eyebrow ?? strings.heroEyebrow;
  const heroTitle = heroTranslation?.title ?? strings.heroTitle;
  const heroSubtitle = heroTranslation?.subtitle ?? null;
  const ctaLabel = heroTranslation?.ctaLabel ?? strings.heroShopNow;
  const ctaUrl = heroCampaign?.ctaUrl ?? '/products';
  const secondaryLabel = heroTranslation?.secondaryCtaLabel ?? strings.heroWholesale;
  const secondaryUrl = heroTranslation?.secondaryCtaUrl ?? '/wholesales';
  const overlayOpacity = heroCampaign?.overlayOpacity ?? 0.35;

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <ImageWithFallback
          src={desktopSrc}
          alt="Silver14 Nail Hero"
          className="absolute inset-0 hidden md:block w-full h-full object-cover object-center"
          priority
        />
        <ImageWithFallback
          src={mobileSrc}
          alt="Silver14 Nail Hero Mobile"
          className="absolute inset-0 block md:hidden w-full h-full object-cover object-center"
          priority
        />
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-center px-6 max-w-[720px] mx-auto"
        >
          <p className="text-white/80 uppercase tracking-[0.35em] text-[11px] md:text-xs mb-6">
            {eyebrow}
          </p>
          <h1
            className="text-white mb-6"
            style={{
              fontWeight: 300,
              fontSize: 'clamp(3.5rem, 9vw, 6.5rem)',
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            {heroTitle}
          </h1>

          {heroSubtitle ? (
            <div className="mb-10">
              <p className="text-white/85 text-[15px] md:text-[18px] leading-relaxed max-w-[640px] mx-auto">
                {heroSubtitle}
              </p>
            </div>
          ) : (
            <div className="space-y-5 mb-10">
              <p className="text-white font-semibold text-[18px] md:text-[22px] leading-snug">
                {strings.heroDescLine1}
              </p>
              <p className="text-white/85 text-[15px] md:text-[18px] leading-relaxed max-w-[640px] mx-auto">
                {strings.heroDescLine2}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-4 w-full max-w-[520px] mx-auto">
            <LinkBase
              href={ctaUrl}
              className="h-[64px] bg-white text-black uppercase tracking-[0.25em] text-[13px] flex items-center justify-center gap-3 transition-all duration-300 hover:bg-neutral-100"
            >
              {ctaLabel}
              <ArrowRight className="size-4" />
            </LinkBase>
            <LinkBase
              href={secondaryUrl}
              className="h-[64px] border border-white/70 text-white uppercase tracking-[0.25em] text-[13px] flex items-center justify-center transition-all duration-300 hover:bg-white/10"
            >
              {secondaryLabel}
            </LinkBase>
          </div>
        </motion.div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="flex justify-between mb-12">
          <SectionTitle eyebrow={strings.newArrivalsEyebrow} title={strings.newArrivalsTitle} />
          <LinkBase href={`/${lng}/products?filter=new`} className="text-xs uppercase">
            {strings.viewAll}
          </LinkBase>
        </div>
        {newArrivals.length === 0 ? (
          <ProductSectionSkeleton />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* BEST SELLERS */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="flex justify-between mb-12">
          <SectionTitle eyebrow={strings.bestSellersEyebrow} title={strings.bestSellersTitle} />
          <LinkBase href={`/${lng}/products?filter=bestseller`} className="text-xs uppercase">
            {strings.viewAll}
          </LinkBase>
        </div>
        {bestSellers.length === 0 ? (
          <ProductSectionSkeleton />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-[#1A1A1A] py-16 text-center">
        <h2 className="text-white text-2xl mb-4">{strings.ctaTitle}</h2>
        <p className="text-white/60 mb-8 max-w-md mx-auto">{strings.ctaDescription}</p>
        <LinkBase
          href="/wholesales"
          className="bg-white text-black px-8 py-3 uppercase text-xs tracking-widest"
        >
          {strings.ctaButton} <ArrowRight className="inline size-3 ml-2" />
        </LinkBase>
      </section>
    </>
  );
}
