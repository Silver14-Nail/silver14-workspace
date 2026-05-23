import { getBase } from './api-base';

export type CampaignType =
  | 'hero'
  | 'promotion'
  | 'seasonal'
  | 'collection'
  | 'supply'
  | 'wholesale'
  | 'announcement'
  | 'landing_page';

export type CampaignPlacement =
  | 'homepage_hero'
  | 'homepage_top'
  | 'homepage_middle'
  | 'homepage_bottom'
  | 'collection_page'
  | 'product_page'
  | 'supply_page'
  | 'wholesale_page'
  | 'global';

export type CampaignStatus = 'draft' | 'active' | 'scheduled' | 'expired' | 'archived';

export interface ApiCampaignTranslation {
  locale: string;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  ctaLabel: string | null;
  secondaryCtaLabel: string | null;
  secondaryCtaUrl: string | null;
}

export interface ApiCampaign {
  id: string;
  name: string;
  type: CampaignType;
  placement: CampaignPlacement;
  status: CampaignStatus;
  desktopImageUrl: string | null;
  mobileImageUrl: string | null;
  ctaUrl: string | null;
  priority: number;
  startsAt: string | null;
  endsAt: string | null;
  overlayOpacity: number;
  translations: ApiCampaignTranslation[];
}

export async function fetchCampaignByPlacement(
  placement: CampaignPlacement,
  locale: string,
): Promise<ApiCampaign | null> {
  const base = getBase();
  const res = await fetch(
    `${base}/client-api/campaigns/${placement}?locale=${locale}`,
    { next: { revalidate: 60 } },
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data ?? null;
}

export function getCampaignTranslation(
  campaign: ApiCampaign,
  locale: string,
): ApiCampaignTranslation | null {
  return (
    campaign.translations.find((t) => t.locale === locale) ??
    campaign.translations.find((t) => t.locale === 'en') ??
    campaign.translations[0] ??
    null
  );
}
