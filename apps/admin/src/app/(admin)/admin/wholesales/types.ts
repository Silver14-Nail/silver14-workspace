export type WholesaleEnquiryStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';
export type WholesaleTierName = 'Bronze' | 'Silver' | 'Gold';
export type NewsletterStatus = 'active' | 'unsubscribed';

export interface Pagination {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface WholesaleTier {
  id: string;
  name: WholesaleTierName;
  minMonthlyQty: number;
  discountPercent: number;
  maxDiscountAmount: number | null;
  freeShipping: boolean;
  minOrderAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WholesaleAccount {
  id: string;
  businessName: string | null;
  country: string;
  creditLimit: number;
  currentBalance: number;
  isActive: boolean;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; fullName: string; email: string };
  tier: WholesaleTier;
  approvedBy: { id: string; fullName: string; email: string } | null;
}

export interface WholesaleEnquiry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  businessName: string | null;
  businessType: string | null;
  monthlyOrderQtyRange: string | null;
  collectionsOfInterest: string[] | null;
  additionalMessage: string | null;
  status: WholesaleEnquiryStatus;
  adminNotes: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
  handledBy: { id: string; fullName: string; email: string } | null;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: NewsletterStatus;
  source: string;
  unsubscribedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WholesaleStats {
  totalAccounts: number;
  activeAccounts: number;
  pendingEnquiries: number;
  reviewingEnquiries: number;
  totalEnquiries: number;
}

export interface AccountListResponse {
  items: WholesaleAccount[];
  pagination: Pagination;
}

export interface EnquiryListResponse {
  items: WholesaleEnquiry[];
  pagination: Pagination;
}

export interface NewsletterListResponse {
  items: NewsletterSubscriber[];
  pagination: Pagination;
}

export interface AccountListQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface EnquiryListQuery {
  page?: number;
  limit?: number;
  status?: WholesaleEnquiryStatus;
}

export interface UpdateAccountPayload {
  businessName?: string | null;
  country?: string;
  creditLimit?: number;
  isActive?: boolean;
  tierId?: string;
}

export interface UpdateEnquiryPayload {
  status?: WholesaleEnquiryStatus;
  adminNotes?: string | null;
  handledById?: string | null;
}

export interface CreateTierPayload {
  name: WholesaleTierName;
  discountPercent: number;
  maxDiscountAmount?: number | null;
  minMonthlyQty?: number;
  freeShipping?: boolean;
  minOrderAmount?: number;
}

export interface UpdateTierPayload {
  minMonthlyQty?: number;
  discountPercent?: number;
  maxDiscountAmount?: number | null;
  freeShipping?: boolean;
  minOrderAmount?: number;
}

export interface ApproveEnquiryPayload {
  tierId: string;
}

export interface ApproveEnquiryResult {
  enquiry: WholesaleEnquiry;
  account: WholesaleAccount | null;
}
