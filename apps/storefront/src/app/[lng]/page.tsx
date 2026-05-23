import { getT } from 'next-i18next/server';
import { fetchCampaignByPlacement, getCampaignTranslation } from '@/lib/campaigns.api';
import { fetchProducts } from '@/lib/products.api';
import { adaptListItem } from '@/lib/product.adapter';
import { HomePageClient } from './HomePageClient';

const REVALIDATE = { next: { revalidate: 120 } } satisfies RequestInit;

export default async function HomePage({ params }: { params: Promise<{ lng: string }> }) {
  const { lng } = await params;
  const { t } = await getT('home');

  const [heroCampaign, newArrivalsData, bestSellersData] = await Promise.all([
    fetchCampaignByPlacement('homepage_hero', lng).catch(() => null),
    fetchProducts({ filterBy: 'new', limit: 4, locale: lng }, REVALIDATE).catch(() => null),
    fetchProducts({ filterBy: 'bestseller', limit: 4, locale: lng }, REVALIDATE).catch(() => null),
  ]);

  const heroTranslation = heroCampaign ? getCampaignTranslation(heroCampaign, lng) : null;
  const newArrivals = (newArrivalsData?.items ?? []).map(adaptListItem);
  const bestSellers = (bestSellersData?.items ?? []).map(adaptListItem);

  const strings = {
    heroEyebrow: t('hero.eyebrow'),
    heroTitle: t('hero.title'),
    heroShopNow: t('hero.shopNow'),
    heroWholesale: t('hero.wholesale'),
    heroDescLine1: t('hero.descriptionLine1'),
    heroDescLine2: t('hero.descriptionLine2'),
    newArrivalsEyebrow: t('sections.newArrivalsEyebrow'),
    newArrivalsTitle: t('sections.newArrivalsTitle'),
    bestSellersEyebrow: t('sections.bestSellersEyebrow'),
    bestSellersTitle: t('sections.bestSellersTitle'),
    viewAll: t('sections.viewAll'),
    ctaTitle: t('cta.title'),
    ctaDescription: t('cta.description'),
    ctaButton: t('cta.button'),
  };

  return (
    <HomePageClient
      heroCampaign={heroCampaign}
      heroTranslation={heroTranslation}
      newArrivals={newArrivals}
      bestSellers={bestSellers}
      strings={strings}
    />
  );
}
