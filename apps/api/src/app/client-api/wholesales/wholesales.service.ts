import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WholesaleEnquiryEntity } from '@/db/entities/wholesales/wholesale-enquiry.entity';
import { WholesaleAccountEntity } from '@/db/entities/wholesales/wholesale-account.entity';
import { WholesaleOrderEntity } from '@/db/entities/wholesales/wholesale-order.entity';
import { NewsletterSubscriberEntity } from '@/db/entities/wholesales/newsletter-subscribers.entity';
import { UserEntity } from '@/db/entities/auths/user.entity';
import { PaginationDTO } from '@/common/dtos/pagination';
import { NewsletterSource, NewsletterStatus, WholesaleEnquiryStatus } from '@/common/enums/entity.enum';
import type { AuthenticatedUser } from '@/shared/auth/auth.types';

import { SubmitEnquiryDto } from './dto/submit-enquiry.dto';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { UnsubscribeNewsletterDto } from './dto/unsubscribe-newsletter.dto';
import { WholesaleOrdersQueryDto } from './dto/wholesale-orders-query.dto';

@Injectable()
export class ClientWholesalesService {
  constructor(
    @InjectRepository(WholesaleEnquiryEntity)
    private readonly enquiryRepo: Repository<WholesaleEnquiryEntity>,
    @InjectRepository(WholesaleAccountEntity)
    private readonly accountRepo: Repository<WholesaleAccountEntity>,
    @InjectRepository(WholesaleOrderEntity)
    private readonly wholesaleOrderRepo: Repository<WholesaleOrderEntity>,
    @InjectRepository(NewsletterSubscriberEntity)
    private readonly newsletterRepo: Repository<NewsletterSubscriberEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  // ─── Enquiry ─────────────────────────────────────────────────────────────────

  async submitEnquiry(dto: SubmitEnquiryDto) {
    const enquiry = this.enquiryRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      country: dto.country,
      businessName: dto.businessName ?? null,
      businessType: dto.businessType ?? null,
      monthlyOrderQtyRange: dto.monthlyOrderQtyRange ?? null,
      collectionsOfInterest: dto.collectionsOfInterest ?? null,
      additionalMessage: dto.additionalMessage ?? null,
      status: WholesaleEnquiryStatus.PENDING,
    });

    return this.enquiryRepo.save(enquiry);
  }

  // ─── Account (authenticated wholesale user) ──────────────────────────────────

  async getMyAccount(currentUser: AuthenticatedUser) {
    const account = await this.accountRepo.findOne({
      where: { user: { id: currentUser.id }, isActive: true },
      relations: ['tier', 'user'],
    });

    if (!account) {
      throw new NotFoundException('No active wholesale account found for this user');
    }

    return {
      id: account.id,
      businessName: account.businessName,
      country: account.country,
      creditLimit: account.creditLimit,
      currentBalance: account.currentBalance,
      isActive: account.isActive,
      approvedAt: account.approvedAt,
      tier: account.tier
        ? {
            id: account.tier.id,
            name: account.tier.name,
            discountPercent: account.tier.discountPercent,
            freeShipping: account.tier.freeShipping,
            minOrderAmount: account.tier.minOrderAmount,
          }
        : null,
    };
  }

  async getMyOrders(currentUser: AuthenticatedUser, query: WholesaleOrdersQueryDto) {
    const account = await this.accountRepo.findOne({
      where: { user: { id: currentUser.id }, isActive: true },
    });

    if (!account) {
      throw new ForbiddenException('No active wholesale account');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.wholesaleOrderRepo
      .createQueryBuilder('wo')
      .leftJoinAndSelect('wo.order', 'order')
      .where('wo.account.id = :accountId', { accountId: account.id })
      .skip(skip)
      .take(limit)
      .orderBy('wo.createdAt', 'DESC');

    if (query.paymentStatus) {
      qb.andWhere('wo.paymentStatus = :paymentStatus', { paymentStatus: query.paymentStatus });
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

  // ─── Newsletter ───────────────────────────────────────────────────────────────

  async subscribe(dto: SubscribeNewsletterDto, userId?: string) {
    const existing = await this.newsletterRepo.findOneBy({ email: dto.email });

    if (existing) {
      if (existing.status === NewsletterStatus.ACTIVE) {
        throw new ConflictException('This email is already subscribed');
      }
      // Re-subscribe if previously unsubscribed
      existing.status = NewsletterStatus.ACTIVE;
      existing.unsubscribedAt = null;
      return this.newsletterRepo.save(existing);
    }

    let user: UserEntity | null = null;
    if (userId) {
      user = await this.userRepo.findOneBy({ id: userId });
    }

    const subscriber = this.newsletterRepo.create({
      email: dto.email,
      user: user ?? undefined,
      status: NewsletterStatus.ACTIVE,
      source: dto.source ?? NewsletterSource.FOOTER,
    });

    return this.newsletterRepo.save(subscriber);
  }

  async unsubscribe(dto: UnsubscribeNewsletterDto) {
    const subscriber = await this.newsletterRepo.findOneBy({ email: dto.email });

    if (!subscriber || subscriber.status === NewsletterStatus.UNSUBSCRIBED) {
      return { message: 'Email is not subscribed' };
    }

    subscriber.status = NewsletterStatus.UNSUBSCRIBED;
    subscriber.unsubscribedAt = new Date();
    await this.newsletterRepo.save(subscriber);

    return { message: 'Successfully unsubscribed' };
  }
}
