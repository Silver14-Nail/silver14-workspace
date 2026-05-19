import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CartEntity } from '@/db/entities/checkouts/cart.entity';
import { CartItemEntity } from '@/db/entities/checkouts/cart-item.entity';
import { ProductVariantEntity } from '@/db/entities/products/product-variants.entity';
import { CartStatus } from '@/common/enums/entity.enum';

import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

const CART_EXPIRY_HOURS = 72;

const CART_ITEM_RELATIONS = [
  'items',
  'items.variant',
  'items.variant.product',
  'items.variant.shape',
  'items.variant.size',
];

@Injectable()
export class ClientCartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepo: Repository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepo: Repository<CartItemEntity>,
    @InjectRepository(ProductVariantEntity)
    private readonly variantRepo: Repository<ProductVariantEntity>,
  ) {}

  async getCart(userId?: string, cartId?: string) {
    const cart = await this.findCart(userId, cartId);
    if (!cart) return null;
    return this.loadCart(cart.id);
  }

  async addItem(dto: AddCartItemDto, userId?: string, cartId?: string) {
    const variant = await this.variantRepo.findOne({
      where: { id: dto.variantId },
      relations: ['product'],
    });

    if (!variant) throw new NotFoundException('Product variant not found');
    if (variant.stockQty < dto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const cart = await this.findOrCreateCart(userId, cartId);

    const existing = await this.cartItemRepo.findOne({
      where: { cart: { id: cart.id }, variant: { id: dto.variantId } },
    });

    if (existing) {
      const newQty = existing.quantity + dto.quantity;
      if (variant.stockQty < newQty) {
        throw new BadRequestException('Insufficient stock for requested quantity');
      }
      existing.quantity = newQty;
      if (dto.isCustomSize !== undefined) existing.isCustomSize = dto.isCustomSize;
      if (dto.customMeasurements !== undefined) {
        existing.customMeasurements = dto.customMeasurements ?? null;
      }
      await this.cartItemRepo.save(existing);
    } else {
      const item = this.cartItemRepo.create({
        cart,
        variant,
        quantity: dto.quantity,
        isCustomSize: dto.isCustomSize ?? false,
        customMeasurements: dto.customMeasurements ?? null,
      });
      await this.cartItemRepo.save(item);
    }

    const updated = await this.loadCart(cart.id);
    return { cart: updated, cartId: cart.id };
  }

  async updateItem(itemId: string, dto: UpdateCartItemDto, userId?: string, cartId?: string) {
    const cart = await this.findCart(userId, cartId);
    if (!cart) throw new NotFoundException('Cart not found');

    const item = await this.cartItemRepo.findOne({
      where: { id: itemId, cart: { id: cart.id } },
      relations: ['variant'],
    });

    if (!item) throw new NotFoundException('Cart item not found');
    if (item.variant.stockQty < dto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    item.quantity = dto.quantity;
    await this.cartItemRepo.save(item);

    return this.loadCart(cart.id);
  }

  async removeItem(itemId: string, userId?: string, cartId?: string) {
    const cart = await this.findCart(userId, cartId);
    if (!cart) throw new NotFoundException('Cart not found');

    const item = await this.cartItemRepo.findOne({
      where: { id: itemId, cart: { id: cart.id } },
    });

    if (!item) throw new NotFoundException('Cart item not found');
    await this.cartItemRepo.remove(item);

    return this.loadCart(cart.id);
  }

  private async findCart(userId?: string, cartId?: string): Promise<CartEntity | null> {
    if (userId) {
      return this.cartRepo.findOne({
        where: { user: { id: userId }, status: CartStatus.ACTIVE },
      });
    }
    if (cartId) {
      return this.cartRepo.findOne({
        where: { id: cartId, status: CartStatus.ACTIVE },
      });
    }
    return null;
  }

  private async findOrCreateCart(userId?: string, cartId?: string): Promise<CartEntity> {
    const existing = await this.findCart(userId, cartId);
    if (existing) return existing;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + CART_EXPIRY_HOURS);

    const cart = this.cartRepo.create({
      user: userId ? ({ id: userId } as any) : null,
      guest: null,
      status: CartStatus.ACTIVE,
      expiresAt,
    });

    return this.cartRepo.save(cart);
  }

  private loadCart(cartId: string) {
    return this.cartRepo.findOne({
      where: { id: cartId },
      relations: CART_ITEM_RELATIONS,
    });
  }
}
