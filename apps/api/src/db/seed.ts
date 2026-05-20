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
  stockQty: number;
  computedPrice: number;
};

type ProductInput = {
  name: string;
  description: string;
  basePrice: number;
  salePrice?: number | null;
  currency: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  images: string[];
  shapePricings: ShapePricingInput[];
  variants: VariantInput[];
};

const PRODUCTS: ProductInput[] = [
  {
    name: 'Crystal Aurora Set',
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
      { shapeName: 'Almond', sizeCode: 'XS', stockQty: 24, computedPrice: 38.0 },
      { shapeName: 'Almond', sizeCode: 'S', stockQty: 32, computedPrice: 38.0 },
      { shapeName: 'Almond', sizeCode: 'M', stockQty: 18, computedPrice: 38.0 },
      { shapeName: 'Coffin', sizeCode: 'S', stockQty: 15, computedPrice: 40.0 },
      { shapeName: 'Coffin', sizeCode: 'M', stockQty: 22, computedPrice: 40.0 },
      { shapeName: 'Stiletto', sizeCode: 'L', stockQty: 8, computedPrice: 50.0 },
      { shapeName: 'Stiletto', sizeCode: 'XL', stockQty: 0, computedPrice: 50.0 },
    ],
  },
  {
    name: 'Midnight Velvet',
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
      { shapeName: 'Almond', sizeCode: 'S', stockQty: 30, computedPrice: 35.0 },
      { shapeName: 'Almond', sizeCode: 'M', stockQty: 25, computedPrice: 35.0 },
      { shapeName: 'Square', sizeCode: 'XS', stockQty: 12, computedPrice: 35.0 },
      { shapeName: 'Ballerina', sizeCode: 'L', stockQty: 18, computedPrice: 38.0 },
    ],
  },
  {
    name: 'Rose Quartz Luxe',
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
      { shapeName: 'Coffin', sizeCode: 'S', stockQty: 8, computedPrice: 44.0 },
      { shapeName: 'Coffin', sizeCode: 'M', stockQty: 4, computedPrice: 44.0 },
      { shapeName: 'Oval', sizeCode: 'M', stockQty: 0, computedPrice: 42.0 },
      { shapeName: 'XXL Stiletto', sizeCode: 'XL', stockQty: 0, computedPrice: 60.0 },
    ],
  },
];

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
) {
  const productRepo = AppDataSource.getRepository(ProductEntity);
  const imageRepo = AppDataSource.getRepository(ProductImageEntity);
  const pricingRepo = AppDataSource.getRepository(ProductShapePricingEntity);
  const variantRepo = AppDataSource.getRepository(ProductVariantEntity);

  for (const p of PRODUCTS) {
    let product = await productRepo.findOne({ where: { name: p.name } });
    if (product) {
      skip('Product', p.name);
      continue;
    }

    product = await productRepo.save(
      productRepo.create({
        name: p.name,
        description: p.description,
        basePrice: p.basePrice,
        salePrice: p.salePrice ?? null,
        currency: p.currency,
        isActive: true,
        isNew: p.isNew ?? false,
        isBestSeller: p.isBestSeller ?? false,
      }),
    );

    await imageRepo.save(
      p.images.map((url, idx) => imageRepo.create({ url, sortOrder: idx, product })),
    );

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
          stockQty: v.stockQty,
          computedPrice: v.computedPrice,
        }),
      );
    }

    created(
      'Product',
      `${p.name} (${p.images.length} images, ${p.shapePricings.length} pricings, ${p.variants.length} variants)`,
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
    await seedProducts(shapesByName, sizesByCode);

    console.log('\n✅  Seed completed successfully.\n');
  } catch (err) {
    console.error('\n❌  Seed failed:', err);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

seed();
