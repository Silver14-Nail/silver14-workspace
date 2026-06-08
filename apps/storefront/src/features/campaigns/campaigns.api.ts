const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

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

// Uses native fetch so Next.js ISR can track and revalidate this data.
// Tag 'homepage-campaign' allows on-demand revalidation from the admin
// via /api/revalidate (see apps/storefront/src/app/api/revalidate/route.ts).
export async function fetchCampaignByPlacement(
  placement: CampaignPlacement,
  locale: string,
): Promise<ApiCampaign | null> {
  try {
    const res = await fetch(`${BASE}/client-api/campaigns/${placement}?locale=${locale}`, {
      next: { revalidate: 30, tags: ['homepage-campaign'] },
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || text === 'null') return null;
    return JSON.parse(text) as ApiCampaign;
  } catch {
    return null;
  }
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
