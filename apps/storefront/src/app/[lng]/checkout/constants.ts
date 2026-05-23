import type { Step } from './types';

export const COUNTRIES = [
  'Australia',
  'Austria',
  'Belgium',
  'Bulgaria',
  'Canada',
  'Croatia',
  'Cyprus',
  'Czech Republic',
  'Denmark',
  'Estonia',
  'Finland',
  'France',
  'Germany',
  'Greece',
  'Hungary',
  'Ireland',
  'Italy',
  'Japan',
  'Latvia',
  'Lithuania',
  'Luxembourg',
  'Malta',
  'Netherlands',
  'Norway',
  'Poland',
  'Portugal',
  'Romania',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'Spain',
  'Sweden',
  'Switzerland',
  'United Kingdom',
  'United States',
  'Other',
] as const;

export const CHECKOUT_STEPS: { key: Step; labelKey: string }[] = [
  { key: 'contact', labelKey: 'steps.contact' },
  { key: 'shipping', labelKey: 'steps.shipping' },
  { key: 'payment', labelKey: 'steps.payment' },
];

export const PAYMENT_METHODS = ['card', 'paypal'] as const;

export const DEFAULT_CONTACT = { email: '', phone: '', fullName: '' };
export const DEFAULT_SHIPPING = {
  firstName: '',
  lastName: '',
  address: '',
  apartment: '',
  city: '',
  postalCode: '',
  country: 'Germany',
};
