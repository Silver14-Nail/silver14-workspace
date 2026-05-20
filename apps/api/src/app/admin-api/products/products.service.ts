import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';

import { ProductEntity } from '@/db/entities/products/product.entity';
import { NailShapeEntity } from '@/db/entities/products/nail-shape.entity';
import { NailSizeEntity } from '@/db/entities/products/nail-size.entity';
import { ProductImageEntity } from '@/db/entities/products/product-image.entity';
import { ProductVariantEntity } from '@/db/entities/products/product-variants.entity';

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
import { GetPresignedUrlDto } from './dto/get-presigned-url.dto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class ProductsService {
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
  ) {}

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
    const product = this.productRepo.create({
      name: dto.name,
      description: dto.description ?? null,
      basePrice: dto.basePrice,
      currency: dto.currency ?? 'USD',
      isActive: dto.isActive ?? true,
    });

    return this.productRepo.save(product);
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await this.productRepo.findOneBy({ id });

    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    if (dto.name !== undefined) product.name = dto.name;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.basePrice !== undefined) product.basePrice = dto.basePrice;
    if (dto.currency !== undefined) product.currency = dto.currency;
    if (dto.isActive !== undefined) product.isActive = dto.isActive;

    return this.productRepo.save(product);
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

  async getPresignedUploadUrl(productId: string, dto: GetPresignedUrlDto) {
    const product = await this.productRepo.findOneBy({ id: productId });
    if (!product) throw new NotFoundException(`Product #${productId} not found`);

    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucket = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.R2_PUBLIC_URL;

    if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
      throw new Error(
        'R2 storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL in .env',
      );
    }

    const ext = dto.filename.split('.').pop() ?? 'jpg';
    const key = `products/${productId}/${crypto.randomUUID()}.${ext}`;

    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: dto.contentType,
    });

    const presignedUrl = await getSignedUrl(client, command, { expiresIn: 300 });

    return {
      presignedUrl,
      key,
      publicUrl: `${publicUrl}/${key}`,
    };
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

    const shape = await this.nailShapeRepo.findOneBy({ id: dto.shapeId });
    if (!shape) throw new NotFoundException(`Nail shape #${dto.shapeId} not found`);

    const size = await this.nailSizeRepo.findOneBy({ id: dto.sizeId });
    if (!size) throw new NotFoundException(`Nail size #${dto.sizeId} not found`);

    if (dto.sku) {
      const existing = await this.productVariantRepo.findOne({ where: { sku: dto.sku } });
      if (existing) throw new ConflictException(`SKU "${dto.sku}" is already in use`);
    }

    const variant = this.productVariantRepo.create({
      product,
      shape,
      size,
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
      relations: ['shape', 'size'],
    });
    if (!variant) throw new NotFoundException(`Variant #${variantId} not found`);

    if (dto.shapeId !== undefined) {
      const shape = await this.nailShapeRepo.findOneBy({ id: dto.shapeId });
      if (!shape) throw new NotFoundException(`Nail shape #${dto.shapeId} not found`);
      variant.shape = shape;
    }

    if (dto.sizeId !== undefined) {
      const size = await this.nailSizeRepo.findOneBy({ id: dto.sizeId });
      if (!size) throw new NotFoundException(`Nail size #${dto.sizeId} not found`);
      variant.size = size;
    }

    if (dto.sku !== undefined) {
      if (dto.sku) {
        const existing = await this.productVariantRepo.findOne({ where: { sku: dto.sku } });
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
