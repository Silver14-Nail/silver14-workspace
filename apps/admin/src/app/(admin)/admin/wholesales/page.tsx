import {
  listAccounts,
  listEnquiries,
  listTiers,
  getWholesaleStats,
} from '../../../../services/wholesales.service';
import { WholesalesClient } from './_components/WholesalesClient';
import type { AccountListQuery, EnquiryListQuery, WholesaleEnquiryStatus } from './types';

interface WholesalesPageProps {
  searchParams: Promise<{
    tab?: string;
    page?: string;
    search?: string;
    isActive?: string;
    status?: string;
  }>;
}

const EMPTY_ACCOUNTS = {
  items: [],
  pagination: { totalItems: 0, itemCount: 0, itemsPerPage: 20, totalPages: 0, currentPage: 1 },
};
const EMPTY_ENQUIRIES = {
  items: [],
  pagination: { totalItems: 0, itemCount: 0, itemsPerPage: 20, totalPages: 0, currentPage: 1 },
};

export default async function AdminWholesalesPage({ searchParams }: WholesalesPageProps) {
  const params = await searchParams;
  const tab = (params.tab as string) || 'accounts';
  const page = params.page ? parseInt(params.page, 10) : 1;

  const accountQuery: AccountListQuery = {
    page,
    limit: 20,
    search: params.search || undefined,
    isActive: params.isActive === 'true' ? true : params.isActive === 'false' ? false : undefined,
  };

  const enquiryQuery: EnquiryListQuery = {
    page,
    limit: 20,
    status: params.status as WholesaleEnquiryStatus | undefined,
  };

  const [accountsResult, enquiriesResult, tiersResult, statsResult] = await Promise.allSettled([
    listAccounts(accountQuery),
    listEnquiries(enquiryQuery),
    listTiers(),
    getWholesaleStats(),
  ]);

  const initialAccounts =
    accountsResult.status === 'fulfilled' ? accountsResult.value : EMPTY_ACCOUNTS;
  const initialEnquiries =
    enquiriesResult.status === 'fulfilled' ? enquiriesResult.value : EMPTY_ENQUIRIES;
  const initialTiers = tiersResult.status === 'fulfilled' ? tiersResult.value : [];
  const initialStats = statsResult.status === 'fulfilled' ? statsResult.value : null;

  return (
    <WholesalesClient
      initialAccounts={initialAccounts}
      initialEnquiries={initialEnquiries}
      initialTiers={initialTiers}
      initialStats={initialStats}
      currentTab={tab}
      currentAccountQuery={accountQuery}
      currentEnquiryQuery={enquiryQuery}
    />
  );
}
