export type SizeTier = 'standard' | 'medium' | 'large' | 'xl';
export type AdjustmentType = 'fixed' | 'percent';
export type SizeLabel = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'Custom';

export interface NailShape {
  id: string;
  name: string;
  sizeTier: SizeTier;
  lengthMm: number;
  priceAdjustment: number | string;
  adjustmentType: AdjustmentType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NailSize {
  id: string;
  label: SizeLabel;
  sizeCode: string;
  measurements: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  isMain: boolean;
  sortOrder: number;
}

