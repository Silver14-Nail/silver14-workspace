import type { SizeTier, SizeLabel } from '../_types';

export const CURRENCY_SYMBOLS: Record<string, string> = { EUR: '€', USD: '$', GBP: '£' };
export const LOW_STOCK_THRESHOLD = 10;

export const SIZE_LABELS: SizeLabel[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'];
export const SIZE_TIERS: SizeTier[] = ['standard', 'medium', 'large', 'xl'];

export const TIER_LABELS: Record<SizeTier, string> = {
  standard: 'Standard',
  medium: 'Medium',
  large: 'Large',
  xl: 'XL',
};

export const sizeColors: Record<SizeLabel, string> = {
  XS: 'bg-pink-100 text-pink-700',
  S: 'bg-blue-100 text-blue-700',
  M: 'bg-green-100 text-green-700',
  L: 'bg-amber-100 text-amber-700',
  XL: 'bg-orange-100 text-orange-700',
  XXL: 'bg-red-100 text-red-700',
  Custom: 'bg-purple-100 text-purple-700',
};

export const tierColors: Record<SizeTier, string> = {
  standard: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  large: 'bg-purple-100 text-purple-700',
  xl: 'bg-orange-100 text-orange-700',
};
