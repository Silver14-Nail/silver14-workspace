import { listCoupons, getCouponStats } from '../../../../services/coupons.service';
import { CouponsClient } from './_components/CouponsClient';
import type { CouponListQuery, DiscountType } from './types';

interface CouponsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    isActive?: string;
    discountType?: string;
    isExpired?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function AdminCouponsPage({ searchParams }: CouponsPageProps) {
  const params = await searchParams;

  const query: CouponListQuery = {
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: 20,
    search: params.search || undefined,
    isActive: params.isActive === 'true' ? true : params.isActive === 'false' ? false : undefined,
    discountType: params.discountType as DiscountType | undefined,
    isExpired:
      params.isExpired === 'true' ? true : params.isExpired === 'false' ? false : undefined,
    sortBy: (params.sortBy as CouponListQuery['sortBy']) || 'createdAt',
    sortOrder: (params.sortOrder as 'ASC' | 'DESC') || 'DESC',
  };

  const [couponsResult, statsResult] = await Promise.allSettled([
    listCoupons(query),
    getCouponStats(),
  ]);

  const initialCoupons =
    couponsResult.status === 'fulfilled'
      ? couponsResult.value
      : {
          items: [],
          pagination: {
            totalItems: 0,
            itemCount: 0,
            itemsPerPage: 20,
            totalPages: 0,
            currentPage: 1,
          },
        };

  const initialStats = statsResult.status === 'fulfilled' ? statsResult.value : null;

  return (
    <CouponsClient
      initialCoupons={initialCoupons}
      initialStats={initialStats}
      currentQuery={query}
    />
  );
}
