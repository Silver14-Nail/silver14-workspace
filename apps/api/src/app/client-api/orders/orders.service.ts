import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

import { OrderEntity } from '@/db/entities/orders/order.entity';
import { PaymentEntity } from '@/db/entities/payments/payment.entity';
import { OrderStatus } from '@/common/enums/entity.enum';
import type { AuthenticatedUser } from '@/shared/auth/auth.types';

import { TrackOrderQueryDto } from './dto/track-order-query.dto';
import { MyOrdersQueryDto } from './dto/my-orders-query.dto';

type OrderTrackingStatus = 'Processing' | 'Crafting' | 'Shipped' | 'Delivered';

function mapStatus(status: OrderStatus): OrderTrackingStatus {
  switch (status) {
    case OrderStatus.SHIPPED:
      return 'Shipped';
    case OrderStatus.DELIVERED:
      return 'Delivered';
    case OrderStatus.PROCESSING:
      return 'Crafting';
    default:
      return 'Processing';
  }
}

@Injectable()
export class ClientOrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,
  ) {}

  private async findOrderForTracking(orderId: string): Promise<OrderEntity | null> {
    const prefix = orderId.trim().toLowerCase().replace(/[%_\\]/g, '\\$&');

    // Primary: UUID prefix lookup (our internal short reference)
    const byUuid = await this.orderRepo.findOne({
      where: { id: Like(`${prefix}%`) },
      relations: ['items', 'items.customSizeRequest'],
    });
    if (byUuid) return byUuid;

    // Fallback: gateway transaction ID (e.g. Lemon Squeezy order number from their email)
    const payment = await this.paymentRepo.findOne({
      where: { gatewayTxnId: orderId.trim() },
      relations: ['order', 'order.items', 'order.items.customSizeRequest'],
    });
    return payment?.order ?? null;
  }

  async trackOrder(dto: TrackOrderQueryDto) {
    const order = await this.findOrderForTracking(dto.orderId);

    if (!order || !order.contactSnapshot || order.contactSnapshot.phone !== dto.phone) {
      throw new NotFoundException('Order not found');
    }

    const [firstName = '', ...rest] = (order.shippingSnapshot.recipientName ?? '').split(' ');
    const lastName = rest.join(' ');

    return {
      id: order.id.slice(0, 8).toUpperCase(),
      status: mapStatus(order.status),
      createdAt: order.createdAt,
      currency: order.currency,
      subtotal: Number(order.subtotal),
      shippingFee: Number(order.shippingFee),
      discountAmount: Number(order.discountAmount),
      couponCode: order.couponCode ?? null,
      total: Number(order.total),
      shippingAddress: {
        firstName,
        lastName,
        address: order.shippingSnapshot.street,
        city: order.shippingSnapshot.city,
        postalCode: order.shippingSnapshot.postalCode ?? '',
        country: order.shippingSnapshot.country,
        shippingMethodName: order.shippingSnapshot.shippingMethodName ?? null,
      },
      items: order.items.map((item) => {
        const unitCost =
          Number(item.unitPrice) + Number(item.shapeSurcharge) - Number(item.itemDiscount);
        return {
          productName: item.productName ?? 'Product',
          variantName: item.sku ?? null,
          colorName: item.colorName ?? null,
          sizeName: item.sizeLabel,
          shapeName: item.shapeName,
          quantity: item.quantity,
          price: unitCost,
          lineTotal: unitCost * item.quantity,
          thumbnail: item.thumbnail ?? null,
          customization: item.customSizeRequest?.notes ?? null,
        };
      }),
    };
  }

  async getMyOrders(currentUser: AuthenticatedUser, query: MyOrdersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [orders, totalItems] = await this.orderRepo.findAndCount({
      where: { user: { id: currentUser.id } },
      relations: ['items'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items: orders.map((order) => ({
        id: order.id,
        status: order.status,
        trackingNumber: order.trackingNumber,
        total: Number(order.total),
        currency: order.currency,
        subtotal: Number(order.subtotal),
        discountAmount: Number(order.discountAmount),
        shippingFee: Number(order.shippingFee),
        createdAt: order.createdAt,
        itemCount: order.items?.length ?? 0,
      })),
      pagination: {
        totalItems,
        itemCount: orders.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  async getMyOrder(currentUser: AuthenticatedUser, orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, user: { id: currentUser.id } },
      relations: ['items', 'items.variant', 'items.variant.product', 'items.customSizeRequest'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const [firstName = '', ...rest] = (order.shippingSnapshot.recipientName ?? '').split(' ');
    const lastName = rest.join(' ');

    return {
      id: order.id,
      status: order.status,
      trackingNumber: order.trackingNumber,
      total: Number(order.total),
      currency: order.currency,
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      shippingFee: Number(order.shippingFee),
      createdAt: order.createdAt,
      itemCount: order.items?.length ?? 0,
      shippingAddress: {
        firstName,
        lastName,
        address: order.shippingSnapshot.street,
        city: order.shippingSnapshot.city,
        postalCode: order.shippingSnapshot.postalCode ?? '',
        country: order.shippingSnapshot.country,
        shippingMethodName: order.shippingSnapshot.shippingMethodName,
      },
      items: order.items.map((item) => {
        const unitCost =
          Number(item.unitPrice) + Number(item.shapeSurcharge) - Number(item.itemDiscount);
        return {
          productName: item.productName ?? item.variant?.product?.name ?? 'Product',
          sizeName: item.sizeLabel,
          shapeName: item.shapeName,
          colorName: item.colorName ?? item.variant?.colorName ?? null,
          thumbnail: item.thumbnail ?? null,
          quantity: item.quantity,
          price: unitCost,
          lineTotal: unitCost * item.quantity,
          customization: item.customSizeRequest?.notes ?? null,
        };
      }),
    };
  }
}
