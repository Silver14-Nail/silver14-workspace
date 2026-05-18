import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ShippingMethodEntity } from '@/db/entities/checkouts/shipping-method.entity';
import { CartEntity } from '@/db/entities/checkouts/cart.entity';
import { CheckoutSessionEntity } from '@/db/entities/checkouts/checkout-session.entity';
import { PaginationDTO } from '@/common/dtos/pagination';

import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';
import { CartListQueryDto } from './dto/cart-list-query.dto';
import { CheckoutSessionListQueryDto } from './dto/checkout-session-list-query.dto';

@Injectable()
export class CheckoutsService {
  constructor(
    @InjectRepository(ShippingMethodEntity)
    private readonly shippingMethodRepo: Repository<ShippingMethodEntity>,
    @InjectRepository(CartEntity)
    private readonly cartRepo: Repository<CartEntity>,
    @InjectRepository(CheckoutSessionEntity)
    private readonly sessionRepo: Repository<CheckoutSessionEntity>,
  ) {}

  // ─── Shipping Methods ────────────────────────────────────────────────────────

  listShippingMethods() {
    return this.shippingMethodRepo.find({ order: { fee: 'ASC' } });
  }

  async getShippingMethod(id: string) {
    const method = await this.shippingMethodRepo.findOneBy({ id });

    if (!method) {
      throw new NotFoundException('Shipping method not found');
    }

    return method;
  }

  createShippingMethod(dto: CreateShippingMethodDto) {
    const method = this.shippingMethodRepo.create({
      name: dto.name,
      carrier: dto.carrier ?? null,
      fee: dto.fee ?? 0,
      currency: dto.currency ?? 'USD',
      estDaysMin: dto.estDaysMin ?? null,
      estDaysMax: dto.estDaysMax ?? null,
      isActive: dto.isActive ?? true,
    });

    return this.shippingMethodRepo.save(method);
  }

  async updateShippingMethod(id: string, dto: UpdateShippingMethodDto) {
    const method = await this.shippingMethodRepo.findOneBy({ id });

    if (!method) {
      throw new NotFoundException('Shipping method not found');
    }

    if (dto.name !== undefined) method.name = dto.name;
    if (dto.carrier !== undefined) method.carrier = dto.carrier;
    if (dto.fee !== undefined) method.fee = dto.fee;
    if (dto.currency !== undefined) method.currency = dto.currency;
    if (dto.estDaysMin !== undefined) method.estDaysMin = dto.estDaysMin;
    if (dto.estDaysMax !== undefined) method.estDaysMax = dto.estDaysMax;
    if (dto.isActive !== undefined) method.isActive = dto.isActive;

    return this.shippingMethodRepo.save(method);
  }

  async removeShippingMethod(id: string): Promise<void> {
    const method = await this.shippingMethodRepo.findOneBy({ id });

    if (!method) {
      throw new NotFoundException('Shipping method not found');
    }

    await this.shippingMethodRepo.remove(method);
  }

  // ─── Carts ──────────────────────────────────────────────────────────────────

  async listCarts(query: CartListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.cartRepo
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.user', 'user')
      .leftJoinAndSelect('cart.guest', 'guest')
      .skip(skip)
      .take(limit)
      .orderBy('cart.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('cart.status = :status', { status: query.status });
    }

    if (query.userId) {
      qb.andWhere('cart.user.id = :userId', { userId: query.userId });
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

  async getCart(id: string) {
    const cart = await this.cartRepo.findOne({
      where: { id },
      relations: [
        'user',
        'guest',
        'items',
        'items.variant',
        'items.variant.shape',
        'items.variant.size',
      ],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return cart;
  }

  // ─── Checkout Sessions ───────────────────────────────────────────────────────

  async listCheckoutSessions(query: CheckoutSessionListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.sessionRepo
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.user', 'user')
      .leftJoinAndSelect('session.guest', 'guest')
      .skip(skip)
      .take(limit)
      .orderBy('session.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('session.status = :status', { status: query.status });
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

  async getCheckoutSession(id: string) {
    const session = await this.sessionRepo.findOne({
      where: { id },
      relations: ['user', 'guest', 'cart', 'cart.items', 'cart.items.variant'],
    });

    if (!session) {
      throw new NotFoundException('Checkout session not found');
    }

    return session;
  }
}
