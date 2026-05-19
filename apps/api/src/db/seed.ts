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
}[] = [
  { name: 'Short Oval', lengthMm: 20, sizeTier: ShapeSizeTier.STANDARD, priceAdjustment: 0 },
  { name: 'Short Almond', lengthMm: 20, sizeTier: ShapeSizeTier.STANDARD, priceAdjustment: 0 },
  { name: 'Short Square', lengthMm: 20, sizeTier: ShapeSizeTier.STANDARD, priceAdjustment: 0 },
  { name: 'Medium Almond', lengthMm: 25, sizeTier: ShapeSizeTier.STANDARD, priceAdjustment: 0 },
  { name: 'Medium Square', lengthMm: 25, sizeTier: ShapeSizeTier.STANDARD, priceAdjustment: 0 },
  { name: 'Medium Coffin', lengthMm: 25, sizeTier: ShapeSizeTier.STANDARD, priceAdjustment: 0 },
  { name: 'Long Almond', lengthMm: 28, sizeTier: ShapeSizeTier.LONG, priceAdjustment: 0 },
  { name: 'Long Coffin', lengthMm: 30, sizeTier: ShapeSizeTier.LONG, priceAdjustment: 0 },
  { name: 'Long Square', lengthMm: 30, sizeTier: ShapeSizeTier.LONG, priceAdjustment: 0 },
  { name: 'Stiletto', lengthMm: 32, sizeTier: ShapeSizeTier.LONG, priceAdjustment: 0 },
  { name: 'XXL Stiletto', lengthMm: 55, sizeTier: ShapeSizeTier.EXTRA_LONG, priceAdjustment: 10 },
  { name: 'XXL Coffin', lengthMm: 40, sizeTier: ShapeSizeTier.EXTRA_LONG, priceAdjustment: 10 },
  { name: 'XXL Square', lengthMm: 40, sizeTier: ShapeSizeTier.EXTRA_LONG, priceAdjustment: 10 },
];

const NAIL_SIZES: { label: NailSizeLabel; sizeCode: string; measurements: string }[] = [
  { label: NailSizeLabel.XS, sizeCode: 'XS', measurements: '14-10-11-10-8' },
  { label: NailSizeLabel.S, sizeCode: 'S', measurements: '15-11-12-11-9' },
  { label: NailSizeLabel.M, sizeCode: 'M', measurements: '16-12-13-12-9' },
  { label: NailSizeLabel.L, sizeCode: 'L', measurements: '17-13-14-13-10' },
  { label: NailSizeLabel.CUSTOM, sizeCode: 'CUSTOM', measurements: 'Per finger measurement' },
];

const IMAGE_BASE = 'https://pub-f7a3d0f6a04b429da226cd17dd1d685d.r2.dev/mock-products';

const PRODUCTS: {
  name: string;
  description: string;
  basePrice: number;
  currency: string;
  images: string[];
}[] = [
  {
    name: 'Pink Muse',
    description:
      'Pink Muse is an artistic press-on nail set featuring dreamy pink tones, standout 3D details, and metallic accents. Blending dollcore aesthetics with high-fashion style, it creates a unique and eye-catching look.',
    basePrice: 48,
    currency: 'EUR',
    images: ['image1.jpg', 'image2.jpg', 'image3.jpg', 'image4.jpg', 'image5.jpg'],
  },
  {
    name: 'Monkey Sundae',
    description:
      'Monkey Sundae is a playful and dreamy press-on nail set inspired by sweet desserts and kawaii aesthetics. Featuring soft pink tones, banana and chocolate details, glossy 3D textures, floral accents, and an adorable monkey charm.',
    basePrice: 50,
    currency: 'EUR',
    images: ['image6.jpg', 'image7.jpg', 'image8.jpg', 'image9.jpg'],
  },
  {
    name: 'Petal Fantasy',
    description:
      'Petal Fantasy is a dreamy and elegant press-on nail set inspired by blooming petals and glossy fantasy textures. Featuring soft pink and cherry-red tones, delicate 3D flowers, flowing swirl details, and glass-like water effects.',
    basePrice: 45,
    currency: 'EUR',
    images: ['image10.jpg', 'image11.jpg', 'image12.jpg'],
  },
  {
    name: 'Pink Butterfly Cat Eye',
    description:
      'Pink Butterfly Cat Eye is a dreamy and elegant press-on nail set featuring shimmering pink cat-eye effects, butterfly-inspired designs, glossy 3D textures, and luxurious gold details.',
    basePrice: 55,
    currency: 'EUR',
    images: ['image13.jpg', 'image14.jpg', 'image15.jpg', 'image16.jpg'],
  },
  {
    name: 'Heart Blossom Cat Eye',
    description:
      'Heart Blossom Cat Eye is a luxurious and feminine press-on nail set featuring green, blue, and purple tones combined with a moonlight cat-eye effect. The design stands out with soft 3D flowers, raised chrome heart details, and delicate gold outlines.',
    basePrice: 45,
    currency: 'EUR',
    images: ['image17.jpg', 'image18.jpg', 'image19.jpg', 'image20.jpg'],
  },
  {
    name: 'Ivory Gold Bloom',
    description:
      'Ivory Gold Bloom is a luxurious and elegant press-on nail set featuring soft ivory nude tones combined with delicate gold metallic details. The design stands out with soft 3D flowers, seashell-inspired patterns, and raised textures.',
    basePrice: 48,
    currency: 'EUR',
    images: ['image21.jpg', 'image22.jpg', 'image23.jpg'],
  },
  {
    name: 'Pink Seashell Bloom',
    description:
      'Pink Seashell Bloom is a dreamy and feminine press-on nail set inspired by the beauty of seashells and ocean blossoms. Featuring soft pink tones, delicate 3D flowers, seashell-inspired textures, and elegant gold charms.',
    basePrice: 48,
    currency: 'EUR',
    images: ['image24.jpg', 'image25.jpg', 'image26.jpg', 'image27.jpg'],
  },
  {
    name: 'Timeless Emerald',
    description:
      'Timeless Emerald is a luxurious vintage-inspired press-on nail set featuring elegant sage emerald tones combined with intricate gold details. The design highlights ornate clock motifs, flowing baroque patterns, soft 3D flowers.',
    basePrice: 58,
    currency: 'EUR',
    images: ['image28.jpg', 'image29.jpg', 'image30.jpg', 'image31.jpg'],
  },
  {
    name: 'Petal Glow Cat Eye',
    description:
      'Petal Glow Cat Eye is a luxurious and feminine press-on nail set featuring elegant rose gold cat-eye effects blended with soft nude pink tones. The design is adorned with delicate 3D flower petals and pearl accents.',
    basePrice: 45,
    currency: 'EUR',
    images: ['image35.jpg', 'image36.jpg', 'image37.jpg', 'image38.jpg'],
  },
  {
    name: 'Sunset Petal Glow',
    description:
      'Sunset Petal Glow is a dreamy tropical-inspired press-on nail set featuring warm sunset shades of peach, coral, pink, and soft nude tones with delicate 3D flowers and luxurious gold accents.',
    basePrice: 50,
    currency: 'EUR',
    images: ['image39.jpg', 'image40.jpg', 'image41.jpg'],
  },
  {
    name: 'Berry Bloom Luxe',
    description:
      'Berry Bloom Luxe is a glamorous press-on nail set featuring rich berry pink tones blended with soft nude shades and luxurious gold accents. The design combines elegant 3D floral details and glossy gradient effects.',
    basePrice: 45,
    currency: 'EUR',
    images: ['image42.jpg', 'image43.jpg', 'image44.jpg', 'image45.jpg'],
  },
  {
    name: 'Golden Eclipse',
    description:
      'Golden Eclipse is a luxurious and bold press-on nail set featuring a striking combination of glossy black, white marble swirls, and molten gold chrome details. Inspired by the mysterious beauty of an eclipse.',
    basePrice: 35,
    currency: 'EUR',
    images: ['image46.jpg', 'image47.jpg', 'image48.jpg'],
  },
  {
    name: 'Celestial Glow',
    description:
      'Celestial Glow is a dreamy press-on nail set featuring soft pink tones blended with mesmerizing aurora-like holographic effects. The design showcases glossy chrome finishes, delicate 3D bows, and sparkling star details.',
    basePrice: 30,
    currency: 'EUR',
    images: ['image53.jpg', 'image54.jpg', 'image55.jpg', 'image56.jpg'],
  },
  {
    name: 'Midnight Orchid',
    description:
      'Midnight Orchid is a bold and elegant press-on nail set inspired by the mysterious beauty of orchids under the night sky. Featuring deep plum, soft nude, and blush pink tones with sculpted 3D orchid flowers.',
    basePrice: 40,
    currency: 'EUR',
    images: ['image57.jpg', 'image58.jpg', 'image59.jpg'],
  },
  {
    name: 'Aurora Bloom',
    description:
      'Aurora Bloom is a mesmerizing press-on nail set inspired by the glowing beauty of the northern lights. Featuring radiant pink, lilac, and iridescent chrome tones with sculpted 3D petals and holographic reflections.',
    basePrice: 45,
    currency: 'EUR',
    images: ['image60.jpg', 'image61.jpg', 'image62.jpg'],
  },
  {
    name: 'Cyber Nebula',
    description:
      'Cyber Nebula is a futuristic press-on nail set inspired by cosmic galaxies and cyberpunk aesthetics. Featuring vibrant pink, violet, and chrome blue tones with holographic reflections and abstract web patterns.',
    basePrice: 48,
    currency: 'EUR',
    images: ['image63.jpg', 'image64.jpg', 'image65.jpg'],
  },
  {
    name: 'Phantom Silver',
    description:
      'Phantom Silver is a dark and futuristic press-on nail set featuring striking black, silver chrome, and smoky metallic tones. Combines sculpted armor-like textures, reflective chrome finishes, and celestial details.',
    basePrice: 40,
    currency: 'EUR',
    images: ['image66.jpg', 'image67.jpg', 'image68.jpg', 'image69.jpg'],
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

async function seedNailShapes() {
  const repo = AppDataSource.getRepository(NailShapeEntity);

  for (const shape of NAIL_SHAPES) {
    const existing = await repo.findOne({ where: { name: shape.name } });
    if (existing) {
      skip('NailShape', shape.name);
      continue;
    }

    const entity = repo.create({
      name: shape.name,
      lengthMm: shape.lengthMm,
      sizeTier: shape.sizeTier,
      priceAdjustment: shape.priceAdjustment,
      adjustmentType: PriceAdjustmentType.FIXED,
      isActive: true,
    });

    await repo.save(entity);
    created('NailShape', shape.name);
  }
}

async function seedNailSizes() {
  const repo = AppDataSource.getRepository(NailSizeEntity);

  for (const size of NAIL_SIZES) {
    const existing = await repo.findOne({ where: { sizeCode: size.sizeCode } });
    if (existing) {
      skip('NailSize', size.sizeCode);
      continue;
    }

    const entity = repo.create({
      label: size.label,
      sizeCode: size.sizeCode,
      measurements: size.measurements,
    });

    await repo.save(entity);
    created('NailSize', size.sizeCode);
  }
}

async function seedProducts() {
  const productRepo = AppDataSource.getRepository(ProductEntity);
  const imageRepo = AppDataSource.getRepository(ProductImageEntity);

  for (const p of PRODUCTS) {
    const existing = await productRepo.findOne({ where: { name: p.name } });
    if (existing) {
      skip('Product', p.name);
      continue;
    }

    const product = productRepo.create({
      name: p.name,
      description: p.description,
      basePrice: p.basePrice,
      currency: p.currency,
      isActive: true,
    });

    const savedProduct = await productRepo.save(product);

    const images = p.images.map((filename, idx) =>
      imageRepo.create({
        url: `${IMAGE_BASE}/${filename}`,
        sortOrder: idx,
        product: savedProduct,
      }),
    );

    await imageRepo.save(images);
    created('Product', `${p.name} (${p.images.length} images)`);
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
    await seedProducts();

    console.log('\n✅  Seed completed successfully.\n');
  } catch (err) {
    console.error('\n❌  Seed failed:', err);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

seed();
