export type DiscountType = 'percent' | 'fixed' | 'free_shipping';

export type CouponRestrictionType = 'product' | 'shape' | 'category' | 'min_qty' | 'new_user';

export interface CouponRestriction {
  id: string;
  restrictionType: CouponRestrictionType;
  refId: string | null;
  refLabel: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CouponWhitelistUser {
  id: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CouponUsageOrder {
  id: string;
  status: string;
  total: number;
  currency: string;
}

export interface CouponUsage {
  id: string;
  discountApplied: number;
  createdAt: string;
  updatedAt: string;
  user: { id: string; fullName: string; email: string } | null;
  order: CouponUsageOrder;
}

export interface CouponListItem {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number;
  maxUsesTotal: number | null;
  maxUsesPerUser: number;
  usedCount: number;
  isActive: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CouponDetail extends CouponListItem {
  restrictions: CouponRestriction[];
  whitelist: CouponWhitelistUser[];
  usages: CouponUsage[];
}

export interface Pagination {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface CouponListResponse {
  items: CouponListItem[];
  pagination: Pagination;
}

export interface CouponUsageListResponse {
  items: CouponUsage[];
  pagination: Pagination;
}

export interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  inactiveCoupons: number;
  expiredCoupons: number;
  expiringSoon: number;
  totalUsages: number;
  totalDiscountGranted: number;
}

export interface CouponListQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  discountType?: DiscountType;
  isExpired?: boolean;
  sortBy?: 'code' | 'createdAt' | 'usedCount' | 'expiresAt' | 'discountValue';
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateCouponPayload {
  code: string;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderAmount?: number;
  maxUsesTotal?: number | null;
  maxUsesPerUser?: number;
  isActive?: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
}

export type UpdateCouponPayload = Partial<CreateCouponPayload>;

export interface AddRestrictionPayload {
  restrictionType: CouponRestrictionType;
  refId?: string | null;
  refLabel?: string | null;
}
