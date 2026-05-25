import axios from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

const http = axios.create({ baseURL: BASE });

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
  try {
    console.log('call fetchCampaignByPlacement');
    const { data } = await http.get<ApiCampaign>(
      `/client-api/campaigns/${placement}?locale=${locale}`,
    );
    console.log('data', data);
    return data ?? null;
  } catch (eror) {
    console.log(eror);
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
