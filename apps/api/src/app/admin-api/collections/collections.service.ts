import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { CollectionEntity } from '@/db/entities/products/collection.entity';
import { ProductEntity } from '@/db/entities/products/product.entity';

import { CollectionListQueryDto } from './dto/collection-list-query.dto';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { AssignProductsDto } from './dto/assign-products.dto';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(CollectionEntity)
    private readonly collectionRepo: Repository<CollectionEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
  ) {}

  async listCollections(query: CollectionListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.collectionRepo
      .createQueryBuilder('c')
      .loadRelationCountAndMap('c.productCount', 'c.products', 'p', (pb) =>
        pb.where('p.deleted_at IS NULL AND p.is_active = true'),
      )
      .skip(skip)
      .take(limit)
      .orderBy('c.sortOrder', 'ASC')
      .addOrderBy('c.createdAt', 'DESC');

    if (query.search) {
      qb.andWhere('LOWER(c.name) LIKE LOWER(:search)', { search: `%${query.search}%` });
    }
    if (query.isActive !== undefined) {
      qb.andWhere('c.isActive = :isActive', { isActive: query.isActive });
    }
    if (query.isFeatured !== undefined) {
      qb.andWhere('c.isFeatured = :isFeatured', { isFeatured: query.isFeatured });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getCollection(id: string) {
    const collection = await this.collectionRepo.findOne({
      where: { id },
      relations: ['products', 'products.images'],
    });
    if (!collection) throw new NotFoundException('Collection not found');
    return collection;
  }

  async createCollection(dto: CreateCollectionDto) {
    const slug = dto.slug?.trim() || slugify(dto.name);
    await this.assertSlugUnique(slug);

    const collection = this.collectionRepo.create({
      name: dto.name,
      slug,
      description: dto.description ?? null,
      shortDescription: dto.shortDescription ?? null,
      image: dto.image ?? null,
      bannerImage: dto.bannerImage ?? null,
      seoTitle: dto.seoTitle ?? null,
      seoDescription: dto.seoDescription ?? null,
      isFeatured: dto.isFeatured ?? false,
      isActive: dto.isActive ?? true,
      sortOrder: dto.sortOrder ?? 0,
    });

    return this.collectionRepo.save(collection);
  }

  async updateCollection(id: string, dto: UpdateCollectionDto) {
    const collection = await this.findOrFail(id);

    if (dto.slug && dto.slug !== collection.slug) {
      await this.assertSlugUnique(dto.slug, id);
    }

    if (dto.name !== undefined) collection.name = dto.name;
    if (dto.slug !== undefined) collection.slug = dto.slug;
    if (dto.description !== undefined) collection.description = dto.description ?? null;
    if (dto.shortDescription !== undefined) collection.shortDescription = dto.shortDescription ?? null;
    if (dto.image !== undefined) collection.image = dto.image ?? null;
    if (dto.bannerImage !== undefined) collection.bannerImage = dto.bannerImage ?? null;
    if (dto.seoTitle !== undefined) collection.seoTitle = dto.seoTitle ?? null;
    if (dto.seoDescription !== undefined) collection.seoDescription = dto.seoDescription ?? null;
    if (dto.isFeatured !== undefined) collection.isFeatured = dto.isFeatured;
    if (dto.isActive !== undefined) collection.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) collection.sortOrder = dto.sortOrder;

    return this.collectionRepo.save(collection);
  }

  async removeCollection(id: string): Promise<void> {
    const collection = await this.findOrFail(id);
    await this.collectionRepo.softDelete(collection.id);
  }

  async activateCollection(id: string) {
    const collection = await this.findOrFail(id);
    collection.isActive = true;
    return this.collectionRepo.save(collection);
  }

  async deactivateCollection(id: string) {
    const collection = await this.findOrFail(id);
    collection.isActive = false;
    return this.collectionRepo.save(collection);
  }

  async featureCollection(id: string) {
    const collection = await this.findOrFail(id);
    collection.isFeatured = true;
    return this.collectionRepo.save(collection);
  }

  async unfeatureCollection(id: string) {
    const collection = await this.findOrFail(id);
    collection.isFeatured = false;
    return this.collectionRepo.save(collection);
  }

  async assignProducts(id: string, dto: AssignProductsDto) {
    const collection = await this.collectionRepo.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!collection) throw new NotFoundException('Collection not found');

    const products =
      dto.productIds.length > 0
        ? await this.productRepo.findBy({ id: In(dto.productIds) })
        : [];

    collection.products = products;
    return this.collectionRepo.save(collection);
  }

  async getStats() {
    const total = await this.collectionRepo.count();
    const active = await this.collectionRepo.count({ where: { isActive: true } });
    const featured = await this.collectionRepo.count({ where: { isFeatured: true } });
    return { total, active, featured };
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private async findOrFail(id: string): Promise<CollectionEntity> {
    const collection = await this.collectionRepo.findOneBy({ id });
    if (!collection) throw new NotFoundException('Collection not found');
    return collection;
  }

  private async assertSlugUnique(slug: string, excludeId?: string): Promise<void> {
    const qb = this.collectionRepo
      .createQueryBuilder('c')
      .withDeleted()
      .where('c.slug = :slug', { slug });
    if (excludeId) qb.andWhere('c.id != :excludeId', { excludeId });
    const existing = await qb.getOne();
    if (existing) throw new ConflictException(`Slug "${slug}" is already taken`);
  }
}
