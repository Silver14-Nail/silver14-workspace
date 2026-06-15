import { Suspense } from 'react';
import { getT } from 'next-i18next/server';
import {
  fetchCampaignByPlacement,
  getCampaignTranslation,
} from '@/features/campaigns/campaigns.api';
import { HomePageClient } from './HomePageClient';
import { HomeProductSections, HomeSectionsSkeleton } from './HomeProductSections';

export default async function HomePage({ params }: { params: Promise<{ lng: string }> }) {
  const { lng } = await params;
  const { t } = await getT('home');

  const heroCampaign = await fetchCampaignByPlacement('homepage_hero', lng).catch(() => null);
  const heroTranslation = heroCampaign ? getCampaignTranslation(heroCampaign, lng) : null;

  const strings = {
    heroEyebrow: t('hero.eyebrow'),
    heroTitle: t('hero.title'),
    heroShopNow: t('hero.shopNow'),
    heroWholesale: t('hero.wholesale'),
    heroDescLine1: t('hero.descriptionLine1'),
    heroDescLine2: t('hero.descriptionLine2'),
    ctaTitle: t('cta.title'),
    ctaDescription: t('cta.description'),
    ctaButton: t('cta.button'),
  };

  return (
    <>
      <HomePageClient
        heroCampaign={heroCampaign}
        heroTranslation={heroTranslation}
        strings={strings}
      />
      <Suspense fallback={<HomeSectionsSkeleton />}>
        <HomeProductSections lng={lng} />
      </Suspense>
    </>
  );
}
