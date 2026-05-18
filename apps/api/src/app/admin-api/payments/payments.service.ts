import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaymentEntity } from '@/db/entities/payments/payment.entity';
import { PaypalDetailEntity } from '@/db/entities/payments/paypal-detail.entity';
import { CardDetailEntity } from '@/db/entities/payments/card-detail.entity';
import { PaginationDTO } from '@/common/dtos/pagination';
import { PaymentGateway } from '@/common/enums/entity.enum';

import { PaymentListQueryDto } from './dto/payment-list-query.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,
    @InjectRepository(PaypalDetailEntity)
    private readonly paypalRepo: Repository<PaypalDetailEntity>,
    @InjectRepository(CardDetailEntity)
    private readonly cardRepo: Repository<CardDetailEntity>,
  ) {}

  async listPayments(query: PaymentListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'order')
      .leftJoinAndSelect('order.user', 'user')
      .skip(skip)
      .take(limit)
      .orderBy('payment.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('payment.status = :status', { status: query.status });
    }

    if (query.gateway) {
      qb.andWhere('payment.gateway = :gateway', { gateway: query.gateway });
    }

    if (query.search) {
      qb.andWhere('LOWER(payment.gatewayTxnId) LIKE LOWER(:search)', {
        search: `%${query.search}%`,
      });
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

  async getPayment(id: string) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['order', 'order.user', 'order.items'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Load gateway-specific detail based on payment gateway type
    let gatewayDetail: PaypalDetailEntity | CardDetailEntity | null = null;

    if (payment.gateway === PaymentGateway.PAYPAL) {
      gatewayDetail = await this.paypalRepo.findOne({
        where: { payment: { id } },
      });
    } else {
      // Stripe or Braintree → card detail
      gatewayDetail = await this.cardRepo.findOne({
        where: { payment: { id } },
      });
    }

    return { ...payment, gatewayDetail };
  }
}
