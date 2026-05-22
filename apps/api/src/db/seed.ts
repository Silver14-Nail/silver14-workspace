import 'reflect-metadata';
import { hashSync } from 'bcryptjs';
import { AppDataSource } from './ormconfig';
import {
  NailSizeLabel,
  PriceAdjustmentType,
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
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
}[] = [
  {
    name: 'Almond',
    lengthMm: 18,
    sizeTier: ShapeSizeTier.STANDARD,
    priceAdjustment: 0,
    adjustmentType: PriceAdjustmentType.FIXED,
  },
  {
    name: 'Coffin',
    lengthMm: 20,
    sizeTier: ShapeSizeTier.MEDIUM,
    priceAdjustment: 2,
    adjustmentType: PriceAdjustmentType.FIXED,
  },
  {
    name: 'Square',
    lengthMm: 15,
    sizeTier: ShapeSizeTier.STANDARD,
    priceAdjustment: 0,
    adjustmentType: PriceAdjustmentType.FIXED,
  },
  {
    name: 'Oval',
    lengthMm: 17,
    sizeTier: ShapeSizeTier.STANDARD,
    priceAdjustment: 0,
    adjustmentType: PriceAdjustmentType.FIXED,
  },
  {
    name: 'Stiletto',
    lengthMm: 25,
    sizeTier: ShapeSizeTier.LARGE,
    priceAdjustment: 5,
    adjustmentType: PriceAdjustmentType.FIXED,
  },
  {
    name: 'Ballerina',
    lengthMm: 22,
    sizeTier: ShapeSizeTier.MEDIUM,
    priceAdjustment: 3,
    adjustmentType: PriceAdjustmentType.FIXED,
  },
  {
    name: 'XXL Stiletto',
    lengthMm: 35,
    sizeTier: ShapeSizeTier.XL,
    priceAdjustment: 10,
    adjustmentType: PriceAdjustmentType.FIXED,
  },
];

const NAIL_SIZES: { label: NailSizeLabel; sizeCode: string; measurements: string }[] = [
  { label: NailSizeLabel.XS, sizeCode: 'XS', measurements: 'width: 12mm, length: 16mm' },
  { label: NailSizeLabel.S, sizeCode: 'S', measurements: 'width: 13mm, length: 17mm' },
  { label: NailSizeLabel.M, sizeCode: 'M', measurements: 'width: 14mm, length: 18mm' },
  { label: NailSizeLabel.L, sizeCode: 'L', measurements: 'width: 15mm, length: 19mm' },
  { label: NailSizeLabel.XL, sizeCode: 'XL', measurements: 'width: 16mm, length: 20mm' },
  { label: NailSizeLabel.XXL, sizeCode: 'XXL', measurements: 'width: 17mm, length: 22mm' },
];

type ShapePricingInput = {
  shapeName: string;
  priceOverride: number | null;
  priceAdjustment: number | null;
  adjustmentType: PriceAdjustmentType | null;
};

type VariantInput = {
  shapeName: string;
  sizeCode: string;
  sku: string;
  stockQty: number;
  computedPrice: number;
};

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
  shapePricings: ShapePricingInput[];
  variants: VariantInput[];
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
    shapePricings: [
      { shapeName: 'Almond', priceOverride: null, priceAdjustment: null, adjustmentType: null },
      { shapeName: 'Coffin', priceOverride: null, priceAdjustment: null, adjustmentType: null },
      { shapeName: 'Square', priceOverride: null, priceAdjustment: null, adjustmentType: null },
      { shapeName: 'Stiletto', priceOverride: 50.0, priceAdjustment: null, adjustmentType: null },
    ],
    variants: [
      { shapeName: 'Almond', sizeCode: 'XS', sku: 'S14-CA-ALM-XS', stockQty: 24, computedPrice: 38.0 },
      { shapeName: 'Almond', sizeCode: 'S', sku: 'S14-CA-ALM-S', stockQty: 32, computedPrice: 38.0 },
      { shapeName: 'Almond', sizeCode: 'M', sku: 'S14-CA-ALM-M', stockQty: 18, computedPrice: 38.0 },
      { shapeName: 'Coffin', sizeCode: 'S', sku: 'S14-CA-COF-S', stockQty: 15, computedPrice: 40.0 },
      { shapeName: 'Coffin', sizeCode: 'M', sku: 'S14-CA-COF-M', stockQty: 22, computedPrice: 40.0 },
      { shapeName: 'Stiletto', sizeCode: 'L', sku: 'S14-CA-STL-L', stockQty: 8, computedPrice: 50.0 },
      { shapeName: 'Stiletto', sizeCode: 'XL', sku: 'S14-CA-STL-XL', stockQty: 0, computedPrice: 50.0 },
    ],
    translations: [
      {
        locale: 'en',
        name: 'Crystal Aurora Set',
        description: 'Shimmering translucent gel nails with aurora effect',
        seoTitle: 'Crystal Aurora Nail Set — Silver14',
        seoDescription: 'Shop Crystal Aurora press-on nails with shimmering translucent aurora effect. Available in Almond, Coffin, Square, and Stiletto shapes.',
      },
      {
        locale: 'vi',
        name: 'Bộ Móng Crystal Aurora',
        description: 'Móng gel trong suốt lấp lánh với hiệu ứng cực quang',
        seoTitle: 'Bộ Móng Crystal Aurora — Silver14',
        seoDescription: 'Mua móng giả Crystal Aurora với hiệu ứng cực quang lấp lánh. Có các hình dạng Almond, Coffin, Square và Stiletto.',
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
    shapePricings: [
      { shapeName: 'Almond', priceOverride: null, priceAdjustment: null, adjustmentType: null },
      { shapeName: 'Square', priceOverride: null, priceAdjustment: null, adjustmentType: null },
      {
        shapeName: 'Ballerina',
        priceOverride: null,
        priceAdjustment: 2.0,
        adjustmentType: PriceAdjustmentType.FIXED,
      },
    ],
    variants: [
      { shapeName: 'Almond', sizeCode: 'S', sku: 'S14-MV-ALM-S', stockQty: 30, computedPrice: 35.0 },
      { shapeName: 'Almond', sizeCode: 'M', sku: 'S14-MV-ALM-M', stockQty: 25, computedPrice: 35.0 },
      { shapeName: 'Square', sizeCode: 'XS', sku: 'S14-MV-SQR-XS', stockQty: 12, computedPrice: 35.0 },
      { shapeName: 'Ballerina', sizeCode: 'L', sku: 'S14-MV-BAL-L', stockQty: 18, computedPrice: 38.0 },
    ],
    translations: [
      {
        locale: 'en',
        name: 'Midnight Velvet',
        description: 'Deep black matte finish with velvet texture',
        seoTitle: 'Midnight Velvet Nail Set — Silver14',
        seoDescription: 'Shop Midnight Velvet press-on nails. Deep black matte finish with luxurious velvet texture.',
      },
      {
        locale: 'vi',
        name: 'Midnight Velvet',
        description: 'Lớp hoàn thiện matte đen sâu với kết cấu nhung',
        seoTitle: 'Bộ Móng Midnight Velvet — Silver14',
        seoDescription: 'Mua móng giả Midnight Velvet. Lớp hoàn thiện matte đen sâu với kết cấu nhung sang trọng.',
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
    shapePricings: [
      { shapeName: 'Coffin', priceOverride: null, priceAdjustment: null, adjustmentType: null },
      { shapeName: 'Oval', priceOverride: null, priceAdjustment: null, adjustmentType: null },
      {
        shapeName: 'XXL Stiletto',
        priceOverride: 60.0,
        priceAdjustment: null,
        adjustmentType: null,
      },
    ],
    variants: [
      { shapeName: 'Coffin', sizeCode: 'S', sku: 'S14-RQ-COF-S', stockQty: 8, computedPrice: 44.0 },
      { shapeName: 'Coffin', sizeCode: 'M', sku: 'S14-RQ-COF-M', stockQty: 4, computedPrice: 44.0 },
      { shapeName: 'Oval', sizeCode: 'M', sku: 'S14-RQ-OVL-M', stockQty: 0, computedPrice: 42.0 },
      { shapeName: 'XXL Stiletto', sizeCode: 'XL', sku: 'S14-RQ-XXL-XL', stockQty: 0, computedPrice: 60.0 },
    ],
    translations: [
      {
        locale: 'en',
        name: 'Rose Quartz Luxe',
        description: 'Elegant pink gradient with gold accents',
        seoTitle: 'Rose Quartz Luxe Nail Set — Silver14',
        seoDescription: 'Shop Rose Quartz Luxe press-on nails. Elegant pink gradient with gold accents, perfect for weddings and special occasions.',
      },
      {
        locale: 'vi',
        name: 'Rose Quartz Luxe',
        description: 'Gradient hồng thanh lịch với điểm nhấn vàng',
        seoTitle: 'Bộ Móng Rose Quartz Luxe — Silver14',
        seoDescription: 'Mua móng giả Rose Quartz Luxe. Gradient hồng thanh lịch với điểm nhấn vàng, hoàn hảo cho đám cưới và các dịp đặc biệt.',
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
        description: 'Discover the newest nail art designs added to our collection. Fresh styles, trending shapes, and vibrant colours arrive every week.',
        seoTitle: 'New Arrivals — Silver14 Nail',
        seoDescription: 'Shop the latest press-on nail sets from Silver14. New designs added weekly.',
      },
      {
        locale: 'vi',
        name: 'Hàng Mới Về',
        shortDescription: 'Các mẫu mới nhất từ xưởng của chúng tôi',
        description: 'Khám phá những mẫu nail art mới nhất trong bộ sưu tập của chúng tôi. Các kiểu mới, hình dạng thịnh hành và màu sắc rực rỡ cập nhật hàng tuần.',
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
        description: 'The nail sets our customers keep coming back to. Tried, tested, and loved by thousands of happy customers worldwide.',
        seoTitle: 'Best Sellers — Silver14 Nail',
        seoDescription: "Shop Silver14's bestselling press-on nail sets loved by customers worldwide.",
      },
      {
        locale: 'vi',
        name: 'Bán Chạy Nhất',
        shortDescription: 'Những bộ móng được yêu thích nhất',
        description: 'Những bộ móng mà khách hàng của chúng tôi không ngừng quay lại. Đã được thử nghiệm và yêu thích bởi hàng nghìn khách hàng hài lòng trên toàn thế giới.',
        seoTitle: 'Bán Chạy Nhất — Silver14 Nail',
        seoDescription: 'Mua bộ móng giả bán chạy nhất của Silver14 được khách hàng toàn cầu yêu thích.',
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
        description: 'Our finest nail art sets crafted with premium materials. Designed for those moments when only the best will do.',
        seoTitle: 'Luxury Collection — Silver14 Nail',
        seoDescription: "Explore Silver14's luxury press-on nail sets for weddings, galas, and special events.",
      },
      {
        locale: 'vi',
        name: 'Bộ Sưu Tập Cao Cấp',
        shortDescription: 'Nghệ thuật móng tay hạng sang cho các dịp đặc biệt',
        description: 'Những bộ nail art tinh tế nhất của chúng tôi được chế tác từ nguyên liệu cao cấp. Dành cho những khoảnh khắc chỉ có điều tốt nhất mới đủ.',
        seoTitle: 'Bộ Sưu Tập Cao Cấp — Silver14 Nail',
        seoDescription: 'Khám phá bộ móng giả cao cấp của Silver14 cho đám cưới, dạ tiệc và sự kiện đặc biệt.',
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
        description: 'Timeless French manicure styles elevated with modern twists. From clean classic whites to coloured and glitter tips.',
        seoTitle: 'French Collection — Silver14 Nail',
        seoDescription: 'Classic and modern French tip press-on nails from Silver14.',
      },
      {
        locale: 'vi',
        name: 'Bộ Sưu Tập French',
        shortDescription: 'Đầu móng French cổ điển được tái hiện',
        description: 'Những kiểu manicure French vượt thời gian được nâng tầm với những cách tân hiện đại. Từ đầu móng trắng cổ điển đến đầu móng màu sắc và glitter.',
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
        description: 'Sophisticated nude and neutral tones that complement every skin tone and outfit. Perfect for the office or a night out.',
        seoTitle: 'Nude Collection — Silver14 Nail',
        seoDescription: "Shop Silver14's nude and neutral press-on nail sets for every skin tone.",
      },
      {
        locale: 'vi',
        name: 'Bộ Sưu Tập Nude',
        shortDescription: 'Sự thanh lịch tinh tế trong từng tông màu',
        description: 'Tông màu nude và trung tính tinh tế phù hợp với mọi tông da và trang phục. Hoàn hảo cho văn phòng hay buổi tối ra ngoài.',
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
        description: 'Bridal-inspired nail sets designed to complement wedding looks. Elegant, romantic, and unforgettable for brides and bridal parties.',
        seoTitle: 'Wedding Collection — Silver14 Nail',
        seoDescription: 'Bridal and wedding press-on nail sets from Silver14. Perfect for your big day.',
      },
      {
        locale: 'vi',
        name: 'Bộ Sưu Tập Cưới',
        shortDescription: 'Móng tay đẹp cho ngày trọng đại của bạn',
        description: 'Bộ móng lấy cảm hứng từ cô dâu được thiết kế để hoàn thiện vẻ đẹp đám cưới. Thanh lịch, lãng mạn và không thể quên cho cô dâu và phù dâu.',
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
        description: 'Celebrate the season with pastel shades, floral designs, and light-catching finishes that capture the energy of spring.',
        seoTitle: 'Spring Collection — Silver14 Nail',
        seoDescription: 'Spring-inspired press-on nails with pastels and florals from Silver14.',
      },
      {
        locale: 'vi',
        name: 'Bộ Sưu Tập Mùa Xuân',
        shortDescription: 'Hoa tươi và tông màu pastel',
        description: 'Chào đón mùa với các sắc pastel, thiết kế hoa và lớp hoàn thiện bắt sáng thể hiện năng lượng mùa xuân.',
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
        description: 'Vibrant shades and playful designs made for summer adventures. From beach days to rooftop parties.',
        seoTitle: 'Summer Collection — Silver14 Nail',
        seoDescription: 'Summer press-on nail sets with bold colours and playful designs from Silver14.',
      },
      {
        locale: 'vi',
        name: 'Bộ Sưu Tập Mùa Hè',
        shortDescription: 'Màu sắc táo bạo cho những ngày nắng',
        description: 'Màu sắc rực rỡ và thiết kế vui tươi dành cho những chuyến phiêu lưu mùa hè. Từ ngày ở bãi biển đến tiệc trên sân thượng.',
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
        description: 'Glittery, sparkly, and festive nail sets for holiday parties, Christmas gatherings, and New Year celebrations.',
        seoTitle: 'Holiday Collection — Silver14 Nail',
        seoDescription: 'Festive and holiday press-on nail sets from Silver14. Perfect for Christmas and New Year.',
      },
      {
        locale: 'vi',
        name: 'Bộ Sưu Tập Lễ Hội',
        shortDescription: 'Móng tay lễ hội cho mọi dịp kỷ niệm',
        description: 'Bộ móng lấp lánh, tỏa sáng và lễ hội cho các buổi tiệc, lễ Giáng Sinh và kỷ niệm Năm Mới.',
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
        description: 'Our curated selection of the most-searched and talked-about nail styles right now. Stay ahead of the trend.',
        seoTitle: 'Trending Now — Silver14 Nail',
        seoDescription: 'Shop trending press-on nail designs from Silver14. Updated regularly.',
      },
      {
        locale: 'vi',
        name: 'Xu Hướng Hiện Tại',
        shortDescription: 'Những gì mọi người đang dùng mùa này',
        description: 'Tuyển chọn những kiểu móng được tìm kiếm và bàn luận nhiều nhất hiện nay. Luôn đi đầu xu hướng.',
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

    // Shape pricings
    for (const sp of p.shapePricings) {
      const shape = shapesByName.get(sp.shapeName);
      if (!shape) {
        log(`⚠  Shape "${sp.shapeName}" not found — skipping pricing for ${p.name}`);
        continue;
      }
      await pricingRepo.save(
        pricingRepo.create({
          product,
          shape,
          priceOverride: sp.priceOverride,
          priceAdjustment: sp.priceAdjustment,
          adjustmentType: sp.adjustmentType,
          isEnabled: true,
        }),
      );
    }

    // Variants — isAvailable derived from stockQty
    for (const v of p.variants) {
      const shape = shapesByName.get(v.shapeName);
      const size = sizesByCode.get(v.sizeCode);
      if (!shape || !size) {
        log(
          `⚠  Shape "${v.shapeName}" or size "${v.sizeCode}" not found — skipping variant for ${p.name}`,
        );
        continue;
      }
      await variantRepo.save(
        variantRepo.create({
          product,
          shape,
          size,
          sku: v.sku,
          stockQty: v.stockQty,
          computedPrice: v.computedPrice,
          isAvailable: v.stockQty > 0,
        }),
      );
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
      `${p.name} | ${p.images.length} images | ${p.shapePricings.length} pricings | ${p.variants.length} variants | ${p.translations.length} translations`,
    );
  }

  return result;
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

    created('Collection', `${c.name} (${products.length} products, ${c.translations.length} translations)`);
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
