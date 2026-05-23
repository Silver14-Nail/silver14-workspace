import { listCampaigns } from '../../../../services/campaigns.service';
import { CampaignsClient } from './CampaignsClient';
import type { CampaignListResponse } from './types';

const EMPTY_PAGINATION = {
  totalItems: 0,
  itemCount: 0,
  itemsPerPage: 20,
  totalPages: 0,
  currentPage: 1,
};

export default async function AdminCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; limit?: string; placement?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const limit = Math.min(100, Math.max(5, Number(params.limit ?? 20)));
  const search = params.search ?? '';
  const placement = params.placement ?? '';
  const status = params.status ?? '';

  const result = await listCampaigns({
    page,
    limit,
    search: search || undefined,
    placement: placement || undefined,
    status: status || undefined,
  }).catch(() => null);

  const campaigns: CampaignListResponse = result ?? {
    items: [],
    pagination: { ...EMPTY_PAGINATION, itemsPerPage: limit, currentPage: page },
  };

  return (
    <CampaignsClient
      initialCampaigns={campaigns}
      currentPage={page}
      currentSearch={search}
      currentLimit={limit}
      currentPlacement={placement}
      currentStatus={status}
    />
  );
}
