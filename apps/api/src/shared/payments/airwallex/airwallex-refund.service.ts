import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  AirwallexDetailEntity,
  AirwallexDetailStatus,
} from '@/db/entities/payments/airwallex-detail.entity';
import { PaymentEntity } from '@/db/entities/payments/payment.entity';
import { PaymentGateway, PaymentStatus } from '@/common/enums/entity.enum';

import { AirwallexService } from './airwallex.service';

export interface AirwallexRefundParams {
  paymentId: string;
  /** Amount in cents. Omit for a full refund. */
  amountCents?: number;
  reason?: string;
}

@Injectable()
export class AirwallexRefundService {
  private readonly logger = new Logger(AirwallexRefundService.name);

  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,
    @InjectRepository(AirwallexDetailEntity)
    private readonly detailRepo: Repository<AirwallexDetailEntity>,
    private readonly airwallexService: AirwallexService,
  ) {}

  async refundPayment(params: AirwallexRefundParams): Promise<{ refundId: string }> {
    const payment = await this.paymentRepo.findOne({
      where: { id: params.paymentId },
      relations: ['airwallexDetail'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment "${params.paymentId}" not found`);
    }

    if (payment.gateway !== PaymentGateway.AIRWALLEX) {
      throw new BadRequestException(
        `Payment "${params.paymentId}" is not an Airwallex transaction (gateway: ${payment.gateway})`,
      );
    }

    if (
      payment.status !== PaymentStatus.PAID &&
      payment.status !== PaymentStatus.PARTIALLY_REFUNDED
    ) {
      throw new BadRequestException(
        `Cannot refund payment with status "${payment.status}" — only PAID or PARTIALLY_REFUNDED are eligible`,
      );
    }

    const detail = payment.airwallexDetail;
    if (!detail?.paymentIntentId) {
      throw new BadRequestException(
        'Airwallex payment_intent_id not recorded — cannot issue refund without it',
      );
    }

    if (detail.status === 'refunded' || detail.status === 'cancelled') {
      throw new BadRequestException(`Payment has already been ${detail.status}`);
    }

    const refundAmountCents = params.amountCents ?? detail.amountCents;

    if (refundAmountCents <= 0) {
      throw new BadRequestException('Refund amount must be greater than zero');
    }

    if (refundAmountCents > detail.amountCents) {
      throw new BadRequestException(
        `Refund amount ${refundAmountCents} cents exceeds original payment ${detail.amountCents} cents`,
      );
    }

    this.logger.log(
      `Airwallex refund: payment ${params.paymentId}, intent ${detail.paymentIntentId}, ` +
        `amount ${refundAmountCents} cents`,
    );

    const refund = await this.airwallexService.createRefund({
      paymentIntentId: detail.paymentIntentId,
      amount: refundAmountCents,
      currency: detail.currency,
      reason: params.reason,
    });

    this.logger.log(`Airwallex refund ${refund.id} created with status ${refund.status}`);

    const isFullRefund = refundAmountCents >= detail.amountCents;

    // Update payment status
    payment.status = isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;
    await this.paymentRepo.save(payment);

    // Update detail record
    await this.detailRepo.update(detail.id, {
      status: isFullRefund ? ('refunded' as AirwallexDetailStatus) : detail.status,
      gatewayResponse: refund as unknown as Record<string, any>,
    });

    return { refundId: refund.id };
  }
}
