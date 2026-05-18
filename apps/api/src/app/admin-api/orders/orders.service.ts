import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderEntity } from '@/db/entities/orders/order.entity';
import { PaymentEntity } from '@/db/entities/payments/payment.entity';
import { PaginationDTO } from '@/common/dtos/pagination';

import { OrderListQueryDto } from './dto/order-list-query.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,
  ) {}

  async listOrders(query: OrderListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .skip(skip)
      .take(limit)
      .orderBy('order.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('order.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere(
        "(LOWER(user.email) LIKE LOWER(:search) OR CAST(order.id AS TEXT) LIKE :search OR order.contactSnapshot->>'email' LIKE LOWER(:search))",
        { search: `%${query.search}%` },
      );
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

  async getOrder(id: string) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: [
        'user',
        'coupon',
        'shippingMethod',
        'items',
        'items.variant',
        'items.variant.shape',
        'items.variant.size',
        'items.customSizeRequest',
      ],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const payment = await this.paymentRepo.findOne({
      where: { order: { id } },
      relations: ['paypalDetail', 'cardDetail'],
    });

    return { ...order, payment: payment ?? null };
  }

  async updateOrder(id: string, dto: UpdateOrderDto) {
    const order = await this.orderRepo.findOneBy({ id });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (dto.status !== undefined) order.status = dto.status;
    if (dto.trackingNumber !== undefined) order.trackingNumber = dto.trackingNumber;

    return this.orderRepo.save(order);
  }

  async removeOrder(id: string): Promise<void> {
    const order = await this.orderRepo.findOneBy({ id });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.orderRepo.softDelete(id);
  }
}
