export interface WholesaleTier {
  id: string;
  name: 'Bronze' | 'Silver' | 'Gold';
  discountPercent: number;
  maxDiscountAmount: number | null;
  freeShipping: boolean;
  minOrderAmount: number;
  minMonthlyQty: number;
}

export interface WholesaleAccountTier {
  id: string;
  name: string;
  discountPercent: number;
  freeShipping: boolean;
  minOrderAmount: number;
}

export interface WholesaleAccount {
  id: string;
  businessName: string | null;
  country: string;
  creditLimit: number;
  currentBalance: number;
  isActive: boolean;
  approvedAt: string | null;
  tier: WholesaleAccountTier | null;
}

export interface WholesaleOrder {
  id: string;
  poNumber: string | null;
  wholesaleDiscount: number;
  paymentTerms: string;
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'overdue';
  dueDate: string | null;
  createdAt: string;
  order: {
    id: string;
    status: string;
    total: number;
    currency: string;
    createdAt: string;
  } | null;
}

export interface WholesaleOrdersResponse {
  items: WholesaleOrder[];
  pagination: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface SubmitEnquiryInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  businessName?: string;
  businessType?: string;
  monthlyOrderQtyRange?: string;
  collectionsOfInterest?: string[];
  additionalMessage?: string;
}
