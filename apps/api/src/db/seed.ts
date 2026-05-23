import 'reflect-metadata';
import { hashSync } from 'bcryptjs';
import { AppDataSource } from './ormconfig';
import {
  NailSizeLabel,
  PriceAdjustmentType,
  ProductType,
  ShapeSizeTier,
  UserRole,
} from '../common/enums/entity.enum';
import { UserEntity } from './entities/auths/user.entity';
import { NailShapeEntity } from './entities/products/nail-shape.entity';
import { NailSizeEntity } from './entities/products/nail-size.entity';
import { ProductEntity } from './entities/products/product.entity';
import { ProductImageEntity } from './entities/products/product-image.entity';
import { ProductShapePricingEntity } from './entities/products/product-shape-pricing.entity';
import { ProductVariantEntity } from './entities/products/product-variants.entity';
import { ProductTranslationEntity } from './entities/products/product-translation.entity';
import { CollectionEntity } from './entities/products/collection.entity';
import { CollectionTranslationEntity } from './entities/products/collection-translation.entity';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(msg: string) {
  process.stdout.write(`  ${msg}\n`);
}

function skip(entity: string, identifier: string) {
  log(`↷  ${entity} already exists — skipping (${identifier})`);
}

function created(entity: string, identifier: string) {
  log(`✓  ${entity} created (${identifier})`);
}

function productCode(slug: string): string {
  return slug
    .split('-')
    .map((w) => w[0].toUpperCase())
    .join('');
}

function shapeCode(name: string): string {
  const words = name.split(' ');
  if (words.length === 1) return name.substring(0, 3).toUpperCase();
  if (words[0] === 'XXL') return 'XXL' + words[1].substring(0, 2).toUpperCase();
  return words
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

// ─── Seed definitions ─────────────────────────────────────────────────────────

const ADMIN = {
  fullName: 'Silver14 Admin',
  email: 'admin@silver14.com',
  password: 'Admin@123456',
};

const NAIL_SHAPES: {
  name: string;
  lengthMm: number;
  sizeTier: ShapeSizeTier;
  priceAdjustment: number;
  adjustmentType: PriceAdjustmentType;
  sortOrder: number;
}[] = [
  // ── Short (2.0 cm) ──────────────────────────────────────────────────────────
  {
    name: 'Short Oval',
    lengthMm: 20,
    sizeTier: ShapeSizeTier.STANDARD,
    priceAdjustment: 0,
    adjustmentType: PriceAdjustmentType.FIXED,
    sortOrder: 1,
  },
  {
    name: 'Short Almond',
    lengthMm: 20,
    sizeTier: ShapeSizeTier.STANDARD,
    priceAdjustment: 0,
    adjustmentType: PriceAdjustmentType.FIXED,
    sortOrder: 2,
  },
  {
    name: 'Short Square',
    lengthMm: 20,
    sizeTier: ShapeSizeTier.STANDARD,
    priceAdjustment: 0,
    adjustmentType: PriceAdjustmentType.FIXED,
    sortOrder: 3,
  },
  // ── Medium (2.5 cm) ─────────────────────────────────────────────────────────
  {
    name: 'Medium Almond',
    lengthMm: 25,
    sizeTier: ShapeSizeTier.MEDIUM,
    priceAdjustment: 0,
    adjustmentType: PriceAdjustmentType.FIXED,
    sortOrder: 4,
  },
  {
    name: 'Medium Square',
    lengthMm: 25,
    sizeTier: ShapeSizeTier.MEDIUM,
    priceAdjustment: 0,
    adjustmentType: PriceAdjustmentType.FIXED,
    sortOrder: 5,
  },
  {
    name: 'Medium Coffin',
    lengthMm: 25,
    sizeTier: ShapeSizeTier.MEDIUM,
    priceAdjustment: 0,
    adjustmentType: PriceAdjustmentType.FIXED,
    sortOrder: 6,
  },
  // ── Long (2.8 – 3.2 cm) ─────────────────────────────────────────────────────
  {
    name: 'Long Almond',
    lengthMm: 28,
    sizeTier: ShapeSizeTier.LARGE,
    priceAdjustment: 0,
    adjustmentType: PriceAdjustmentType.FIXED,
    sortOrder: 7,
  },
  {
    name: 'Long Coffin',
    lengthMm: 30,
    sizeTier: ShapeSizeTier.LARGE,
    priceAdjustment: 0,
    adjustmentType: PriceAdjustmentType.FIXED,
    sortOrder: 8,
  },
  {
    name: 'Long Square',
    lengthMm: 30,
    sizeTier: ShapeSizeTier.LARGE,
    priceAdjustment: 0,
    adjustmentType: PriceAdjustmentType.FIXED,
    sortOrder: 9,
  },
  {
    name: 'Stiletto',
    lengthMm: 32,
    sizeTier: ShapeSizeTier.LARGE,
    priceAdjustment: 0,
    adjustmentType: PriceAdjustmentType.FIXED,
    sortOrder: 10,
  },
  // ── XXL (+$10) ───────────────────────────────────────────────────────────────
  {
    name: 'XXL Stiletto',
    lengthMm: 55,
    sizeTier: ShapeSizeTier.XL,
    priceAdjustment: 10,
    adjustmentType: PriceAdjustmentType.FIXED,
    sortOrder: 11,
  },
  {
    name: 'XXL Coffin',
    lengthMm: 40,
    sizeTier: ShapeSizeTier.XL,
    priceAdjustment: 10,
    adjustmentType: PriceAdjustmentType.FIXED,
    sortOrder: 12,
  },
  {
    name: 'XXL Square',
    lengthMm: 40,
    sizeTier: ShapeSizeTier.XL,
    priceAdjustment: 10,
    adjustmentType: PriceAdjustmentType.FIXED,
    sortOrder: 13,
  },
];

// Widths per finger: thumb · index · middle · ring · pinky
const NAIL_SIZES: {
  label: NailSizeLabel;
  sizeCode: string;
  measurements: string;
  sortOrder: number;
}[] = [
  {
    label: NailSizeLabel.XS,
    sizeCode: 'XS',
    measurements: 'thumb: 14mm | index: 10mm | middle: 11mm | ring: 10mm | pinky: 8mm',
    sortOrder: 1,
  },
  {
    label: NailSizeLabel.S,
    sizeCode: 'S',
    measurements: 'thumb: 15mm | index: 11mm | middle: 12mm | ring: 11mm | pinky: 9mm',
    sortOrder: 2,
  },
  {
    label: NailSizeLabel.M,
    sizeCode: 'M',
    measurements: 'thumb: 16mm | index: 12mm | middle: 13mm | ring: 12mm | pinky: 10mm',
    sortOrder: 3,
  },
  {
    label: NailSizeLabel.L,
    sizeCode: 'L',
    measurements: 'thumb: 17mm | index: 13mm | middle: 14mm | ring: 13mm | pinky: 11mm',
    sortOrder: 4,
  },
];

type LocaleTranslation = {
  locale: string;
  name: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

type ProductInput = {
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  salePrice?: number | null;
  currency: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  images: string[];
  translations: LocaleTranslation[];
};

const PRODUCTS: ProductInput[] = [
  {
    name: 'Crystal Aurora Set',
    slug: 'crystal-aurora-set',
    description: 'Shimmering translucent gel nails with aurora effect',
    basePrice: 38.0,
    salePrice: 29.9,
    currency: 'EUR',
    isNew: true,
    isBestSeller: false,
    images: [
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400',
      'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400',
    ],
    translations: [
      {
        locale: 'en',
        name: 'Crystal Aurora Set',
        description: 'Shimmering translucent gel nails with aurora effect',
        seoTitle: 'Crystal Aurora Nail Set — Silver14',
        seoDescription:
          'Shop Crystal Aurora press-on nails with shimmering translucent aurora effect. Available in Almond, Coffin, Square, and Stiletto shapes.',
      },
      {
        locale: 'vi',
        name: 'Bộ Móng Crystal Aurora',
        description: 'Móng gel trong suốt lấp lánh với hiệu ứng cực quang',
        seoTitle: 'Bộ Móng Crystal Aurora — Silver14',
        seoDescription:
          'Mua móng giả Crystal Aurora với hiệu ứng cực quang lấp lánh. Có các hình dạng Almond, Coffin, Square và Stiletto.',
      },
    ],
  },
  {
    name: 'Midnight Velvet',
    slug: 'midnight-velvet',
    description: 'Deep black matte finish with velvet texture',
    basePrice: 35.0,
    salePrice: null,
    currency: 'EUR',
    isNew: false,
    isBestSeller: true,
    images: ['https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400'],
    translations: [
      {
        locale: 'en',
        name: 'Midnight Velvet',
        description: 'Deep black matte finish with velvet texture',
        seoTitle: 'Midnight Velvet Nail Set — Silver14',
        seoDescription:
          'Shop Midnight Velvet press-on nails. Deep black matte finish with luxurious velvet texture.',
      },
      {
        locale: 'vi',
        name: 'Midnight Velvet',
        description: 'Lớp hoàn thiện matte đen sâu với kết cấu nhung',
        seoTitle: 'Bộ Móng Midnight Velvet — Silver14',
        seoDescription:
          'Mua móng giả Midnight Velvet. Lớp hoàn thiện matte đen sâu với kết cấu nhung sang trọng.',
      },
    ],
  },
  {
    name: 'Rose Quartz Luxe',
    slug: 'rose-quartz-luxe',
    description: 'Elegant pink gradient with gold accents',
    basePrice: 42.0,
    salePrice: 34.9,
    currency: 'EUR',
    isNew: true,
    isBestSeller: true,
    images: [
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400',
      'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400',
      'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400',
    ],
    translations: [
      {
        locale: 'en',
        name: 'Rose Quartz Luxe',
        description: 'Elegant pink gradient with gold accents',
        seoTitle: 'Rose Quartz Luxe Nail Set — Silver14',
        seoDescription:
          'Shop Rose Quartz Luxe press-on nails. Elegant pink gradient with gold accents, perfect for weddings and special occasions.',
      },
      {
        locale: 'vi',
        name: 'Rose Quartz Luxe',
        description: 'Gradient hồng thanh lịch với điểm nhấn vàng',
        seoTitle: 'Bộ Móng Rose Quartz Luxe — Silver14',
        seoDescription:
          'Mua móng giả Rose Quartz Luxe. Gradient hồng thanh lịch với điểm nhấn vàng, hoàn hảo cho đám cưới và các dịp đặc biệt.',
      },
    ],
  },
];

// ─── Supplies ─────────────────────────────────────────────────────────────────

type SupplyVariant = {
  sku: string;
  colorName?: string | null;
  colorHex?: string | null;
  variantImageUrl?: string | null;
  stockQty: number;
  computedPrice: number;
};

type SupplyInput = {
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  salePrice?: number | null;
  isNew?: boolean;
  isBestSeller?: boolean;
  images: string[];
  // Single-variant (no color): provide sku + stockQty at top level
  sku?: string;
  stockQty?: number;
  // Multi-variant (color options): provide variants array
  variants?: SupplyVariant[];
  translations: LocaleTranslation[];
};

const SUPPLIES: SupplyInput[] = [
  {
    name: 'Nail Glue Pro',
    slug: 'nail-glue-pro',
    description:
      'Extra-strength professional nail glue for long-lasting hold. 3g precision-tip bottle.',
    basePrice: 6.9,
    salePrice: null,
    isNew: false,
    isBestSeller: true,
    images: ['https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400'],
    sku: 'S14-SUP-GLUE-PRO',
    stockQty: 150,
    translations: [
      {
        locale: 'en',
        name: 'Nail Glue Pro',
        description:
          'Extra-strength professional nail glue for long-lasting hold. 3g precision-tip bottle.',
        seoTitle: 'Nail Glue Pro — Silver14',
        seoDescription:
          'Professional extra-strength nail glue for press-on nails. Long-lasting hold with precision tip.',
      },
      {
        locale: 'vi',
        name: 'Keo Móng Chuyên Nghiệp',
        description:
          'Keo móng chuyên nghiệp độ bền cao cho độ bám dài lâu. Chai 3g đầu kim chính xác.',
        seoTitle: 'Keo Móng Chuyên Nghiệp — Silver14',
        seoDescription:
          'Keo móng chuyên nghiệp độ bền cao cho móng giả. Độ bám lâu dài với đầu kim chính xác.',
      },
    ],
  },
  {
    name: 'Builder Gel',
    slug: 'builder-gel',
    description:
      'Professional builder gel for nail extensions and overlays. Available in clear, nude, pink and specialty shades. Soak-off formula.',
    basePrice: 12.9,
    salePrice: null,
    isNew: true,
    isBestSeller: true,
    images: ['https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400'],
    variants: [
      {
        sku: 'S14-GEL-CLEAR-60',
        colorName: 'Clear',
        colorHex: '#F5F5F5',
        stockQty: 80,
        computedPrice: 12.9,
      },
      {
        sku: 'S14-GEL-PINK-8',
        colorName: 'Pink',
        colorHex: '#FFB6C1',
        stockQty: 60,
        computedPrice: 9.9,
      },
      {
        sku: 'S14-GEL-NUDE-8',
        colorName: 'Nude',
        colorHex: '#D4A574',
        stockQty: 55,
        computedPrice: 9.9,
      },
      {
        sku: 'S14-GEL-JG01-7',
        colorName: 'JG01',
        colorHex: '#C8A882',
        stockQty: 40,
        computedPrice: 10.9,
      },
      {
        sku: 'S14-GEL-JG02-7',
        colorName: 'JG02',
        colorHex: '#F2C4CE',
        stockQty: 40,
        computedPrice: 10.9,
      },
    ],
    translations: [
      {
        locale: 'en',
        name: 'Builder Gel',
        description:
          'Professional builder gel for nail extensions and overlays. Available in clear, nude, pink and specialty shades. Soak-off formula.',
        seoTitle: 'Builder Gel — Silver14',
        seoDescription:
          'Professional builder gel for nail extensions in clear, nude, pink and specialty shades. Soak-off formula.',
      },
      {
        locale: 'vi',
        name: 'Gel Nối Móng',
        description:
          'Gel nối móng chuyên nghiệp dùng cho nối và phủ móng. Có nhiều màu: trong suốt, nude, hồng và các màu đặc biệt. Công thức soak-off.',
        seoTitle: 'Gel Nối Móng — Silver14',
        seoDescription:
          'Gel nối móng chuyên nghiệp màu trong suốt, nude, hồng và các màu đặc biệt. Công thức soak-off dễ tháo.',
      },
    ],
  },
  {
    name: 'Chrome Powder (Bột Tráng Gương)',
    slug: 'chrome-powder',
    description:
      'Ultra-fine chrome nail powder for mirror-effect nails. Simply rub onto cured gel for instant chrome finish. Available in 10 color codes.',
    basePrice: 5.9,
    salePrice: null,
    isNew: false,
    isBestSeller: true,
    images: ['https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400'],
    variants: [
      {
        sku: 'S14-CHROME-BN01',
        colorName: 'Bn01',
        colorHex: '#C0C0C0',
        stockQty: 70,
        computedPrice: 5.9,
      },
      {
        sku: 'S14-CHROME-BN02',
        colorName: 'Bn02',
        colorHex: '#FFD700',
        stockQty: 65,
        computedPrice: 5.9,
      },
      {
        sku: 'S14-CHROME-BN03',
        colorName: 'Bn03',
        colorHex: '#B76E79',
        stockQty: 60,
        computedPrice: 5.9,
      },
      {
        sku: 'S14-CHROME-BN04',
        colorName: 'Bn04',
        colorHex: '#4169E1',
        stockQty: 55,
        computedPrice: 5.9,
      },
      {
        sku: 'S14-CHROME-BN05',
        colorName: 'Bn05',
        colorHex: '#8A2BE2',
        stockQty: 50,
        computedPrice: 5.9,
      },
      {
        sku: 'S14-CHROME-BN06',
        colorName: 'Bn06',
        colorHex: '#2E8B57',
        stockQty: 45,
        computedPrice: 5.9,
      },
      {
        sku: 'S14-CHROME-BN07',
        colorName: 'Bn07',
        colorHex: '#FF6347',
        stockQty: 40,
        computedPrice: 5.9,
      },
      {
        sku: 'S14-CHROME-BN08',
        colorName: 'Bn08',
        colorHex: '#20B2AA',
        stockQty: 35,
        computedPrice: 5.9,
      },
      {
        sku: 'S14-CHROME-BN10',
        colorName: 'Bn10',
        colorHex: '#FF1493',
        stockQty: 30,
        computedPrice: 5.9,
      },
      {
        sku: 'S14-CHROME-BN12',
        colorName: 'Bn12',
        colorHex: '#1C1C2E',
        stockQty: 25,
        computedPrice: 5.9,
      },
    ],
    translations: [
      {
        locale: 'en',
        name: 'Chrome Powder',
        description:
          'Ultra-fine chrome nail powder for mirror-effect nails. Simply rub onto cured gel for instant chrome finish. 10 color codes available.',
        seoTitle: 'Chrome Powder — Silver14',
        seoDescription:
          'Ultra-fine chrome nail powder for mirror-finish nails. 10 color codes for every style.',
      },
      {
        locale: 'vi',
        name: 'Bột Tráng Gương',
        description:
          'Bột chrome siêu mịn tạo hiệu ứng gương cho móng. Chỉ cần chà lên gel đã đóng rắn để có lớp chrome tức thì. Có 10 mã màu.',
        seoTitle: 'Bột Tráng Gương — Silver14',
        seoDescription: 'Bột chrome siêu mịn tạo hiệu ứng gương cho móng tay. 10 mã màu đa dạng.',
      },
    ],
  },
  {
    name: 'Crystal Gems (Đá Cực Quang)',
    slug: 'crystal-gems',
    description:
      'Aurora crystal nail gems with dazzling multi-color shimmer. Sold individually by color. Perfect for nail art accents.',
    basePrice: 4.9,
    salePrice: null,
    isNew: false,
    isBestSeller: false,
    images: ['https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400'],
    variants: [
      {
        sku: 'S14-GEM-01',
        colorName: '01 Crystal Clear',
        colorHex: '#F0F8FF',
        stockQty: 80,
        computedPrice: 4.9,
      },
      {
        sku: 'S14-GEM-02',
        colorName: '02 Pink Aurora',
        colorHex: '#FF69B4',
        stockQty: 75,
        computedPrice: 4.9,
      },
      {
        sku: 'S14-GEM-03',
        colorName: '03 Sky Blue',
        colorHex: '#87CEEB',
        stockQty: 70,
        computedPrice: 4.9,
      },
      {
        sku: 'S14-GEM-04',
        colorName: '04 Lavender',
        colorHex: '#9370DB',
        stockQty: 65,
        computedPrice: 4.9,
      },
      {
        sku: 'S14-GEM-05',
        colorName: '05 Gold Shimmer',
        colorHex: '#FFD700',
        stockQty: 60,
        computedPrice: 4.9,
      },
      {
        sku: 'S14-GEM-06',
        colorName: '06 Emerald',
        colorHex: '#50C878',
        stockQty: 55,
        computedPrice: 4.9,
      },
    ],
    translations: [
      {
        locale: 'en',
        name: 'Crystal Gems',
        description:
          'Aurora crystal nail gems with dazzling multi-color shimmer. Sold individually by color. Perfect for nail art accents.',
        seoTitle: 'Crystal Gems — Silver14',
        seoDescription:
          'Aurora crystal nail gems in 6 shimmer colors for stunning nail art accents.',
      },
      {
        locale: 'vi',
        name: 'Đá Cực Quang',
        description:
          'Đá cực quang cho móng tay với hiệu ứng ánh sáng đa màu. Bán lẻ từng màu. Hoàn hảo để trang trí nail art.',
        seoTitle: 'Đá Cực Quang — Silver14',
        seoDescription: 'Đá cực quang móng tay 6 màu ánh sáng cho nail art độc đáo.',
      },
    ],
  },
  {
    name: 'Cuticle Oil Pen',
    slug: 'cuticle-oil-pen',
    description:
      'Nourishing cuticle oil pen with jojoba & vitamin E. Promotes healthy nail growth.',
    basePrice: 8.5,
    salePrice: null,
    isNew: false,
    isBestSeller: false,
    images: ['https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400'],
    sku: 'S14-SUP-CUTICLE-PEN',
    stockQty: 60,
    translations: [
      {
        locale: 'en',
        name: 'Cuticle Oil Pen',
        description:
          'Nourishing cuticle oil pen with jojoba & vitamin E. Promotes healthy nail growth.',
        seoTitle: 'Cuticle Oil Pen — Silver14',
        seoDescription:
          'Nourishing cuticle oil pen with jojoba and vitamin E for healthy nail growth and hydration.',
      },
      {
        locale: 'vi',
        name: 'Bút Dưỡng Da Cuticle',
        description:
          'Bút dầu dưỡng cuticle với jojoba & vitamin E. Thúc đẩy móng tay phát triển khỏe mạnh.',
        seoTitle: 'Bút Dưỡng Da Cuticle — Silver14',
        seoDescription:
          'Bút dầu dưỡng cuticle với jojoba và vitamin E giúp móng tay khỏe mạnh và giữ ẩm.',
      },
    ],
  },
  {
    name: 'Mini Nail File Set',
    slug: 'mini-nail-file-set',
    description: 'Set of 5 professional-grade nail files: 100/180 grit for shaping and smoothing.',
    basePrice: 4.9,
    salePrice: null,
    isNew: false,
    isBestSeller: true,
    images: ['https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400'],
    sku: 'S14-SUP-FILE-SET5',
    stockQty: 200,
    translations: [
      {
        locale: 'en',
        name: 'Mini Nail File Set',
        description:
          'Set of 5 professional-grade nail files: 100/180 grit for shaping and smoothing.',
        seoTitle: 'Mini Nail File Set — Silver14',
        seoDescription:
          'Set of 5 professional nail files for shaping and smoothing press-on nails. 100/180 grit.',
      },
      {
        locale: 'vi',
        name: 'Bộ Dũa Móng Mini',
        description: 'Bộ 5 dũa móng chuyên nghiệp: độ nhám 100/180 để tạo hình và làm mịn.',
        seoTitle: 'Bộ Dũa Móng Mini — Silver14',
        seoDescription:
          'Bộ 5 dũa móng chuyên nghiệp để tạo hình và làm mịn móng giả. Độ nhám 100/180.',
      },
    ],
  },
  {
    name: 'Nail Tabs Adhesive (60pcs)',
    slug: 'nail-tabs-adhesive-60',
    description:
      'Double-sided adhesive nail tabs for damage-free press-on nails. 60 tabs in 10 sizes.',
    basePrice: 5.5,
    salePrice: null,
    isNew: false,
    isBestSeller: true,
    images: ['https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400'],
    sku: 'S14-SUP-TABS-60',
    stockQty: 300,
    translations: [
      {
        locale: 'en',
        name: 'Nail Tabs Adhesive (60pcs)',
        description:
          'Double-sided adhesive nail tabs for damage-free press-on nails. 60 tabs in 10 sizes.',
        seoTitle: 'Nail Adhesive Tabs 60pcs — Silver14',
        seoDescription:
          'Double-sided nail adhesive tabs for damage-free application. 60 pieces in 10 sizes for all nail shapes.',
      },
      {
        locale: 'vi',
        name: 'Miếng Dán Móng (60 miếng)',
        description: 'Miếng dán hai mặt cho móng giả không gây hại. 60 miếng trong 10 kích cỡ.',
        seoTitle: 'Miếng Dán Móng 60 Miếng — Silver14',
        seoDescription:
          'Miếng dán hai mặt cho móng giả, không gây hại. 60 miếng trong 10 kích cỡ phù hợp mọi hình dạng móng.',
      },
    ],
  },
  {
    name: 'Glossy Top Coat',
    slug: 'glossy-top-coat',
    description:
      'High-shine gel-effect top coat for press-on nails. Extends wear and adds glass-like gloss. 10ml.',
    basePrice: 9.9,
    salePrice: 7.9,
    isNew: true,
    isBestSeller: false,
    images: ['https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400'],
    sku: 'S14-SUP-TOPCOAT-GLOSS',
    stockQty: 90,
    translations: [
      {
        locale: 'en',
        name: 'Glossy Top Coat',
        description:
          'High-shine gel-effect top coat for press-on nails. Extends wear and adds glass-like gloss. 10ml.',
        seoTitle: 'Glossy Top Coat — Silver14',
        seoDescription:
          'High-shine gel-effect top coat for press-on nails. Extends wear time and provides a glass-like finish.',
      },
      {
        locale: 'vi',
        name: 'Top Coat Bóng Cao Cấp',
        description:
          'Top coat hiệu ứng gel bóng cao cho móng giả. Kéo dài thời gian dùng và tạo độ bóng như kính. 10ml.',
        seoTitle: 'Top Coat Bóng Cao Cấp — Silver14',
        seoDescription:
          'Top coat hiệu ứng gel bóng cao cho móng giả. Kéo dài thời gian dùng và tạo lớp hoàn thiện như kính.',
      },
    ],
  },
  {
    name: 'Nail Remover Wraps (20pcs)',
    slug: 'nail-remover-wraps-20',
    description:
      'Acetone-soaked foil wraps for gentle press-on nail removal. 20 wraps with wooden cuticle stick.',
    basePrice: 3.9,
    salePrice: null,
    isNew: false,
    isBestSeller: false,
    images: ['https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400'],
    sku: 'S14-SUP-REMOVER-20',
    stockQty: 180,
    translations: [
      {
        locale: 'en',
        name: 'Nail Remover Wraps (20pcs)',
        description:
          'Acetone-soaked foil wraps for gentle press-on nail removal. 20 wraps with wooden cuticle stick.',
        seoTitle: 'Nail Remover Wraps 20pcs — Silver14',
        seoDescription:
          'Acetone foil nail remover wraps for gentle and easy press-on nail removal. Pack of 20 with cuticle stick.',
      },
      {
        locale: 'vi',
        name: 'Giấy Tẩy Móng (20 miếng)',
        description:
          'Giấy bạc ngâm acetone để tháo móng giả nhẹ nhàng. 20 miếng kèm que gỗ đẩy cuticle.',
        seoTitle: 'Giấy Tẩy Móng 20 Miếng — Silver14',
        seoDescription:
          'Giấy tẩy móng acetone để tháo móng giả nhẹ nhàng và dễ dàng. Gói 20 miếng kèm que gỗ.',
      },
    ],
  },
  {
    name: 'Buffer Block 4-Way',
    slug: 'buffer-block-4-way',
    description:
      '4-way nail buffer block: file, buff, smooth and shine in one tool. Professional grade.',
    basePrice: 3.5,
    salePrice: null,
    isNew: false,
    isBestSeller: false,
    images: ['https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400'],
    sku: 'S14-SUP-BUFFER-4W',
    stockQty: 120,
    translations: [
      {
        locale: 'en',
        name: 'Buffer Block 4-Way',
        description:
          '4-way nail buffer block: file, buff, smooth and shine in one tool. Professional grade.',
        seoTitle: '4-Way Nail Buffer Block — Silver14',
        seoDescription:
          'Professional 4-way nail buffer block for filing, buffing, smoothing and shining nails in one tool.',
      },
      {
        locale: 'vi',
        name: 'Khối Đánh Bóng 4 Mặt',
        description:
          'Khối đánh bóng móng 4 mặt: dũa, đánh bóng, làm mịn và tạo độ bóng trong một công cụ. Chuyên nghiệp.',
        seoTitle: 'Khối Đánh Bóng Móng 4 Mặt — Silver14',
        seoDescription:
          'Khối đánh bóng móng 4 mặt chuyên nghiệp để dũa, đánh bóng, làm mịn và tạo độ bóng trong một công cụ.',
      },
    ],
  },
];

// ─── Collections ──────────────────────────────────────────────────────────────

type CollectionTranslationInput = {
  locale: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

type CollectionInput = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  isFeatured: boolean;
  sortOrder: number;
  productNames: string[];
  translations: CollectionTranslationInput[];
};

const COLLECTIONS: CollectionInput[] = [
  {
    name: 'New Arrivals',
    slug: 'new-arrivals',
    shortDescription: 'The latest styles fresh from our studio',
    description:
      'Discover the newest nail art designs added to our collection. Fresh styles, trending shapes, and vibrant colours arrive every week.',
    seoTitle: 'New Arrivals — Silver14 Nail',
    seoDescription: 'Shop the latest press-on nail sets from Silver14. New designs added weekly.',
    isFeatured: true,
    sortOrder: 1,
    productNames: ['Crystal Aurora Set'],
    translations: [
      {
        locale: 'en',
        name: 'New Arrivals',
        shortDescription: 'The latest styles fresh from our studio',
        description:
          'Discover the newest nail art designs added to our collection. Fresh styles, trending shapes, and vibrant colours arrive every week.',
        seoTitle: 'New Arrivals — Silver14 Nail',
        seoDescription:
          'Shop the latest press-on nail sets from Silver14. New designs added weekly.',
      },
      {
        locale: 'vi',
        name: 'Hàng Mới Về',
        shortDescription: 'Các mẫu mới nhất từ xưởng của chúng tôi',
        description:
          'Khám phá những mẫu nail art mới nhất trong bộ sưu tập của chúng tôi. Các kiểu mới, hình dạng thịnh hành và màu sắc rực rỡ cập nhật hàng tuần.',
        seoTitle: 'Hàng Mới Về — Silver14 Nail',
        seoDescription: 'Mua bộ móng giả mới nhất từ Silver14. Mẫu mới cập nhật hàng tuần.',
      },
    ],
  },
  {
    name: 'Best Sellers',
    slug: 'best-sellers',
    shortDescription: 'Our most loved nail sets',
    description:
      'The nail sets our customers keep coming back to. Tried, tested, and loved by thousands of happy customers worldwide.',
    seoTitle: 'Best Sellers — Silver14 Nail',
    seoDescription: "Shop Silver14's bestselling press-on nail sets loved by customers worldwide.",
    isFeatured: true,
    sortOrder: 2,
    productNames: ['Midnight Velvet', 'Rose Quartz Luxe'],
    translations: [
      {
        locale: 'en',
        name: 'Best Sellers',
        shortDescription: 'Our most loved nail sets',
        description:
          'The nail sets our customers keep coming back to. Tried, tested, and loved by thousands of happy customers worldwide.',
        seoTitle: 'Best Sellers — Silver14 Nail',
        seoDescription:
          "Shop Silver14's bestselling press-on nail sets loved by customers worldwide.",
      },
      {
        locale: 'vi',
        name: 'Bán Chạy Nhất',
        shortDescription: 'Những bộ móng được yêu thích nhất',
        description:
          'Những bộ móng mà khách hàng của chúng tôi không ngừng quay lại. Đã được thử nghiệm và yêu thích bởi hàng nghìn khách hàng hài lòng trên toàn thế giới.',
        seoTitle: 'Bán Chạy Nhất — Silver14 Nail',
        seoDescription:
          'Mua bộ móng giả bán chạy nhất của Silver14 được khách hàng toàn cầu yêu thích.',
      },
    ],
  },
  {
    name: 'Luxury Collection',
    slug: 'luxury-collection',
    shortDescription: 'Premium nail art for special occasions',
    description:
      'Our finest nail art sets crafted with premium materials. Designed for those moments when only the best will do.',
    seoTitle: 'Luxury Collection — Silver14 Nail',
    seoDescription:
      "Explore Silver14's luxury press-on nail sets for weddings, galas, and special events.",
    isFeatured: true,
    sortOrder: 3,
    productNames: ['Rose Quartz Luxe'],
    translations: [
      {
        locale: 'en',
        name: 'Luxury Collection',
        shortDescription: 'Premium nail art for special occasions',
        description:
          'Our finest nail art sets crafted with premium materials. Designed for those moments when only the best will do.',
        seoTitle: 'Luxury Collection — Silver14 Nail',
        seoDescription:
          "Explore Silver14's luxury press-on nail sets for weddings, galas, and special events.",
      },
      {
        locale: 'vi',
        name: 'Bộ Sưu Tập Cao Cấp',
        shortDescription: 'Nghệ thuật móng tay hạng sang cho các dịp đặc biệt',
        description:
          'Những bộ nail art tinh tế nhất của chúng tôi được chế tác từ nguyên liệu cao cấp. Dành cho những khoảnh khắc chỉ có điều tốt nhất mới đủ.',
        seoTitle: 'Bộ Sưu Tập Cao Cấp — Silver14 Nail',
        seoDescription:
          'Khám phá bộ móng giả cao cấp của Silver14 cho đám cưới, dạ tiệc và sự kiện đặc biệt.',
      },
    ],
  },
  {
    name: 'French Collection',
    slug: 'french-collection',
    shortDescription: 'Classic French tips reimagined',
    description:
      'Timeless French manicure styles elevated with modern twists. From clean classic whites to coloured and glitter tips.',
    seoTitle: 'French Collection — Silver14 Nail',
    seoDescription: 'Classic and modern French tip press-on nails from Silver14.',
    isFeatured: false,
    sortOrder: 4,
    productNames: ['Crystal Aurora Set'],
    translations: [
      {
        locale: 'en',
        name: 'French Collection',
        shortDescription: 'Classic French tips reimagined',
        description:
          'Timeless French manicure styles elevated with modern twists. From clean classic whites to coloured and glitter tips.',
        seoTitle: 'French Collection — Silver14 Nail',
        seoDescription: 'Classic and modern French tip press-on nails from Silver14.',
      },
      {
        locale: 'vi',
        name: 'Bộ Sưu Tập French',
        shortDescription: 'Đầu móng French cổ điển được tái hiện',
        description:
          'Những kiểu manicure French vượt thời gian được nâng tầm với những cách tân hiện đại. Từ đầu móng trắng cổ điển đến đầu móng màu sắc và glitter.',
        seoTitle: 'Bộ Sưu Tập French — Silver14 Nail',
        seoDescription: 'Móng giả đầu French cổ điển và hiện đại từ Silver14.',
      },
    ],
  },
  {
    name: 'Nude Collection',
    slug: 'nude-collection',
    shortDescription: 'Understated elegance in every shade',
    description:
      'Sophisticated nude and neutral tones that complement every skin tone and outfit. Perfect for the office or a night out.',
    seoTitle: 'Nude Collection — Silver14 Nail',
    seoDescription: "Shop Silver14's nude and neutral press-on nail sets for every skin tone.",
    isFeatured: false,
    sortOrder: 5,
    productNames: ['Midnight Velvet'],
    translations: [
      {
        locale: 'en',
        name: 'Nude Collection',
        shortDescription: 'Understated elegance in every shade',
        description:
          'Sophisticated nude and neutral tones that complement every skin tone and outfit. Perfect for the office or a night out.',
        seoTitle: 'Nude Collection — Silver14 Nail',
        seoDescription: "Shop Silver14's nude and neutral press-on nail sets for every skin tone.",
      },
      {
        locale: 'vi',
        name: 'Bộ Sưu Tập Nude',
        shortDescription: 'Sự thanh lịch tinh tế trong từng tông màu',
        description:
          'Tông màu nude và trung tính tinh tế phù hợp với mọi tông da và trang phục. Hoàn hảo cho văn phòng hay buổi tối ra ngoài.',
        seoTitle: 'Bộ Sưu Tập Nude — Silver14 Nail',
        seoDescription: 'Mua bộ móng giả nude và trung tính của Silver14 phù hợp cho mọi tông da.',
      },
    ],
  },
  {
    name: 'Wedding Collection',
    slug: 'wedding-collection',
    shortDescription: 'Beautiful nails for your big day',
    description:
      'Bridal-inspired nail sets designed to complement wedding looks. Elegant, romantic, and unforgettable for brides and bridal parties.',
    seoTitle: 'Wedding Collection — Silver14 Nail',
    seoDescription:
      'Bridal and wedding press-on nail sets from Silver14. Perfect for your big day.',
    isFeatured: true,
    sortOrder: 6,
    productNames: ['Rose Quartz Luxe', 'Crystal Aurora Set'],
    translations: [
      {
        locale: 'en',
        name: 'Wedding Collection',
        shortDescription: 'Beautiful nails for your big day',
        description:
          'Bridal-inspired nail sets designed to complement wedding looks. Elegant, romantic, and unforgettable for brides and bridal parties.',
        seoTitle: 'Wedding Collection — Silver14 Nail',
        seoDescription:
          'Bridal and wedding press-on nail sets from Silver14. Perfect for your big day.',
      },
      {
        locale: 'vi',
        name: 'Bộ Sưu Tập Cưới',
        shortDescription: 'Móng tay đẹp cho ngày trọng đại của bạn',
        description:
          'Bộ móng lấy cảm hứng từ cô dâu được thiết kế để hoàn thiện vẻ đẹp đám cưới. Thanh lịch, lãng mạn và không thể quên cho cô dâu và phù dâu.',
        seoTitle: 'Bộ Sưu Tập Cưới — Silver14 Nail',
        seoDescription: 'Bộ móng giả cưới từ Silver14. Hoàn hảo cho ngày trọng đại của bạn.',
      },
    ],
  },
  {
    name: 'Spring Collection',
    slug: 'spring-collection',
    shortDescription: 'Fresh florals and pastel tones',
    description:
      'Celebrate the season with pastel shades, floral designs, and light-catching finishes that capture the energy of spring.',
    seoTitle: 'Spring Collection — Silver14 Nail',
    seoDescription: 'Spring-inspired press-on nails with pastels and florals from Silver14.',
    isFeatured: false,
    sortOrder: 7,
    productNames: ['Crystal Aurora Set', 'Rose Quartz Luxe'],
    translations: [
      {
        locale: 'en',
        name: 'Spring Collection',
        shortDescription: 'Fresh florals and pastel tones',
        description:
          'Celebrate the season with pastel shades, floral designs, and light-catching finishes that capture the energy of spring.',
        seoTitle: 'Spring Collection — Silver14 Nail',
        seoDescription: 'Spring-inspired press-on nails with pastels and florals from Silver14.',
      },
      {
        locale: 'vi',
        name: 'Bộ Sưu Tập Mùa Xuân',
        shortDescription: 'Hoa tươi và tông màu pastel',
        description:
          'Chào đón mùa với các sắc pastel, thiết kế hoa và lớp hoàn thiện bắt sáng thể hiện năng lượng mùa xuân.',
        seoTitle: 'Bộ Sưu Tập Mùa Xuân — Silver14 Nail',
        seoDescription: 'Móng giả lấy cảm hứng từ mùa xuân với pastel và hoa từ Silver14.',
      },
    ],
  },
  {
    name: 'Summer Collection',
    slug: 'summer-collection',
    shortDescription: 'Bold colours for sun-soaked days',
    description:
      'Vibrant shades and playful designs made for summer adventures. From beach days to rooftop parties.',
    seoTitle: 'Summer Collection — Silver14 Nail',
    seoDescription:
      'Summer press-on nail sets with bold colours and playful designs from Silver14.',
    isFeatured: false,
    sortOrder: 8,
    productNames: ['Midnight Velvet'],
    translations: [
      {
        locale: 'en',
        name: 'Summer Collection',
        shortDescription: 'Bold colours for sun-soaked days',
        description:
          'Vibrant shades and playful designs made for summer adventures. From beach days to rooftop parties.',
        seoTitle: 'Summer Collection — Silver14 Nail',
        seoDescription:
          'Summer press-on nail sets with bold colours and playful designs from Silver14.',
      },
      {
        locale: 'vi',
        name: 'Bộ Sưu Tập Mùa Hè',
        shortDescription: 'Màu sắc táo bạo cho những ngày nắng',
        description:
          'Màu sắc rực rỡ và thiết kế vui tươi dành cho những chuyến phiêu lưu mùa hè. Từ ngày ở bãi biển đến tiệc trên sân thượng.',
        seoTitle: 'Bộ Sưu Tập Mùa Hè — Silver14 Nail',
        seoDescription: 'Bộ móng giả mùa hè với màu sắc táo bạo và thiết kế vui tươi từ Silver14.',
      },
    ],
  },
  {
    name: 'Holiday Collection',
    slug: 'holiday-collection',
    shortDescription: 'Festive nails for every celebration',
    description:
      'Glittery, sparkly, and festive nail sets for holiday parties, Christmas gatherings, and New Year celebrations.',
    seoTitle: 'Holiday Collection — Silver14 Nail',
    seoDescription:
      'Festive and holiday press-on nail sets from Silver14. Perfect for Christmas and New Year.',
    isFeatured: false,
    sortOrder: 9,
    productNames: ['Crystal Aurora Set', 'Midnight Velvet', 'Rose Quartz Luxe'],
    translations: [
      {
        locale: 'en',
        name: 'Holiday Collection',
        shortDescription: 'Festive nails for every celebration',
        description:
          'Glittery, sparkly, and festive nail sets for holiday parties, Christmas gatherings, and New Year celebrations.',
        seoTitle: 'Holiday Collection — Silver14 Nail',
        seoDescription:
          'Festive and holiday press-on nail sets from Silver14. Perfect for Christmas and New Year.',
      },
      {
        locale: 'vi',
        name: 'Bộ Sưu Tập Lễ Hội',
        shortDescription: 'Móng tay lễ hội cho mọi dịp kỷ niệm',
        description:
          'Bộ móng lấp lánh, tỏa sáng và lễ hội cho các buổi tiệc, lễ Giáng Sinh và kỷ niệm Năm Mới.',
        seoTitle: 'Bộ Sưu Tập Lễ Hội — Silver14 Nail',
        seoDescription: 'Bộ móng giả lễ hội từ Silver14. Hoàn hảo cho Giáng Sinh và Năm Mới.',
      },
    ],
  },
  {
    name: 'Trending Now',
    slug: 'trending-now',
    shortDescription: 'What everyone is wearing this season',
    description:
      'Our curated selection of the most-searched and talked-about nail styles right now. Stay ahead of the trend.',
    seoTitle: 'Trending Now — Silver14 Nail',
    seoDescription: 'Shop trending press-on nail designs from Silver14. Updated regularly.',
    isFeatured: true,
    sortOrder: 10,
    productNames: ['Crystal Aurora Set', 'Rose Quartz Luxe'],
    translations: [
      {
        locale: 'en',
        name: 'Trending Now',
        shortDescription: 'What everyone is wearing this season',
        description:
          'Our curated selection of the most-searched and talked-about nail styles right now. Stay ahead of the trend.',
        seoTitle: 'Trending Now — Silver14 Nail',
        seoDescription: 'Shop trending press-on nail designs from Silver14. Updated regularly.',
      },
      {
        locale: 'vi',
        name: 'Xu Hướng Hiện Tại',
        shortDescription: 'Những gì mọi người đang dùng mùa này',
        description:
          'Tuyển chọn những kiểu móng được tìm kiếm và bàn luận nhiều nhất hiện nay. Luôn đi đầu xu hướng.',
        seoTitle: 'Xu Hướng Hiện Tại — Silver14 Nail',
        seoDescription: 'Mua mẫu móng giả đang thịnh hành từ Silver14. Cập nhật thường xuyên.',
      },
    ],
  },
];

// ─── Seed runners ─────────────────────────────────────────────────────────────

async function seedAdmin() {
  const repo = AppDataSource.getRepository(UserEntity);

  const existing = await repo.findOne({ where: { email: ADMIN.email } });
  if (existing) {
    skip('Admin user', ADMIN.email);
    return;
  }

  const user = repo.create({
    fullName: ADMIN.fullName,
    email: ADMIN.email,
    passwordHash: hashSync(ADMIN.password, 12),
    role: UserRole.ADMIN,
    emailVerified: true,
    isActive: true,
    phone: null,
    avatarUrl: null,
    lastLoginAt: null,
  });

  await repo.save(user);
  created('Admin user', `${ADMIN.email} / ${ADMIN.password}`);
}

async function seedNailShapes(): Promise<Map<string, NailShapeEntity>> {
  const repo = AppDataSource.getRepository(NailShapeEntity);
  const result = new Map<string, NailShapeEntity>();

  for (const shape of NAIL_SHAPES) {
    let entity = await repo.findOne({ where: { name: shape.name } });
    if (entity) {
      skip('NailShape', shape.name);
    } else {
      entity = await repo.save(
        repo.create({
          name: shape.name,
          lengthMm: shape.lengthMm,
          sizeTier: shape.sizeTier,
          priceAdjustment: shape.priceAdjustment,
          adjustmentType: shape.adjustmentType,
          isActive: true,
          sortOrder: shape.sortOrder,
        }),
      );
      created('NailShape', shape.name);
    }
    result.set(shape.name, entity);
  }

  return result;
}

async function seedNailSizes(): Promise<Map<string, NailSizeEntity>> {
  const repo = AppDataSource.getRepository(NailSizeEntity);
  const result = new Map<string, NailSizeEntity>();

  for (const size of NAIL_SIZES) {
    let entity = await repo.findOne({ where: { sizeCode: size.sizeCode } });
    if (entity) {
      skip('NailSize', size.sizeCode);
    } else {
      entity = await repo.save(
        repo.create({
          label: size.label,
          sizeCode: size.sizeCode,
          measurements: size.measurements,
          sortOrder: size.sortOrder,
        }),
      );
      created('NailSize', size.sizeCode);
    }
    result.set(size.sizeCode, entity);
  }

  return result;
}

async function seedProducts(
  shapesByName: Map<string, NailShapeEntity>,
  sizesByCode: Map<string, NailSizeEntity>,
): Promise<Map<string, ProductEntity>> {
  const productRepo = AppDataSource.getRepository(ProductEntity);
  const imageRepo = AppDataSource.getRepository(ProductImageEntity);
  const pricingRepo = AppDataSource.getRepository(ProductShapePricingEntity);
  const variantRepo = AppDataSource.getRepository(ProductVariantEntity);
  const translationRepo = AppDataSource.getRepository(ProductTranslationEntity);

  const result = new Map<string, ProductEntity>();

  for (const p of PRODUCTS) {
    let product = await productRepo.findOne({ where: { slug: p.slug } });
    if (product) {
      skip('Product', p.name);
      result.set(p.name, product);
      continue;
    }

    product = await productRepo.save(
      productRepo.create({
        name: p.name,
        slug: p.slug,
        description: p.description,
        basePrice: p.basePrice,
        salePrice: p.salePrice ?? null,
        currency: p.currency,
        isActive: true,
        isNew: p.isNew ?? false,
        isBestSeller: p.isBestSeller ?? false,
      }),
    );

    // Images — first image is main
    await imageRepo.save(
      p.images.map((url, idx) =>
        imageRepo.create({ url, sortOrder: idx, isMain: idx === 0, product }),
      ),
    );

    // Shape pricings — all shapes
    for (const [, shape] of shapesByName) {
      await pricingRepo.save(
        pricingRepo.create({
          product,
          shape,
          priceOverride: null,
          priceAdjustment: null,
          adjustmentType: null,
          isEnabled: true,
        }),
      );
    }

    // Variants — all shapes × all sizes (computedPrice = basePrice + shape adjustment)
    for (const [, shape] of shapesByName) {
      const adjustment = Number(shape.priceAdjustment) || 0;
      const computedPrice = p.basePrice + adjustment;
      for (const [, size] of sizesByCode) {
        const sku = `S14-${productCode(p.slug)}-${shapeCode(shape.name)}-${size.sizeCode}`;
        await variantRepo.save(
          variantRepo.create({
            product,
            shape,
            size,
            sku,
            stockQty: 10,
            computedPrice,
            isAvailable: true,
          }),
        );
      }
    }

    // Translations
    for (const tr of p.translations) {
      const existing = await translationRepo.findOne({
        where: { productId: product.id, locale: tr.locale },
      });
      if (!existing) {
        await translationRepo.save(
          translationRepo.create({
            productId: product.id,
            locale: tr.locale,
            name: tr.name,
            description: tr.description,
            seoTitle: tr.seoTitle,
            seoDescription: tr.seoDescription,
            isAutoGenerated: false,
          }),
        );
      }
    }

    result.set(p.name, product);
    created(
      'Product',
      `${p.name} | ${p.images.length} images | ${shapesByName.size} pricings | ${shapesByName.size * sizesByCode.size} variants | ${p.translations.length} translations`,
    );
  }

  return result;
}

async function seedSupplies() {
  const productRepo = AppDataSource.getRepository(ProductEntity);
  const imageRepo = AppDataSource.getRepository(ProductImageEntity);
  const variantRepo = AppDataSource.getRepository(ProductVariantEntity);
  const translationRepo = AppDataSource.getRepository(ProductTranslationEntity);

  for (const s of SUPPLIES) {
    let product = await productRepo.findOne({ where: { slug: s.slug } });
    if (product) {
      skip('Supply', s.name);
      continue;
    }

    product = await productRepo.save(
      productRepo.create({
        name: s.name,
        slug: s.slug,
        description: s.description,
        basePrice: s.basePrice,
        salePrice: s.salePrice ?? null,
        currency: 'EUR',
        isActive: true,
        isNew: s.isNew ?? false,
        isBestSeller: s.isBestSeller ?? false,
        type: ProductType.SUPPLY,
      }),
    );

    // Images
    await imageRepo.save(
      s.images.map((url, idx) =>
        imageRepo.create({ url, sortOrder: idx, isMain: idx === 0, product }),
      ),
    );

    // Variants — either multi-color variants or a single default variant
    if (s.variants?.length) {
      for (const v of s.variants) {
        await variantRepo.save(
          variantRepo.create({
            product,
            shape: null,
            size: null,
            sku: v.sku,
            stockQty: v.stockQty,
            computedPrice: v.computedPrice,
            isAvailable: v.stockQty > 0,
            colorName: v.colorName ?? null,
            colorHex: v.colorHex ?? null,
            variantImageUrl: v.variantImageUrl ?? null,
          }),
        );
      }
    } else {
      await variantRepo.save(
        variantRepo.create({
          product,
          shape: null,
          size: null,
          sku: s.sku ?? null,
          stockQty: s.stockQty ?? 0,
          computedPrice: s.salePrice ?? s.basePrice,
          isAvailable: (s.stockQty ?? 0) > 0,
          colorName: null,
          colorHex: null,
          variantImageUrl: null,
        }),
      );
    }

    // Translations
    for (const tr of s.translations) {
      await translationRepo.save(
        translationRepo.create({
          productId: product.id,
          locale: tr.locale,
          name: tr.name,
          description: tr.description,
          seoTitle: tr.seoTitle,
          seoDescription: tr.seoDescription,
          isAutoGenerated: false,
        }),
      );
    }

    const variantCount = s.variants?.length ?? 1;
    created(
      'Supply',
      `${s.name} | ${variantCount} variant(s) | ${s.translations.length} translations`,
    );
  }
}

async function seedCollections(productsByName: Map<string, ProductEntity>) {
  const collectionRepo = AppDataSource.getRepository(CollectionEntity);
  const translationRepo = AppDataSource.getRepository(CollectionTranslationEntity);

  for (const c of COLLECTIONS) {
    let entity = await collectionRepo.findOne({ where: { slug: c.slug } });
    if (entity) {
      skip('Collection', c.slug);
      continue;
    }

    const products = c.productNames
      .map((name) => productsByName.get(name))
      .filter((p): p is ProductEntity => !!p);

    entity = collectionRepo.create({
      name: c.name,
      slug: c.slug,
      shortDescription: c.shortDescription,
      description: c.description,
      seoTitle: c.seoTitle,
      seoDescription: c.seoDescription,
      isFeatured: c.isFeatured,
      isActive: true,
      sortOrder: c.sortOrder,
      image: null,
      bannerImage: null,
      products,
    });

    await collectionRepo.save(entity);

    // Translations
    for (const tr of c.translations) {
      const existing = await translationRepo.findOne({
        where: { collectionId: entity.id, locale: tr.locale },
      });
      if (!existing) {
        await translationRepo.save(
          translationRepo.create({
            collectionId: entity.id,
            locale: tr.locale,
            name: tr.name,
            shortDescription: tr.shortDescription,
            description: tr.description,
            seoTitle: tr.seoTitle,
            seoDescription: tr.seoDescription,
            isAutoGenerated: false,
          }),
        );
      }
    }

    created(
      'Collection',
      `${c.name} (${products.length} products, ${c.translations.length} translations)`,
    );
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\n🌱  Starting seed...\n');

  await AppDataSource.initialize();

  try {
    await seedAdmin();
    const shapesByName = await seedNailShapes();
    const sizesByCode = await seedNailSizes();
    const productsByName = await seedProducts(shapesByName, sizesByCode);
    await seedSupplies();
    await seedCollections(productsByName);

    console.log('\n✅  Seed completed successfully.\n');
  } catch (err) {
    console.error('\n❌  Seed failed:', err);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

seed();
