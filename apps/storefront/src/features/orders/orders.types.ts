export interface CustomerOrderSummary {
  id: string;
  status: string;
  trackingNumber: string | null;
  total: number;
  currency: string;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  createdAt: string;
  itemCount: number;
}

export interface CustomerOrderItem {
  productName: string;
  sizeName: string | null;
  shapeName: string | null;
  quantity: number;
  price: number;
  lineTotal: number;
  customization?: string | null;
}

export interface CustomerOrderDetail extends CustomerOrderSummary {
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    shippingMethodName: string;
  };
  items: CustomerOrderItem[];
}

export interface CustomerOrdersResponse {
  items: CustomerOrderSummary[];
  pagination: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}
