export type UserRole = 'admin' | 'customer' | 'wholesale';
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
export type PaymentGateway = 'stripe' | 'paypal' | 'braintree';
export type WholesaleTier = 'bronze' | 'silver' | 'gold';
export type WholesaleStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';
export type DiscountType = 'percent' | 'fixed' | 'free_shipping';

export interface AdminUser {
  id: string;
  avatar: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  emailVerified: boolean;
  active: boolean;
  lastLogin: string;
  createdAt: string;
  orders: number;
  totalSpent: number;
  country: string;
}

export interface AdminProduct {
  id: string;
  image: string;
  name: string;
  category: string;
  basePrice: number;
  stock: number;
  active: boolean;
  variantsCount: number;
  createdAt: string;
  sales: number;
  sku: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customer: { name: string; email: string; avatar: string | null };
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingMethod: string;
  total: number;
  currency: string;
  placedAt: string;
  trackingNumber: string | null;
  items: number;
  country: string;
}

export interface AdminPayment {
  id: string;
  transactionId: string;
  customer: { name: string; email: string };
  gateway: PaymentGateway;
  status: PaymentStatus;
  amount: number;
  currency: string;
  paidAt: string;
  orderId: string;
  cardBrand?: string;
  last4?: string;
}

export interface AdminCoupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  usageCount: number;
  usageLimit: number | null;
  active: boolean;
  expiresAt: string | null;
  minOrderAmount: number | null;
  createdAt: string;
}

export interface WholesaleAccount {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  country: string;
  tier: WholesaleTier;
  status: WholesaleStatus;
  creditBalance: number;
  creditLimit: number;
  totalOrders: number;
  totalRevenue: number;
  appliedAt: string;
  approvedAt: string | null;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  firstName: string | null;
  active: boolean;
  source: 'footer' | 'checkout' | 'popup' | 'wholesale';
  subscribedAt: string;
  country: string;
}

export const mockUsers: AdminUser[] = [
  {
    id: 'u1',
    avatar: null,
    firstName: 'Sophie',
    lastName: 'Martin',
    email: 'sophie.martin@gmail.com',
    phone: '+33 6 12 34 56 78',
    role: 'customer',
    emailVerified: true,
    active: true,
    lastLogin: '2026-05-15T10:30:00Z',
    createdAt: '2025-11-20T09:00:00Z',
    orders: 5,
    totalSpent: 347.5,
    country: 'FR',
  },
  {
    id: 'u2',
    avatar: null,
    firstName: 'Emma',
    lastName: 'Weber',
    email: 'emma.weber@outlook.de',
    phone: '+49 151 2345 6789',
    role: 'customer',
    emailVerified: true,
    active: true,
    lastLogin: '2026-05-14T14:20:00Z',
    createdAt: '2025-12-05T11:00:00Z',
    orders: 3,
    totalSpent: 210.0,
    country: 'DE',
  },
  {
    id: 'u3',
    avatar: null,
    firstName: 'Isabella',
    lastName: 'Rossi',
    email: 'isabella.rossi@libero.it',
    phone: '+39 333 123 4567',
    role: 'wholesale',
    emailVerified: true,
    active: true,
    lastLogin: '2026-05-13T08:45:00Z',
    createdAt: '2025-10-15T10:00:00Z',
    orders: 28,
    totalSpent: 4280.0,
    country: 'IT',
  },
  {
    id: 'u4',
    avatar: null,
    firstName: 'Chloé',
    lastName: 'Dupont',
    email: 'chloe.dupont@yahoo.fr',
    phone: '+33 7 98 76 54 32',
    role: 'customer',
    emailVerified: false,
    active: true,
    lastLogin: '2026-05-10T16:00:00Z',
    createdAt: '2026-01-08T14:00:00Z',
    orders: 1,
    totalSpent: 68.0,
    country: 'FR',
  },
  {
    id: 'u5',
    avatar: null,
    firstName: 'Lena',
    lastName: 'Müller',
    email: 'lena.mueller@gmail.com',
    phone: '+49 170 9876 5432',
    role: 'customer',
    emailVerified: true,
    active: false,
    lastLogin: '2026-04-20T11:00:00Z',
    createdAt: '2025-09-22T09:00:00Z',
    orders: 2,
    totalSpent: 156.0,
    country: 'DE',
  },
  {
    id: 'u6',
    avatar: null,
    firstName: 'Amelia',
    lastName: 'Clarke',
    email: 'amelia.clarke@gmail.com',
    phone: '+44 7911 123456',
    role: 'customer',
    emailVerified: true,
    active: true,
    lastLogin: '2026-05-16T08:00:00Z',
    createdAt: '2026-02-14T12:00:00Z',
    orders: 7,
    totalSpent: 512.5,
    country: 'GB',
  },
  {
    id: 'u7',
    avatar: null,
    firstName: 'Giulia',
    lastName: 'Ferrari',
    email: 'giulia.ferrari@nailstudio.it',
    phone: '+39 347 654 3210',
    role: 'wholesale',
    emailVerified: true,
    active: true,
    lastLogin: '2026-05-15T09:30:00Z',
    createdAt: '2025-08-10T10:00:00Z',
    orders: 45,
    totalSpent: 7650.0,
    country: 'IT',
  },
  {
    id: 'u8',
    avatar: null,
    firstName: 'Nora',
    lastName: 'Schmidt',
    email: 'nora.schmidt@web.de',
    phone: '+49 172 1234 5678',
    role: 'customer',
    emailVerified: true,
    active: true,
    lastLogin: '2026-05-12T13:45:00Z',
    createdAt: '2026-03-01T10:00:00Z',
    orders: 4,
    totalSpent: 289.0,
    country: 'DE',
  },
  {
    id: 'u9',
    avatar: null,
    firstName: 'Admin',
    lastName: 'Lunelle',
    email: 'admin@lunelle.com',
    phone: '+33 1 23 45 67 89',
    role: 'admin',
    emailVerified: true,
    active: true,
    lastLogin: '2026-05-16T09:00:00Z',
    createdAt: '2025-07-01T08:00:00Z',
    orders: 0,
    totalSpent: 0,
    country: 'FR',
  },
  {
    id: 'u10',
    avatar: null,
    firstName: 'Zoé',
    lastName: 'Bernard',
    email: 'zoe.bernard@protonmail.com',
    phone: '+33 6 55 44 33 22',
    role: 'customer',
    emailVerified: true,
    active: true,
    lastLogin: '2026-05-11T17:30:00Z',
    createdAt: '2026-01-25T15:00:00Z',
    orders: 2,
    totalSpent: 134.0,
    country: 'FR',
  },
];

export const mockProducts: AdminProduct[] = [
  {
    id: 'p1',
    image: '',
    name: 'Crystal Aurora Set',
    category: 'Gel Press-On',
    basePrice: 38.0,
    stock: 142,
    active: true,
    variantsCount: 12,
    createdAt: '2025-09-01T10:00:00Z',
    sales: 287,
    sku: 'LUN-CA-001',
  },
  {
    id: 'p2',
    image: '',
    name: 'Midnight Velvet',
    category: 'Matte Press-On',
    basePrice: 35.0,
    stock: 89,
    active: true,
    variantsCount: 10,
    createdAt: '2025-09-15T10:00:00Z',
    sales: 194,
    sku: 'LUN-MV-002',
  },
  {
    id: 'p3',
    image: '',
    name: 'Rose Quartz Luxe',
    category: 'Gel Press-On',
    basePrice: 42.0,
    stock: 12,
    active: true,
    variantsCount: 14,
    createdAt: '2025-10-01T10:00:00Z',
    sales: 156,
    sku: 'LUN-RQ-003',
  },
  {
    id: 'p4',
    image: '',
    name: 'Pearl Blanc Collection',
    category: 'Classic Press-On',
    basePrice: 29.0,
    stock: 203,
    active: true,
    variantsCount: 8,
    createdAt: '2025-10-20T10:00:00Z',
    sales: 321,
    sku: 'LUN-PB-004',
  },
  {
    id: 'p5',
    image: '',
    name: 'Onyx Noir Extra Long',
    category: 'XXL Press-On',
    basePrice: 48.0,
    stock: 56,
    active: true,
    variantsCount: 6,
    createdAt: '2025-11-05T10:00:00Z',
    sales: 98,
    sku: 'LUN-ON-005',
  },
  {
    id: 'p6',
    image: '',
    name: 'Champagne Glow',
    category: 'Gel Press-On',
    basePrice: 38.0,
    stock: 5,
    active: true,
    variantsCount: 10,
    createdAt: '2025-11-20T10:00:00Z',
    sales: 134,
    sku: 'LUN-CG-006',
  },
  {
    id: 'p7',
    image: '',
    name: 'Silver Frost Almond',
    category: 'Almond Press-On',
    basePrice: 36.0,
    stock: 78,
    active: true,
    variantsCount: 10,
    createdAt: '2025-12-01T10:00:00Z',
    sales: 112,
    sku: 'LUN-SF-007',
  },
  {
    id: 'p8',
    image: '',
    name: 'Nude Ballerina Custom',
    category: 'Custom',
    basePrice: 55.0,
    stock: 0,
    active: false,
    variantsCount: 0,
    createdAt: '2026-01-10T10:00:00Z',
    sales: 23,
    sku: 'LUN-NB-008',
  },
];

export const mockOrders: AdminOrder[] = [
  {
    id: 'o1',
    orderNumber: 'LUN-2026-0089',
    customer: { name: 'Sophie Martin', email: 'sophie.martin@gmail.com', avatar: null },
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    shippingMethod: 'DHL Express',
    total: 76.0,
    currency: 'EUR',
    placedAt: '2026-05-10T14:30:00Z',
    trackingNumber: 'DHL123456789',
    items: 2,
    country: 'FR',
  },
  {
    id: 'o2',
    orderNumber: 'LUN-2026-0088',
    customer: { name: 'Amelia Clarke', email: 'amelia.clarke@gmail.com', avatar: null },
    paymentStatus: 'paid',
    orderStatus: 'shipped',
    shippingMethod: 'Royal Mail',
    total: 114.5,
    currency: 'EUR',
    placedAt: '2026-05-11T09:15:00Z',
    trackingNumber: 'RM987654321',
    items: 3,
    country: 'GB',
  },
  {
    id: 'o3',
    orderNumber: 'LUN-2026-0087',
    customer: { name: 'Emma Weber', email: 'emma.weber@outlook.de', avatar: null },
    paymentStatus: 'paid',
    orderStatus: 'processing',
    shippingMethod: 'DHL Standard',
    total: 38.0,
    currency: 'EUR',
    placedAt: '2026-05-12T11:00:00Z',
    trackingNumber: null,
    items: 1,
    country: 'DE',
  },
  {
    id: 'o4',
    orderNumber: 'LUN-2026-0086',
    customer: { name: 'Nora Schmidt', email: 'nora.schmidt@web.de', avatar: null },
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
    shippingMethod: 'DHL Standard',
    total: 80.0,
    currency: 'EUR',
    placedAt: '2026-05-13T16:45:00Z',
    trackingNumber: null,
    items: 2,
    country: 'DE',
  },
  {
    id: 'o5',
    orderNumber: 'LUN-2026-0085',
    customer: { name: 'Chloé Dupont', email: 'chloe.dupont@yahoo.fr', avatar: null },
    paymentStatus: 'pending',
    orderStatus: 'pending',
    shippingMethod: 'Colissimo',
    total: 68.0,
    currency: 'EUR',
    placedAt: '2026-05-14T10:20:00Z',
    trackingNumber: null,
    items: 2,
    country: 'FR',
  },
  {
    id: 'o6',
    orderNumber: 'LUN-2026-0084',
    customer: { name: 'Zoé Bernard', email: 'zoe.bernard@protonmail.com', avatar: null },
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    shippingMethod: 'Colissimo',
    total: 66.0,
    currency: 'EUR',
    placedAt: '2026-05-05T08:00:00Z',
    trackingNumber: 'COL456789012',
    items: 2,
    country: 'FR',
  },
  {
    id: 'o7',
    orderNumber: 'LUN-2026-0083',
    customer: { name: 'Sophie Martin', email: 'sophie.martin@gmail.com', avatar: null },
    paymentStatus: 'refunded',
    orderStatus: 'refunded',
    shippingMethod: 'Colissimo',
    total: 42.0,
    currency: 'EUR',
    placedAt: '2026-04-28T12:30:00Z',
    trackingNumber: 'COL111222333',
    items: 1,
    country: 'FR',
  },
  {
    id: 'o8',
    orderNumber: 'LUN-2026-0082',
    customer: { name: 'Amelia Clarke', email: 'amelia.clarke@gmail.com', avatar: null },
    paymentStatus: 'failed',
    orderStatus: 'cancelled',
    shippingMethod: 'Royal Mail',
    total: 86.0,
    currency: 'EUR',
    placedAt: '2026-04-25T15:10:00Z',
    trackingNumber: null,
    items: 2,
    country: 'GB',
  },
  {
    id: 'o9',
    orderNumber: 'LUN-2026-0081',
    customer: { name: 'Lena Müller', email: 'lena.mueller@gmail.com', avatar: null },
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    shippingMethod: 'DHL Standard',
    total: 78.0,
    currency: 'EUR',
    placedAt: '2026-04-20T09:00:00Z',
    trackingNumber: 'DHL999888777',
    items: 2,
    country: 'DE',
  },
  {
    id: 'o10',
    orderNumber: 'LUN-2026-0080',
    customer: { name: 'Emma Weber', email: 'emma.weber@outlook.de', avatar: null },
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    shippingMethod: 'DHL Standard',
    total: 96.0,
    currency: 'EUR',
    placedAt: '2026-04-15T11:20:00Z',
    trackingNumber: 'DHL555444333',
    items: 3,
    country: 'DE',
  },
  {
    id: 'o11',
    orderNumber: 'LUN-2026-0079',
    customer: { name: 'Sophie Martin', email: 'sophie.martin@gmail.com', avatar: null },
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    shippingMethod: 'Colissimo',
    total: 35.0,
    currency: 'EUR',
    placedAt: '2026-04-10T14:00:00Z',
    trackingNumber: 'COL777888999',
    items: 1,
    country: 'FR',
  },
  {
    id: 'o12',
    orderNumber: 'LUN-2026-0078',
    customer: { name: 'Nora Schmidt', email: 'nora.schmidt@web.de', avatar: null },
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    shippingMethod: 'DHL Standard',
    total: 113.0,
    currency: 'EUR',
    placedAt: '2026-04-05T10:45:00Z',
    trackingNumber: 'DHL123987654',
    items: 3,
    country: 'DE',
  },
];

export const mockPayments: AdminPayment[] = [
  {
    id: 'pay1',
    transactionId: 'ch_3PkA2B2eZvKYlo2C0h8Fv1W9',
    customer: { name: 'Sophie Martin', email: 'sophie.martin@gmail.com' },
    gateway: 'stripe',
    status: 'paid',
    amount: 76.0,
    currency: 'EUR',
    paidAt: '2026-05-10T14:31:00Z',
    orderId: 'o1',
    cardBrand: 'visa',
    last4: '4242',
  },
  {
    id: 'pay2',
    transactionId: 'PAYID-MWBH1UI0C714123TU897612',
    customer: { name: 'Amelia Clarke', email: 'amelia.clarke@gmail.com' },
    gateway: 'paypal',
    status: 'paid',
    amount: 114.5,
    currency: 'EUR',
    paidAt: '2026-05-11T09:16:00Z',
    orderId: 'o2',
  },
  {
    id: 'pay3',
    transactionId: 'ch_3PkA3C2eZvKYlo2C1h9Gw2X0',
    customer: { name: 'Emma Weber', email: 'emma.weber@outlook.de' },
    gateway: 'stripe',
    status: 'paid',
    amount: 38.0,
    currency: 'EUR',
    paidAt: '2026-05-12T11:01:00Z',
    orderId: 'o3',
    cardBrand: 'mastercard',
    last4: '5555',
  },
  {
    id: 'pay4',
    transactionId: 'ch_3PkA4D2eZvKYlo2C2i0Hx3Y1',
    customer: { name: 'Nora Schmidt', email: 'nora.schmidt@web.de' },
    gateway: 'stripe',
    status: 'paid',
    amount: 80.0,
    currency: 'EUR',
    paidAt: '2026-05-13T16:46:00Z',
    orderId: 'o4',
    cardBrand: 'visa',
    last4: '1234',
  },
  {
    id: 'pay5',
    transactionId: 'ch_3PkA5E2eZvKYlo2C3j1Iy4Z2',
    customer: { name: 'Chloé Dupont', email: 'chloe.dupont@yahoo.fr' },
    gateway: 'stripe',
    status: 'pending',
    amount: 68.0,
    currency: 'EUR',
    paidAt: '2026-05-14T10:21:00Z',
    orderId: 'o5',
    cardBrand: 'amex',
    last4: '3782',
  },
  {
    id: 'pay6',
    transactionId: 'bt_txn_6789012345',
    customer: { name: 'Zoé Bernard', email: 'zoe.bernard@protonmail.com' },
    gateway: 'braintree',
    status: 'paid',
    amount: 66.0,
    currency: 'EUR',
    paidAt: '2026-05-05T08:01:00Z',
    orderId: 'o6',
  },
  {
    id: 'pay7',
    transactionId: 'ch_3PkA6F2eZvKYlo2C4k2Jz5A3',
    customer: { name: 'Sophie Martin', email: 'sophie.martin@gmail.com' },
    gateway: 'stripe',
    status: 'refunded',
    amount: 42.0,
    currency: 'EUR',
    paidAt: '2026-04-28T12:31:00Z',
    orderId: 'o7',
    cardBrand: 'visa',
    last4: '4242',
  },
  {
    id: 'pay8',
    transactionId: 'ch_3PkA7G2eZvKYlo2C5l3Kz6B4',
    customer: { name: 'Amelia Clarke', email: 'amelia.clarke@gmail.com' },
    gateway: 'stripe',
    status: 'failed',
    amount: 86.0,
    currency: 'EUR',
    paidAt: '2026-04-25T15:11:00Z',
    orderId: 'o8',
    cardBrand: 'mastercard',
    last4: '9876',
  },
];

export const mockCoupons: AdminCoupon[] = [
  {
    id: 'c1',
    code: 'LUNELLE10',
    discountType: 'percent',
    discountValue: 10,
    usageCount: 142,
    usageLimit: null,
    active: true,
    expiresAt: '2026-12-31T23:59:59Z',
    minOrderAmount: 30,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'c2',
    code: 'WELCOME15',
    discountType: 'percent',
    discountValue: 15,
    usageCount: 87,
    usageLimit: 200,
    active: true,
    expiresAt: '2026-06-30T23:59:59Z',
    minOrderAmount: 50,
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'c3',
    code: 'FREESHIP',
    discountType: 'free_shipping',
    discountValue: 0,
    usageCount: 234,
    usageLimit: null,
    active: true,
    expiresAt: null,
    minOrderAmount: 70,
    createdAt: '2025-11-01T00:00:00Z',
  },
  {
    id: 'c4',
    code: 'SPRING20',
    discountType: 'fixed',
    discountValue: 20,
    usageCount: 56,
    usageLimit: 100,
    active: false,
    expiresAt: '2026-04-30T23:59:59Z',
    minOrderAmount: 80,
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'c5',
    code: 'WHOLESALE5',
    discountType: 'percent',
    discountValue: 5,
    usageCount: 23,
    usageLimit: null,
    active: true,
    expiresAt: null,
    minOrderAmount: 200,
    createdAt: '2025-10-01T00:00:00Z',
  },
  {
    id: 'c6',
    code: 'FIRST10',
    discountType: 'percent',
    discountValue: 10,
    usageCount: 312,
    usageLimit: null,
    active: true,
    expiresAt: null,
    minOrderAmount: null,
    createdAt: '2025-08-01T00:00:00Z',
  },
  {
    id: 'c7',
    code: 'XMAS25',
    discountType: 'percent',
    discountValue: 25,
    usageCount: 189,
    usageLimit: 500,
    active: false,
    expiresAt: '2026-01-15T23:59:59Z',
    minOrderAmount: 60,
    createdAt: '2025-12-01T00:00:00Z',
  },
  {
    id: 'c8',
    code: 'VIP30',
    discountType: 'fixed',
    discountValue: 30,
    usageCount: 12,
    usageLimit: 50,
    active: true,
    expiresAt: '2026-09-30T23:59:59Z',
    minOrderAmount: 120,
    createdAt: '2026-02-01T00:00:00Z',
  },
];

export const mockWholesale: WholesaleAccount[] = [
  {
    id: 'w1',
    businessName: 'Milano Nail Studio',
    contactName: 'Giulia Ferrari',
    email: 'giulia@milanonaistudio.it',
    country: 'IT',
    tier: 'gold',
    status: 'approved',
    creditBalance: 450,
    creditLimit: 2000,
    totalOrders: 45,
    totalRevenue: 7650,
    appliedAt: '2025-08-01T10:00:00Z',
    approvedAt: '2025-08-05T14:00:00Z',
  },
  {
    id: 'w2',
    businessName: 'Paris Beauty Hub',
    contactName: 'Isabella Rossi',
    email: 'isabella@parisbeautyhub.fr',
    country: 'FR',
    tier: 'silver',
    status: 'approved',
    creditBalance: 120,
    creditLimit: 1000,
    totalOrders: 28,
    totalRevenue: 4280,
    appliedAt: '2025-10-10T10:00:00Z',
    approvedAt: '2025-10-15T12:00:00Z',
  },
  {
    id: 'w3',
    businessName: 'Berlin Nails GmbH',
    contactName: 'Klaus Bauer',
    email: 'k.bauer@berlinnails.de',
    country: 'DE',
    tier: 'bronze',
    status: 'approved',
    creditBalance: 0,
    creditLimit: 500,
    totalOrders: 12,
    totalRevenue: 1560,
    appliedAt: '2026-01-05T10:00:00Z',
    approvedAt: '2026-01-10T11:00:00Z',
  },
  {
    id: 'w4',
    businessName: 'London Glam Salon',
    contactName: 'Victoria Hughes',
    email: 'v.hughes@londonglam.co.uk',
    country: 'GB',
    tier: 'bronze',
    status: 'reviewing',
    creditBalance: 0,
    creditLimit: 500,
    totalOrders: 0,
    totalRevenue: 0,
    appliedAt: '2026-05-10T09:00:00Z',
    approvedAt: null,
  },
  {
    id: 'w5',
    businessName: 'Amsterdam Nail Art',
    contactName: 'Lars van den Berg',
    email: 'lars@amstnailart.nl',
    country: 'NL',
    tier: 'bronze',
    status: 'pending',
    creditBalance: 0,
    creditLimit: 500,
    totalOrders: 0,
    totalRevenue: 0,
    appliedAt: '2026-05-14T15:00:00Z',
    approvedAt: null,
  },
];

export const mockSubscribers: NewsletterSubscriber[] = [
  {
    id: 'ns1',
    email: 'sophie.martin@gmail.com',
    firstName: 'Sophie',
    active: true,
    source: 'checkout',
    subscribedAt: '2025-11-20T09:10:00Z',
    country: 'FR',
  },
  {
    id: 'ns2',
    email: 'emma.weber@outlook.de',
    firstName: 'Emma',
    active: true,
    source: 'footer',
    subscribedAt: '2025-12-05T11:30:00Z',
    country: 'DE',
  },
  {
    id: 'ns3',
    email: 'amelia.clarke@gmail.com',
    firstName: 'Amelia',
    active: true,
    source: 'popup',
    subscribedAt: '2026-02-14T12:15:00Z',
    country: 'GB',
  },
  {
    id: 'ns4',
    email: 'nora.schmidt@web.de',
    firstName: 'Nora',
    active: false,
    source: 'footer',
    subscribedAt: '2026-03-01T10:30:00Z',
    country: 'DE',
  },
  {
    id: 'ns5',
    email: 'zoe.bernard@protonmail.com',
    firstName: 'Zoé',
    active: true,
    source: 'checkout',
    subscribedAt: '2026-01-25T15:10:00Z',
    country: 'FR',
  },
  {
    id: 'ns6',
    email: 'chloe.dupont@yahoo.fr',
    firstName: 'Chloé',
    active: true,
    source: 'popup',
    subscribedAt: '2026-01-08T14:10:00Z',
    country: 'FR',
  },
  {
    id: 'ns7',
    email: 'giulia@milanonaistudio.it',
    firstName: 'Giulia',
    active: true,
    source: 'wholesale',
    subscribedAt: '2025-08-05T14:05:00Z',
    country: 'IT',
  },
  {
    id: 'ns8',
    email: 'lena.mueller@gmail.com',
    firstName: 'Lena',
    active: false,
    source: 'footer',
    subscribedAt: '2025-09-22T09:30:00Z',
    country: 'DE',
  },
  {
    id: 'ns9',
    email: 'hello@nailsbycharlotte.fr',
    firstName: 'Charlotte',
    active: true,
    source: 'popup',
    subscribedAt: '2026-04-15T11:00:00Z',
    country: 'FR',
  },
  {
    id: 'ns10',
    email: 'anna.kowalski@wp.pl',
    firstName: 'Anna',
    active: true,
    source: 'footer',
    subscribedAt: '2026-04-22T16:00:00Z',
    country: 'PL',
  },
  {
    id: 'ns11',
    email: 'maria.garcia@gmail.com',
    firstName: 'Maria',
    active: true,
    source: 'checkout',
    subscribedAt: '2026-05-01T10:00:00Z',
    country: 'ES',
  },
  {
    id: 'ns12',
    email: 'info@nailstudio-vienna.at',
    firstName: null,
    active: true,
    source: 'wholesale',
    subscribedAt: '2026-05-05T09:00:00Z',
    country: 'AT',
  },
];

export const revenueData = [
  { month: 'Nov 25', revenue: 2840, orders: 38, wholesale: 680 },
  { month: 'Dec 25', revenue: 5120, orders: 67, wholesale: 1200 },
  { month: 'Jan 26', revenue: 3240, orders: 44, wholesale: 840 },
  { month: 'Feb 26', revenue: 3980, orders: 52, wholesale: 960 },
  { month: 'Mar 26', revenue: 4560, orders: 61, wholesale: 1120 },
  { month: 'Apr 26', revenue: 5240, orders: 71, wholesale: 1380 },
  { month: 'May 26', revenue: 3120, orders: 42, wholesale: 780 },
];

export const dailyOrdersData = [
  { day: 'Mon', orders: 8, revenue: 596 },
  { day: 'Tue', orders: 12, revenue: 894 },
  { day: 'Wed', orders: 6, revenue: 447 },
  { day: 'Thu', orders: 15, revenue: 1118 },
  { day: 'Fri', orders: 18, revenue: 1342 },
  { day: 'Sat', orders: 22, revenue: 1638 },
  { day: 'Sun', orders: 14, revenue: 1043 },
];

export const cartAbandonmentData = [
  { step: 'Cart', count: 342 },
  { step: 'Contact', count: 218 },
  { step: 'Shipping', count: 156 },
  { step: 'Payment', count: 89 },
  { step: 'Completed', count: 71 },
];

export const paymentMethodData = [
  { name: 'Stripe Card', value: 58, color: '#635BFF' },
  { name: 'PayPal', value: 29, color: '#003087' },
  { name: 'Braintree', value: 13, color: '#22C55E' },
];

export const topCountriesData = [
  { country: 'France', orders: 134, revenue: 8760 },
  { country: 'Germany', orders: 98, revenue: 6320 },
  { country: 'UK', orders: 76, revenue: 5140 },
  { country: 'Italy', orders: 54, revenue: 4280 },
  { country: 'Spain', orders: 32, revenue: 2100 },
];

export const mockAbandonedCarts = [
  {
    id: 'ac1',
    customer: 'Guest (marie.c@gmail.com)',
    items: 2,
    value: 76.0,
    step: 'Payment',
    abandonedAt: '2026-05-16T09:45:00Z',
  },
  {
    id: 'ac2',
    customer: 'Guest (hans.m@gmx.de)',
    items: 1,
    value: 38.0,
    step: 'Shipping',
    abandonedAt: '2026-05-16T08:30:00Z',
  },
  {
    id: 'ac3',
    customer: 'Amelia Clarke',
    items: 3,
    value: 114.0,
    step: 'Payment',
    abandonedAt: '2026-05-15T22:10:00Z',
  },
  {
    id: 'ac4',
    customer: 'Guest (test@hotmail.fr)',
    items: 1,
    value: 42.0,
    step: 'Contact',
    abandonedAt: '2026-05-15T18:55:00Z',
  },
  {
    id: 'ac5',
    customer: 'Nora Schmidt',
    items: 2,
    value: 73.0,
    step: 'Shipping',
    abandonedAt: '2026-05-15T14:20:00Z',
  },
];
