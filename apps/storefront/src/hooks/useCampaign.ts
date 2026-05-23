'use client';

import { useState, useEffect } from 'react';
import {
  fetchCampaignByPlacement,
  getCampaignTranslation,
  type ApiCampaign,
  type ApiCampaignTranslation,
  type CampaignPlacement,
} from '@/lib/campaigns.api';

export interface UseCampaignResult {
  campaign: ApiCampaign | null;
  translation: ApiCampaignTranslation | null;
  loading: boolean;
}

export function useCampaign(placement: CampaignPlacement, locale: string): UseCampaignResult {
  const [campaign, setCampaign] = useState<ApiCampaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchCampaignByPlacement(placement, locale)
      .then((data) => {
        if (!cancelled) setCampaign(data);
      })
      .catch(() => {
        if (!cancelled) setCampaign(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [placement, locale]);

  const translation = campaign ? getCampaignTranslation(campaign, locale) : null;

  return { campaign, translation, loading };
}
