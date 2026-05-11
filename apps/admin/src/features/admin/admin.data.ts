import type { Metric, NavItem, Tone } from './admin.types';

export const navItems: NavItem[] = [
  { labelKey: 'nav.dashboard', href: '/', descriptionKey: 'nav.dashboardDescription' },
  { labelKey: 'nav.products', href: '/products', descriptionKey: 'nav.productsDescription' },
  { labelKey: 'nav.collections', href: '/collections', descriptionKey: 'nav.collectionsDescription' },
  { labelKey: 'nav.orders', href: '/orders', descriptionKey: 'nav.ordersDescription' },
  { labelKey: 'nav.customers', href: '/customers', descriptionKey: 'nav.customersDescription' },
  { labelKey: 'nav.wholesale', href: '/wholesale', descriptionKey: 'nav.wholesaleDescription' },
  { labelKey: 'nav.discounts', href: '/discounts', descriptionKey: 'nav.discountsDescription' },
  { labelKey: 'nav.shipping', href: '/shipping', descriptionKey: 'nav.shippingDescription' },
  { labelKey: 'nav.currency', href: '/currency', descriptionKey: 'nav.currencyDescription' },
  { labelKey: 'nav.admins', href: '/admins', descriptionKey: 'nav.adminsDescription' },
  { labelKey: 'nav.settings', href: '/settings', descriptionKey: 'nav.settingsDescription' },
];

export const dashboardMetrics: Metric[] = [
  { label: 'New orders', value: '18', detail: '6 paid, 12 awaiting review', trend: '+14% this week' },
  { label: 'Revenue', value: '$4,820', detail: 'USD primary currency', trend: '+8.2% this month' },
  { label: 'Wholesale queue', value: '7', detail: '3 need first contact', trend: '2 urgent' },
  { label: 'Low stock SKUs', value: '11', detail: 'Across 4 collections', trend: 'Restock needed' },
];

export const orders = [
  { id: 'S14-1048', customer: 'Emma Laurent', email: 'emma@example.com', payment: 'Paid', paymentTone: 'success' as Tone, fulfillment: 'Processing', fulfillmentTone: 'info' as Tone, total: '$128.00', channel: 'PayPal', placedAt: 'Today 09:12' },
  { id: 'S14-1047', customer: 'Mia Hansen', email: 'mia@example.com', payment: 'Paid', paymentTone: 'success' as Tone, fulfillment: 'Shipped', fulfillmentTone: 'success' as Tone, total: '$86.00', channel: 'PayPal', placedAt: 'Yesterday 18:44' },
  { id: 'S14-1046', customer: 'Guest checkout', email: 'guest@example.com', payment: 'Review', paymentTone: 'warning' as Tone, fulfillment: 'New', fulfillmentTone: 'neutral' as Tone, total: '$52.00', channel: 'Manual', placedAt: 'Yesterday 14:20' },
  { id: 'S14-1045', customer: 'Sofia Keller', email: 'sofia@example.com', payment: 'Refunded', paymentTone: 'danger' as Tone, fulfillment: 'Closed', fulfillmentTone: 'neutral' as Tone, total: '$34.00', channel: 'PayPal', placedAt: 'May 5' },
];

export const products = [
  { sku: 'NAIL-AUR-01', name: 'Aurora French Tips', collection: 'Best Sellers', price: '$28.00', shape: 'Almond', sizes: 'XS-L', stock: 'In stock', stockTone: 'success' as Tone, visibility: 'Visible' },
  { sku: 'NAIL-MRB-11', name: 'Marble Luxe', collection: 'Luxury Set', price: '$36.00', shape: 'Coffin', sizes: 'S-L', stock: 'Low stock', stockTone: 'warning' as Tone, visibility: 'Visible' },
  { sku: 'NAIL-COR-12', name: 'Coral Riviera', collection: 'Solid Colors', price: '$22.00', shape: 'Square', sizes: 'XS-M', stock: 'Hidden', stockTone: 'neutral' as Tone, visibility: 'Hidden' },
  { sku: 'NAIL-CUS-08', name: 'Custom Bridal Set', collection: 'Custom Design', price: '$58.00', shape: 'Custom', sizes: 'Measured', stock: 'Made to order', stockTone: 'info' as Tone, visibility: 'Visible' },
];

export const collections = [
  { name: 'New Arrivals', slug: 'new-arrivals', products: '18', sort: 'Newest first', visibility: 'Visible', tone: 'success' as Tone },
  { name: 'Best Sellers', slug: 'best-sellers', products: '12', sort: 'Manual', visibility: 'Visible', tone: 'success' as Tone },
  { name: 'Custom Design', slug: 'custom-design', products: '9', sort: 'Manual', visibility: 'Visible', tone: 'success' as Tone },
  { name: 'Luxury Set', slug: 'luxury-set', products: '6', sort: 'Price high to low', visibility: 'Draft', tone: 'warning' as Tone },
];

export const customers = [
  { name: 'Emma Laurent', email: 'emma@example.com', orders: '8', spent: '$684.00', segment: 'Repeat buyer', country: 'France' },
  { name: 'Mia Hansen', email: 'mia@example.com', orders: '4', spent: '$310.00', segment: 'Registered', country: 'Germany' },
  { name: 'Sofia Keller', email: 'sofia@example.com', orders: '2', spent: '$94.00', segment: 'Refund review', country: 'Switzerland' },
];

export const wholesaleRequests = [
  { business: 'Luxe Nail Bar', contact: 'Claire Martin', email: 'claire@luxe.test', country: 'France', volume: '120 sets/month', status: 'New', tone: 'info' as Tone },
  { business: 'Berlin Beauty Lab', contact: 'Anna Weber', email: 'anna@beauty.test', country: 'Germany', volume: '80 sets/month', status: 'Contacted', tone: 'warning' as Tone },
  { business: 'Nordic Salon Supply', contact: 'Elin Berg', email: 'elin@nordic.test', country: 'Sweden', volume: '300 sets/month', status: 'Closed', tone: 'success' as Tone },
];

export const discounts = [
  { code: 'SILVER14', type: 'Percent', value: '10%', condition: 'All products', starts: 'Active now', status: 'Active', tone: 'success' as Tone },
  { code: 'WELCOME15', type: 'Percent', value: '15%', condition: 'First order', starts: 'May 12', status: 'Scheduled', tone: 'info' as Tone },
  { code: 'EU20', type: 'Fixed', value: '$20', condition: 'EU orders over $100', starts: 'Paused', status: 'Paused', tone: 'warning' as Tone },
];

export const shippingRules = [
  { zone: 'EU standard', countries: 'EU countries', baseFee: '$9.99', extraFee: '$2.00/item', condition: 'Free over $50', status: 'Active', tone: 'success' as Tone },
  { zone: 'United States', countries: 'US', baseFee: '$12.99', extraFee: '$3.00/item', condition: '10-18 business days', status: 'Active', tone: 'success' as Tone },
  { zone: 'Rest of world', countries: 'Manual review', baseFee: '$18.00', extraFee: '$4.00/item', condition: 'Manual quote', status: 'Draft', tone: 'warning' as Tone },
];

export const currencyRules = [
  { code: 'USD', name: 'US Dollar', rate: '1.0000', sync: 'Primary currency', display: 'Storefront default', status: 'Active', tone: 'success' as Tone },
];

export const adminAccounts = [
  { user: 'Owner', email: 'owner@silver14.test', role: 'Super Admin', permissions: 'Full access', status: 'Active', tone: 'success' as Tone },
  { user: 'Operations', email: 'ops@silver14.test', role: 'Admin', permissions: 'Orders, catalog, shipping', status: 'Active', tone: 'success' as Tone },
  { user: 'Fulfillment', email: 'fulfillment@silver14.test', role: 'Admin', permissions: 'Orders only', status: 'Invited', tone: 'warning' as Tone },
];

export const storeSettings = [
  { label: 'Store name', value: 'Silver14 Nail' },
  { label: 'Primary market', value: 'United States / EU' },
  { label: 'Default currency', value: 'USD' },
  { label: 'Default language', value: 'English' },
  { label: 'Order notification email', value: 'orders@silver14.test' },
];
