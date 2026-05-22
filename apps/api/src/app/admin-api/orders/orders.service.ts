import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderEntity } from '@/db/entities/orders/order.entity';
import { PaymentEntity } from '@/db/entities/payments/payment.entity';
import { OrderStatus, PaymentStatus } from '@/common/enums/entity.enum';
import { PaginationDTO } from '@/common/dtos/pagination';

import { OrderListQueryDto } from './dto/order-list-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { UpdateShippingFeeDto } from './dto/update-shipping-fee.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';

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
    const sortField = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'DESC';

    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoin('order.payment', 'payment')
      .addSelect(['payment.status', 'payment.gateway', 'payment.amount'])
      .skip(skip)
      .take(limit);

    const sortColumn =
      sortField === 'total'
        ? 'order.total'
        : sortField === 'status'
          ? 'order.status'
          : 'order.createdAt';
    qb.orderBy(sortColumn, sortOrder);

    if (query.status) {
      qb.andWhere('order.status = :status', { status: query.status });
    }

    if (query.paymentStatus) {
      qb.andWhere('payment.status = :paymentStatus', { paymentStatus: query.paymentStatus });
    }

    if (query.search) {
      qb.andWhere(
        "(LOWER(user.email) LIKE LOWER(:search) OR order.id LIKE :search OR LOWER(JSON_UNQUOTE(JSON_EXTRACT(order.contactSnapshot, '$.email'))) LIKE LOWER(:search))",
        { search: `%${query.search}%` },
      );
    }

    if (query.dateFrom) {
      qb.andWhere('order.createdAt >= :dateFrom', { dateFrom: query.dateFrom });
    }

    if (query.dateTo) {
      qb.andWhere('order.createdAt <= :dateTo', { dateTo: new Date(query.dateTo + 'T23:59:59Z') });
    }

    if (query.minAmount !== undefined) {
      qb.andWhere('order.total >= :minAmount', { minAmount: query.minAmount });
    }

    if (query.maxAmount !== undefined) {
      qb.andWhere('order.total <= :maxAmount', { maxAmount: query.maxAmount });
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

  async updateOrderStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.orderRepo.findOneBy({ id });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (dto.status === order.status) {
      throw new BadRequestException(`Order is already in '${order.status}' status`);
    }

    const timestamp = new Date().toISOString();
    const noteEntry = dto.reason
      ? `[${timestamp}] Status changed: ${order.status} → ${dto.status}. Reason: ${dto.reason}`
      : `[${timestamp}] Status changed: ${order.status} → ${dto.status}`;

    order.status = dto.status;
    order.internalNotes = order.internalNotes ? `${order.internalNotes}\n${noteEntry}` : noteEntry;

    return this.orderRepo.save(order);
  }

  async updatePaymentStatus(id: string, dto: UpdatePaymentStatusDto) {
    const order = await this.orderRepo.findOneBy({ id });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const payment = await this.paymentRepo.findOne({ where: { order: { id } } });

    if (!payment) {
      throw new NotFoundException('Payment record not found for this order');
    }

    payment.status = dto.status;

    if (dto.status === PaymentStatus.PAID && !payment.paidAt) {
      payment.paidAt = new Date();
    }

    if (dto.note) {
      const timestamp = new Date().toISOString();
      const noteEntry = `[${timestamp}] Payment status → ${dto.status}. Note: ${dto.note}`;
      order.internalNotes = order.internalNotes
        ? `${order.internalNotes}\n${noteEntry}`
        : noteEntry;
      await this.orderRepo.save(order);
    }

    return this.paymentRepo.save(payment);
  }

  async updateShipping(id: string, dto: UpdateShippingDto) {
    const order = await this.orderRepo.findOneBy({ id });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (dto.carrier !== undefined) order.carrier = dto.carrier;
    if (dto.trackingNumber !== undefined) order.trackingNumber = dto.trackingNumber;

    return this.orderRepo.save(order);
  }

  async updateShippingFee(id: string, dto: UpdateShippingFeeDto) {
    const order = await this.orderRepo.findOneBy({ id });
    if (!order) throw new NotFoundException('Order not found');

    const newFee = Number(dto.shippingFee);
    const subtotal = Number(order.subtotal);
    const discount = Number(order.discountAmount);
    const newTotal = parseFloat((subtotal - discount + newFee).toFixed(2));

    const timestamp = new Date().toISOString();
    const note = `[${timestamp}] Shipping fee adjusted: ${Number(order.shippingFee).toFixed(2)} → ${newFee.toFixed(2)} (total: ${Number(order.total).toFixed(2)} → ${newTotal.toFixed(2)})`;

    order.shippingFee = newFee;
    order.total = newTotal;
    order.internalNotes = order.internalNotes ? `${order.internalNotes}\n${note}` : note;

    return this.orderRepo.save(order);
  }

  async cancelOrder(id: string, dto: CancelOrderDto) {
    const order = await this.orderRepo.findOneBy({ id });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.REFUNDED) {
      throw new BadRequestException(`Cannot cancel an order with status '${order.status}'`);
    }

    const timestamp = new Date().toISOString();
    const noteEntry = dto.reason
      ? `[${timestamp}] Order cancelled. Reason: ${dto.reason}`
      : `[${timestamp}] Order cancelled`;

    order.status = OrderStatus.CANCELLED;
    order.internalNotes = order.internalNotes ? `${order.internalNotes}\n${noteEntry}` : noteEntry;

    return this.orderRepo.save(order);
  }

  async getOrderStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      refundedOrders,
      revenueToday,
      revenueWeek,
      revenueMonth,
    ] = await Promise.all([
      this.orderRepo.count(),
      this.orderRepo.count({ where: { status: OrderStatus.PENDING } }),
      this.orderRepo.count({ where: { status: OrderStatus.PROCESSING } }),
      this.orderRepo.count({ where: { status: OrderStatus.SHIPPED } }),
      this.orderRepo.count({ where: { status: OrderStatus.DELIVERED } }),
      this.orderRepo.count({ where: { status: OrderStatus.CANCELLED } }),
      this.orderRepo.count({ where: { status: OrderStatus.REFUNDED } }),
      this.orderRepo
        .createQueryBuilder('o')
        .select('COALESCE(SUM(o.total), 0)', 'total')
        .where('o.createdAt >= :start', { start: startOfToday })
        .andWhere('o.status NOT IN (:...excluded)', {
          excluded: [OrderStatus.CANCELLED, OrderStatus.REFUNDED],
        })
        .getRawOne<{ total: string }>(),
      this.orderRepo
        .createQueryBuilder('o')
        .select('COALESCE(SUM(o.total), 0)', 'total')
        .where('o.createdAt >= :start', { start: startOfWeek })
        .andWhere('o.status NOT IN (:...excluded)', {
          excluded: [OrderStatus.CANCELLED, OrderStatus.REFUNDED],
        })
        .getRawOne<{ total: string }>(),
      this.orderRepo
        .createQueryBuilder('o')
        .select('COALESCE(SUM(o.total), 0)', 'total')
        .where('o.createdAt >= :start', { start: startOfMonth })
        .andWhere('o.status NOT IN (:...excluded)', {
          excluded: [OrderStatus.CANCELLED, OrderStatus.REFUNDED],
        })
        .getRawOne<{ total: string }>(),
    ]);

    return {
      counts: {
        total: totalOrders,
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
        refunded: refundedOrders,
      },
      revenue: {
        today: parseFloat(revenueToday?.total ?? '0'),
        thisWeek: parseFloat(revenueWeek?.total ?? '0'),
        thisMonth: parseFloat(revenueMonth?.total ?? '0'),
      },
    };
  }

  async removeOrder(id: string): Promise<void> {
    const order = await this.orderRepo.findOneBy({ id });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.orderRepo.softDelete(id);
  }
}
