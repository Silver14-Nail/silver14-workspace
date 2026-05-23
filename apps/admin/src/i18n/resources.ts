import enCommon from './locales/en/common.json';
import viCommon from './locales/vi/common.json';
import enProducts from './locales/en/products.json';
import viProducts from './locales/vi/products.json';
import enOrders from './locales/en/orders.json';
import viOrders from './locales/vi/orders.json';
import enUsers from './locales/en/users.json';
import viUsers from './locales/vi/users.json';
import enCollections from './locales/en/collections.json';
import viCollections from './locales/vi/collections.json';
import enCampaigns from './locales/en/campaigns.json';
import viCampaigns from './locales/vi/campaigns.json';
import enCoupons from './locales/en/coupons.json';
import viCoupons from './locales/vi/coupons.json';
import enSupplies from './locales/en/supplies.json';
import viSupplies from './locales/vi/supplies.json';
import enCheckouts from './locales/en/checkouts.json';
import viCheckouts from './locales/vi/checkouts.json';
import enDashboard from './locales/en/dashboard.json';
import viDashboard from './locales/vi/dashboard.json';

export const i18nResources = {
  en: {
    common: enCommon,
    products: enProducts,
    orders: enOrders,
    users: enUsers,
    collections: enCollections,
    campaigns: enCampaigns,
    coupons: enCoupons,
    supplies: enSupplies,
    checkouts: enCheckouts,
    dashboard: enDashboard,
  },
  vi: {
    common: viCommon,
    products: viProducts,
    orders: viOrders,
    users: viUsers,
    collections: viCollections,
    campaigns: viCampaigns,
    coupons: viCoupons,
    supplies: viSupplies,
    checkouts: viCheckouts,
    dashboard: viDashboard,
  },
} as const;
