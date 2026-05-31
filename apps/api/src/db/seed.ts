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

function log(msg: string) {
  process.stdout.write(`  ${msg}\n`);
}
function skip(entity: string, id: string) {
  log(`↷  ${entity} already exists — skipping (${id})`);
}
function created(entity: string, id: string) {
  log(`✓  ${entity} created (${id})`);
}

// ─── Admin user ───────────────────────────────────────────────────────────────

const ADMIN = {
  fullName: 'Silver14 Admin',
  email: 'admin@silver14.com',
  password: 'Admin@123456',
};

async function seedAdmin() {
  const repo = AppDataSource.getRepository(UserEntity);
  const existing = await repo.findOne({ where: { email: ADMIN.email } });
  if (existing) {
    skip('Admin user', ADMIN.email);
    return;
  }

  await repo.save(
    repo.create({
      fullName: ADMIN.fullName,
      email: ADMIN.email,
      passwordHash: hashSync(ADMIN.password, 12),
      role: UserRole.ADMIN,
      emailVerified: true,
      isActive: true,
      phone: null,
      avatarUrl: null,
      lastLoginAt: null,
    }),
  );
  created('Admin user', `${ADMIN.email} / ${ADMIN.password}`);
}

// ─── Nail shapes ──────────────────────────────────────────────────────────────

const NAIL_SHAPES = [
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

async function seedNailShapes() {
  const repo = AppDataSource.getRepository(NailShapeEntity);
  for (const shape of NAIL_SHAPES) {
    const existing = await repo.findOne({ where: { name: shape.name } });
    if (existing) {
      skip('NailShape', shape.name);
      continue;
    }
    await repo.save(repo.create({ ...shape, isActive: true }));
    created('NailShape', shape.name);
  }
}

// ─── Nail sizes ───────────────────────────────────────────────────────────────

const NAIL_SIZES = [
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

async function seedNailSizes() {
  const repo = AppDataSource.getRepository(NailSizeEntity);
  for (const size of NAIL_SIZES) {
    const existing = await repo.findOne({ where: { sizeCode: size.sizeCode } });
    if (existing) {
      skip('NailSize', size.sizeCode);
      continue;
    }
    await repo.save(repo.create(size));
    created('NailSize', size.sizeCode);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\n🌱  Starting seed...\n');
  await AppDataSource.initialize();
  try {
    await seedAdmin();
    await seedNailShapes();
    await seedNailSizes();
    console.log('\n✅  Seed completed successfully.\n');
  } catch (err) {
    console.error('\n❌  Seed failed:', err);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

seed();
