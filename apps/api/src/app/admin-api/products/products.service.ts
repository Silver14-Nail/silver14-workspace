import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ProductVariantStrategy } from './strategies/product-variant.strategy';
import { NailVariantStrategy } from './strategies/nail-variant.strategy';
import { ColorVariantStrategy } from './strategies/color-variant.strategy';

interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

import { ProductEntity } from '@/db/entities/products/product.entity';
import { NailShapeEntity } from '@/db/entities/products/nail-shape.entity';
import { NailSizeEntity } from '@/db/entities/products/nail-size.entity';
import { ProductImageEntity } from '@/db/entities/products/product-image.entity';
import { ProductVariantEntity } from '@/db/entities/products/product-variants.entity';
import { ProductType } from '@/common/enums/entity.enum';

import { PaginationDTO } from '@/common/dtos/pagination';

import { ProductListQueryDto } from './dto/product-list-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateNailShapeDto } from './dto/create-nail-shape.dto';
import { UpdateNailShapeDto } from './dto/update-nail-shape.dto';
import { CreateNailSizeDto } from './dto/create-nail-size.dto';
import { UpdateNailSizeDto } from './dto/update-nail-size.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { AddImageDto } from './dto/add-image.dto';
import { ReorderImagesDto } from './dto/reorder-images.dto';
import { R2Service } from '@/shared/r2/r2.service';
import { TranslationService } from '@/shared/translation/translation.service';

@Injectable()
export class ProductsService {
  private readonly variantStrategies: Map<ProductType, ProductVariantStrategy>;

  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(NailShapeEntity)
    private readonly nailShapeRepo: Repository<NailShapeEntity>,
    @InjectRepository(NailSizeEntity)
    private readonly nailSizeRepo: Repository<NailSizeEntity>,
    @InjectRepository(ProductImageEntity)
    private readonly productImageRepo: Repository<ProductImageEntity>,
    @InjectRepository(ProductVariantEntity)
    private readonly productVariantRepo: Repository<ProductVariantEntity>,
    private readonly r2: R2Service,
    private readonly translationService: TranslationService,
    private readonly nailVariantStrategy: NailVariantStrategy,
    private readonly colorVariantStrategy: ColorVariantStrategy,
  ) {
    this.variantStrategies = new Map([
      [ProductType.NAIL, nailVariantStrategy],
      [ProductType.SUPPLY, colorVariantStrategy],
      [ProductType.ACCESSORY, colorVariantStrategy],
      [ProductType.TOOL, colorVariantStrategy],
    ]);
  }

  private getVariantStrategy(type: ProductType): ProductVariantStrategy {
    const strategy = this.variantStrategies.get(type);
    if (!strategy) throw new BadRequestException(`No variant strategy for product type: ${type}`);
    return strategy;
  }

  // ─── Products ───────────────────────────────────────────────────────────────

  async listProducts(query: ProductListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .orderBy('product.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.search) {
      qb.andWhere('LOWER(product.name) LIKE LOWER(:search)', {
        search: `%${query.search}%`,
      });
    }

    if (query.isActive !== undefined) {
      qb.andWhere('product.isActive = :isActive', { isActive: query.isActive });
    }

    if (query.type !== undefined) {
      qb.andWhere('product.type = :type', { type: query.type });
    }

    const [items, totalItems] = await qb.getManyAndCount();

    const pagination: PaginationDTO = {
      totalItems,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };

    return { items, pagination };
  }

  async getProduct(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: [
        'images',
        'shapePricings',
        'shapePricings.shape',
        'variants',
        'variants.shape',
        'variants.size',
      ],
    });

    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    return product;
  }

  async createProduct(dto: CreateProductDto) {
    const englishName = await this.translationService.resolveEnglishName(dto.name);
    const baseSlug = toSlug(englishName);
    let slug = baseSlug;
    let attempt = 0;
    while (await this.productRepo.findOne({ where: { slug } })) {
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    if (dto.salePrice != null && dto.salePrice >= dto.basePrice) {
      throw new BadRequestException('Sale price must be less than base price');
    }

    const productType = dto.type ?? ProductType.NAIL;

    const product = this.productRepo.create({
      name: dto.name,
      slug,
      description: dto.description ?? null,
      basePrice: dto.basePrice,
      salePrice: dto.salePrice ?? null,
      currency: dto.currency ?? 'USD',
      isActive: dto.isActive ?? true,
      isNew: dto.isNew ?? false,
      isBestSeller: dto.isBestSeller ?? false,
      type: productType,
    });

    const saved = await this.productRepo.save(product);

    // Auto-create a single default variant for non-NAIL products (supply, accessory, tool)
    if (productType !== ProductType.NAIL) {
      const defaultVariant = this.productVariantRepo.create({
        product: saved,
        shape: null,
        size: null,
        computedPrice: dto.salePrice ?? dto.basePrice,
        sku: dto.sku ?? null,
        stockQty: dto.stockQty ?? 0,
        isAvailable: true,
      });
      await this.productVariantRepo.save(defaultVariant);
    }

    // Fire-and-forget: generate translations asynchronously
    this.translationService.generateForProduct(saved).catch(() => undefined);
    return saved;
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await this.productRepo.findOneBy({ id });

    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    if (dto.name !== undefined) {
      product.name = dto.name;
      // Backfill slug for products created before auto-slug was added
      if (!product.slug) {
        const englishName = await this.translationService.resolveEnglishName(dto.name);
        const baseSlug = toSlug(englishName);
        let slug = baseSlug;
        let attempt = 0;
        while (await this.productRepo.findOne({ where: { slug } })) {
          attempt++;
          slug = `${baseSlug}-${attempt}`;
        }
        product.slug = slug;
      }
    }
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.basePrice !== undefined) product.basePrice = dto.basePrice;
    if (dto.currency !== undefined) product.currency = dto.currency;
    if (dto.isActive !== undefined) product.isActive = dto.isActive;
    if (dto.isNew !== undefined) product.isNew = dto.isNew;
    if (dto.isBestSeller !== undefined) product.isBestSeller = dto.isBestSeller;

    if (dto.salePrice !== undefined) {
      const effectiveBase = dto.basePrice ?? product.basePrice;
      const base = typeof effectiveBase === 'string' ? parseFloat(effectiveBase) : effectiveBase;
      if (dto.salePrice !== null && dto.salePrice >= base) {
        throw new BadRequestException('Sale price must be less than base price');
      }
      product.salePrice = dto.salePrice;
    }

    if (dto.type !== undefined) product.type = dto.type;

    const saved = await this.productRepo.save(product);

    // Sync default variant for non-NAIL products when SKU or stock is provided
    if (saved.type !== ProductType.NAIL && (dto.sku !== undefined || dto.stockQty !== undefined || dto.salePrice !== undefined || dto.basePrice !== undefined)) {
      const defaultVariant = await this.productVariantRepo.findOne({
        where: { product: { id: saved.id } },
        order: { createdAt: 'ASC' },
      });
      if (defaultVariant) {
        if (dto.sku !== undefined) defaultVariant.sku = dto.sku ?? null;
        if (dto.stockQty !== undefined) defaultVariant.stockQty = dto.stockQty;
        const newBase = dto.basePrice ?? (typeof saved.basePrice === 'string' ? parseFloat(saved.basePrice) : saved.basePrice);
        const newSale = dto.salePrice !== undefined ? dto.salePrice : saved.salePrice;
        defaultVariant.computedPrice = (newSale != null ? newSale : newBase) as number;
        await this.productVariantRepo.save(defaultVariant);
      }
    }

    // Regenerate translations only if translatable fields changed
    const needsRegen =
      dto.name !== undefined || dto.description !== undefined;
    if (needsRegen) {
      this.translationService.generateForProduct(saved).catch(() => undefined);
    }
    return saved;
  }

  async removeProduct(id: string) {
    const product = await this.productRepo.findOneBy({ id });

    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    await this.productRepo.softDelete(id);

    return { success: true };
  }

  // ─── Nail Shapes ────────────────────────────────────────────────────────────

  async listNailShapes(isActive?: boolean) {
    return this.nailShapeRepo.find({
      where: isActive !== undefined ? { isActive } : {},
      order: { name: 'ASC' },
    });
  }

  async getNailShape(id: string) {
    const shape = await this.nailShapeRepo.findOneBy({ id });

    if (!shape) {
      throw new NotFoundException(`Nail shape #${id} not found`);
    }

    return shape;
  }

  async createNailShape(dto: CreateNailShapeDto) {
    const shape = this.nailShapeRepo.create({
      name: dto.name,
      lengthMm: dto.lengthMm,
      sizeTier: dto.sizeTier,
      priceAdjustment: dto.priceAdjustment ?? 0,
      adjustmentType: dto.adjustmentType,
      isActive: dto.isActive ?? true,
    });

    return this.nailShapeRepo.save(shape);
  }

  async updateNailShape(id: string, dto: UpdateNailShapeDto) {
    const shape = await this.nailShapeRepo.findOneBy({ id });

    if (!shape) {
      throw new NotFoundException(`Nail shape #${id} not found`);
    }

    if (dto.name !== undefined) shape.name = dto.name;
    if (dto.lengthMm !== undefined) shape.lengthMm = dto.lengthMm;
    if (dto.sizeTier !== undefined) shape.sizeTier = dto.sizeTier;
    if (dto.priceAdjustment !== undefined) shape.priceAdjustment = dto.priceAdjustment;
    if (dto.adjustmentType !== undefined) shape.adjustmentType = dto.adjustmentType;
    if (dto.isActive !== undefined) shape.isActive = dto.isActive;

    return this.nailShapeRepo.save(shape);
  }

  async removeNailShape(id: string) {
    const shape = await this.nailShapeRepo.findOneBy({ id });

    if (!shape) {
      throw new NotFoundException(`Nail shape #${id} not found`);
    }

    await this.nailShapeRepo.softDelete(id);

    return { success: true };
  }

  // ─── Nail Sizes ─────────────────────────────────────────────────────────────

  async listNailSizes() {
    return this.nailSizeRepo.find({ order: { label: 'ASC' } });
  }

  async getNailSize(id: string) {
    const size = await this.nailSizeRepo.findOneBy({ id });

    if (!size) {
      throw new NotFoundException(`Nail size #${id} not found`);
    }

    return size;
  }

  async createNailSize(dto: CreateNailSizeDto) {
    const size = this.nailSizeRepo.create({
      label: dto.label,
      sizeCode: dto.sizeCode,
      measurements: dto.measurements ?? null,
    });

    return this.nailSizeRepo.save(size);
  }

  async updateNailSize(id: string, dto: UpdateNailSizeDto) {
    const size = await this.nailSizeRepo.findOneBy({ id });

    if (!size) {
      throw new NotFoundException(`Nail size #${id} not found`);
    }

    if (dto.label !== undefined) size.label = dto.label;
    if (dto.sizeCode !== undefined) size.sizeCode = dto.sizeCode;
    if (dto.measurements !== undefined) size.measurements = dto.measurements ?? null;

    return this.nailSizeRepo.save(size);
  }

  async removeNailSize(id: string) {
    const size = await this.nailSizeRepo.findOneBy({ id });

    if (!size) {
      throw new NotFoundException(`Nail size #${id} not found`);
    }

    await this.nailSizeRepo.remove(size);

    return { success: true };
  }

  // ─── Product Images ─────────────────────────────────────────────────────────

  async uploadProductImage(productId: string, file: UploadedFile) {
    const product = await this.productRepo.findOneBy({ id: productId });
    if (!product) throw new NotFoundException(`Product #${productId} not found`);

    const publicUrl = await this.r2.upload(file.buffer, file.mimetype, 'products');

    return this.addProductImage(productId, { url: publicUrl });
  }

  async addProductImage(productId: string, dto: AddImageDto) {
    const product = await this.productRepo.findOneBy({ id: productId });
    if (!product) throw new NotFoundException(`Product #${productId} not found`);

    const maxSortOrder = await this.productImageRepo
      .createQueryBuilder('img')
      .select('MAX(img.sortOrder)', 'max')
      .where('img.product_id = :productId', { productId })
      .getRawOne<{ max: number | null }>();

    const sortOrder = (maxSortOrder?.max ?? -1) + 1;

    if (dto.isMain) {
      await this.productImageRepo.update({ product: { id: productId } }, { isMain: false });
    }

    const hasImages = await this.productImageRepo.count({ where: { product: { id: productId } } });
    const image = this.productImageRepo.create({
      product,
      url: dto.url,
      isMain: dto.isMain ?? hasImages === 0,
      sortOrder,
    });

    return this.productImageRepo.save(image);
  }

  async removeProductImage(productId: string, imageId: string) {
    const image = await this.productImageRepo.findOne({
      where: { id: imageId, product: { id: productId } },
    });
    if (!image)
      throw new NotFoundException(`Image #${imageId} not found for product #${productId}`);

    await this.productImageRepo.remove(image);

    if (image.isMain) {
      const next = await this.productImageRepo.findOne({
        where: { product: { id: productId } },
        order: { sortOrder: 'ASC' },
      });
      if (next) {
        next.isMain = true;
        await this.productImageRepo.save(next);
      }
    }

    return { success: true };
  }

  async reorderProductImages(productId: string, dto: ReorderImagesDto) {
    const product = await this.productRepo.findOneBy({ id: productId });
    if (!product) throw new NotFoundException(`Product #${productId} not found`);

    await Promise.all(
      dto.orderedIds.map((id, index) =>
        this.productImageRepo.update({ id, product: { id: productId } }, { sortOrder: index }),
      ),
    );

    return { success: true };
  }

  async setMainProductImage(productId: string, imageId: string) {
    const image = await this.productImageRepo.findOne({
      where: { id: imageId, product: { id: productId } },
    });
    if (!image)
      throw new NotFoundException(`Image #${imageId} not found for product #${productId}`);

    await this.productImageRepo.update({ product: { id: productId } }, { isMain: false });
    image.isMain = true;
    return this.productImageRepo.save(image);
  }

  // ─── Product Variants ───────────────────────────────────────────────────────

  async listProductVariants(productId: string) {
    const product = await this.productRepo.findOneBy({ id: productId });
    if (!product) throw new NotFoundException(`Product #${productId} not found`);

    return this.productVariantRepo.find({
      where: { product: { id: productId } },
      relations: ['shape', 'size'],
      order: { createdAt: 'ASC' },
    });
  }

  async createProductVariant(productId: string, dto: CreateVariantDto) {
    const product = await this.productRepo.findOneBy({ id: productId });
    if (!product) throw new NotFoundException(`Product #${productId} not found`);

    if (dto.sku) {
      const existing = await this.productVariantRepo.findOne({
        where: { sku: dto.sku },
        withDeleted: true,
      });
      if (existing) throw new ConflictException(`SKU "${dto.sku}" is already in use`);
    }

    const strategy = this.getVariantStrategy(product.type);
    const typeFields = await strategy.buildCreateFields(dto);

    const variant = this.productVariantRepo.create({
      product,
      ...typeFields,
      sku: dto.sku ?? null,
      stockQty: dto.stockQty,
      computedPrice: dto.computedPrice,
      isAvailable: dto.isAvailable ?? true,
    });

    return this.productVariantRepo.save(variant);
  }

  async updateProductVariant(productId: string, variantId: string, dto: UpdateVariantDto) {
    const variant = await this.productVariantRepo.findOne({
      where: { id: variantId, product: { id: productId } },
      relations: ['shape', 'size', 'product'],
    });
    if (!variant) throw new NotFoundException(`Variant #${variantId} not found`);

    const strategy = this.getVariantStrategy(variant.product.type);
    await strategy.applyUpdateFields(variant, dto);

    if (dto.sku !== undefined) {
      if (dto.sku) {
        const existing = await this.productVariantRepo.findOne({
          where: { sku: dto.sku },
          withDeleted: true,
        });
        if (existing && existing.id !== variantId)
          throw new ConflictException(`SKU "${dto.sku}" is already in use`);
      }
      variant.sku = dto.sku ?? null;
    }

    if (dto.stockQty !== undefined) variant.stockQty = dto.stockQty;
    if (dto.computedPrice !== undefined) variant.computedPrice = dto.computedPrice;
    if (dto.isAvailable !== undefined) variant.isAvailable = dto.isAvailable;

    return this.productVariantRepo.save(variant);
  }

  async removeProductVariant(productId: string, variantId: string) {
    const variant = await this.productVariantRepo.findOne({
      where: { id: variantId, product: { id: productId } },
    });
    if (!variant) throw new NotFoundException(`Variant #${variantId} not found`);

    await this.productVariantRepo.softDelete(variantId);
    return { success: true };
  }
}
