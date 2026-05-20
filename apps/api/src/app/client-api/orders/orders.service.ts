import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderEntity } from '@/db/entities/orders/order.entity';
import { OrderStatus } from '@/common/enums/entity.enum';
import { TrackOrderQueryDto } from './dto/track-order-query.dto';

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
  ) {}

  async trackOrder(dto: TrackOrderQueryDto) {
    const order = await this.orderRepo.findOne({
      where: { id: dto.orderId },
      relations: ['items', 'items.variant', 'items.variant.product'],
    });

    if (!order || order.contactSnapshot.phone !== dto.phone) {
      throw new NotFoundException('Order not found');
    }

    const [firstName = '', ...rest] = (order.shippingSnapshot.recipientName ?? '').split(' ');
    const lastName = rest.join(' ');

    return {
      id: order.id,
      status: mapStatus(order.status),
      createdAt: order.createdAt,
      total: Number(order.total),
      shippingAddress: {
        firstName,
        lastName,
        address: order.shippingSnapshot.street,
        city: order.shippingSnapshot.city,
        postalCode: order.shippingSnapshot.postalCode ?? '',
        country: order.shippingSnapshot.country,
      },
      items: order.items.map((item) => {
        const unitCost =
          Number(item.unitPrice) + Number(item.shapeSurcharge) - Number(item.itemDiscount);
        return {
          productName: item.variant?.product?.name ?? 'Product',
          sizeName: item.sizeLabel,
          shapeName: item.shapeName,
          quantity: item.quantity,
          price: unitCost,
          lineTotal: unitCost * item.quantity,
        };
      }),
    };
  }
}
