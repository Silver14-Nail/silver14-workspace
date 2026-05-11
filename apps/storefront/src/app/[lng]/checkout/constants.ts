import type { Step } from './types';

export const COUNTRIES = [
  'Austria',
  'Belgium',
  'Bulgaria',
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
  'Latvia',
  'Lithuania',
  'Luxembourg',
  'Malta',
  'Netherlands',
  'Poland',
  'Portugal',
  'Romania',
  'Slovakia',
  'Slovenia',
  'Spain',
  'Sweden',
  'United Kingdom',
  'United States',
  'Australia',
  'Canada',
  'Switzerland',
  'Norway',
  'Singapore',
  'Japan',
  'Other',
] as const;

export const CHECKOUT_STEPS: { key: Step; labelKey: string }[] = [
  { key: 'contact', labelKey: 'steps.contact' },
  { key: 'shipping', labelKey: 'steps.shipping' },
  { key: 'payment', labelKey: 'steps.payment' },
];

export const PAYMENT_METHODS = ['card', 'paypal'] as const;

export const DEFAULT_CONTACT = { email: '', phone: '', createAccount: false, password: '' };
export const DEFAULT_SHIPPING = {
  firstName: '',
  lastName: '',
  address: '',
  apartment: '',
  city: '',
  postalCode: '',
  country: 'Germany',
  notes: '',
};
export const DEFAULT_CARD = { number: '', name: '', expiry: '', cvc: '' };
