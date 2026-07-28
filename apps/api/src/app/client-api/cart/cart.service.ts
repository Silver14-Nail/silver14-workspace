import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CartEntity } from '@/db/entities/checkouts/cart.entity';
import { CartItemEntity } from '@/db/entities/checkouts/cart-item.entity';
import { ProductVariantEntity } from '@/db/entities/products/product-variants.entity';
import { CartStatus } from '@/common/enums/entity.enum';

import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';

const CART_EXPIRY_HOURS = 72;

const CART_ITEM_RELATIONS = [
  'items',
  'items.variant',
  'items.variant.product',
  'items.variant.product.images',
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

    // Custom-size items are always unique orders (different measurements per set).
    // Only merge standard-size items that share the same variantId.
    const existing = dto.isCustomSize
      ? null
      : await this.cartItemRepo.findOne({
          where: { cart: { id: cart.id }, variant: { id: dto.variantId }, isCustomSize: false },
        });

    if (existing) {
      const newQty = existing.quantity + dto.quantity;
      if (variant.stockQty < newQty) {
        throw new BadRequestException('Insufficient stock for requested quantity');
      }
      existing.quantity = newQty;
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

  // Adds multiple items in one request instead of one round-trip per item —
  // the DB pool is capped at 1 connection per instance (see
  // database.module.ts), so this stays strictly sequential internally
  // rather than parallelizing, which would just contend for that connection.
  // Best-effort per item, same as calling addItem() once per item in a loop:
  // one variant being invalid/out of stock doesn't fail the whole batch.
  async addItems(dtos: AddCartItemDto[], userId?: string, cartId?: string) {
    const cart = await this.findOrCreateCart(userId, cartId);

    for (const dto of dtos) {
      try {
        const variant = await this.variantRepo.findOne({
          where: { id: dto.variantId },
          relations: ['product'],
        });
        if (!variant || variant.stockQty < dto.quantity) continue;

        const existing = dto.isCustomSize
          ? null
          : await this.cartItemRepo.findOne({
              where: { cart: { id: cart.id }, variant: { id: dto.variantId }, isCustomSize: false },
            });

        if (existing) {
          const newQty = existing.quantity + dto.quantity;
          if (variant.stockQty < newQty) continue;
          existing.quantity = newQty;
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
      } catch {
        // Skip this item, keep processing the rest.
      }
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

  async clearCart(userId?: string, cartId?: string) {
    const cart = await this.findCart(userId, cartId);
    if (!cart) return null;
    await this.cartItemRepo.delete({ cart: { id: cart.id } });
    return this.loadCart(cart.id);
  }

  async mergeCart(dto: MergeCartDto, userId: string) {
    const userCart = await this.findOrCreateCart(userId);

    const guestCart = await this.cartRepo.findOne({
      where: { id: dto.guestCartId, status: CartStatus.ACTIVE },
      relations: ['items', 'items.variant', 'user'],
    });

    if (!guestCart || guestCart.items.length === 0) {
      return this.loadCart(userCart.id);
    }

    if (guestCart.user !== null) {
      throw new BadRequestException('Cannot merge an authenticated user cart');
    }

    for (const guestItem of guestCart.items) {
      const existing = guestItem.isCustomSize
        ? null
        : await this.cartItemRepo.findOne({
            where: {
              cart: { id: userCart.id },
              variant: { id: guestItem.variant.id },
              isCustomSize: false,
            },
          });

      if (existing) {
        const merged = Math.min(existing.quantity + guestItem.quantity, guestItem.variant.stockQty);
        existing.quantity = merged;
        await this.cartItemRepo.save(existing);
      } else {
        guestItem.cart = userCart;
        await this.cartItemRepo.save(guestItem);
      }
    }

    guestCart.status = CartStatus.MERGED;
    await this.cartRepo.save(guestCart);

    return this.loadCart(userCart.id);
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
