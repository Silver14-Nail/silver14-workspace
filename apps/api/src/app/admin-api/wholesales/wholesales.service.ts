import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WholesaleAccountEntity } from '@/db/entities/wholesales/wholesale-account.entity';
import { WholesaleEnquiryEntity } from '@/db/entities/wholesales/wholesale-enquiry.entity';
import { WholesaleTierEntity } from '@/db/entities/wholesales/wholesale-tier.entity';
import { NewsletterSubscriberEntity } from '@/db/entities/wholesales/newsletter-subscribers.entity';
import { UserEntity } from '@/db/entities/auths/user.entity';
import { PaginationDTO } from '@/common/dtos/pagination';
import { NewsletterStatus } from '@/common/enums/entity.enum';

import { AccountListQueryDto } from './dto/account-list-query.dto';
import { UpdateWholesaleAccountDto } from './dto/update-wholesale-account.dto';
import { EnquiryListQueryDto } from './dto/enquiry-list-query.dto';
import { UpdateWholesaleEnquiryDto } from './dto/update-wholesale-enquiry.dto';
import { UpdateWholesaleTierDto } from './dto/update-wholesale-tier.dto';
import { NewsletterListQueryDto } from './dto/newsletter-list-query.dto';
import { UpdateNewsletterSubscriberDto } from './dto/update-newsletter-subscriber.dto';

@Injectable()
export class WholesalesService {
  constructor(
    @InjectRepository(WholesaleAccountEntity)
    private readonly accountRepo: Repository<WholesaleAccountEntity>,
    @InjectRepository(WholesaleEnquiryEntity)
    private readonly enquiryRepo: Repository<WholesaleEnquiryEntity>,
    @InjectRepository(WholesaleTierEntity)
    private readonly tierRepo: Repository<WholesaleTierEntity>,
    @InjectRepository(NewsletterSubscriberEntity)
    private readonly newsletterRepo: Repository<NewsletterSubscriberEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  // ─── Accounts ───────────────────────────────────────────────────────────────

  async listAccounts(query: AccountListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.accountRepo
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.user', 'user')
      .leftJoinAndSelect('account.tier', 'tier')
      .skip(skip)
      .take(limit)
      .orderBy('account.createdAt', 'DESC');

    if (query.search) {
      qb.andWhere(
        '(LOWER(account.businessName) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search))',
        { search: `%${query.search}%` },
      );
    }

    if (query.isActive !== undefined) {
      qb.andWhere('account.isActive = :isActive', { isActive: query.isActive });
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

  async getAccount(id: string) {
    const account = await this.accountRepo.findOne({
      where: { id },
      relations: ['user', 'enquiry', 'tier', 'approvedBy'],
    });

    if (!account) {
      throw new NotFoundException('Wholesale account not found');
    }

    return account;
  }

  async updateAccount(id: string, dto: UpdateWholesaleAccountDto) {
    const account = await this.accountRepo.findOneBy({ id });

    if (!account) {
      throw new NotFoundException('Wholesale account not found');
    }

    if (dto.businessName !== undefined) account.businessName = dto.businessName;
    if (dto.country !== undefined) account.country = dto.country;
    if (dto.creditLimit !== undefined) account.creditLimit = dto.creditLimit;
    if (dto.isActive !== undefined) account.isActive = dto.isActive;

    if (dto.tierId !== undefined) {
      const tier = await this.tierRepo.findOneBy({ id: dto.tierId });
      if (!tier) throw new NotFoundException('Wholesale tier not found');
      account.tier = tier;
    }

    return this.accountRepo.save(account);
  }

  async removeAccount(id: string): Promise<void> {
    const account = await this.accountRepo.findOneBy({ id });

    if (!account) {
      throw new NotFoundException('Wholesale account not found');
    }

    await this.accountRepo.softDelete(id);
  }

  // ─── Enquiries ──────────────────────────────────────────────────────────────

  async listEnquiries(query: EnquiryListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.enquiryRepo
      .createQueryBuilder('enquiry')
      .leftJoinAndSelect('enquiry.handledBy', 'handledBy')
      .skip(skip)
      .take(limit)
      .orderBy('enquiry.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('enquiry.status = :status', { status: query.status });
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

  async getEnquiry(id: string) {
    const enquiry = await this.enquiryRepo.findOne({
      where: { id },
      relations: ['handledBy', 'account'],
    });

    if (!enquiry) {
      throw new NotFoundException('Wholesale enquiry not found');
    }

    return enquiry;
  }

  async updateEnquiry(id: string, dto: UpdateWholesaleEnquiryDto) {
    const enquiry = await this.enquiryRepo.findOneBy({ id });

    if (!enquiry) {
      throw new NotFoundException('Wholesale enquiry not found');
    }

    if (dto.status !== undefined) enquiry.status = dto.status;
    if (dto.adminNotes !== undefined) enquiry.adminNotes = dto.adminNotes;

    if (dto.handledById !== undefined) {
      if (dto.handledById === null) {
        enquiry.handledBy = null;
      } else {
        const admin = await this.userRepo.findOneBy({ id: dto.handledById });
        if (!admin) throw new NotFoundException('Admin user not found');
        enquiry.handledBy = admin;
      }
    }

    if (dto.status !== undefined) {
      enquiry.respondedAt = new Date();
    }

    return this.enquiryRepo.save(enquiry);
  }

  // ─── Tiers ──────────────────────────────────────────────────────────────────

  async listTiers() {
    return this.tierRepo.find({ order: { name: 'ASC' } });
  }

  async getTier(id: string) {
    const tier = await this.tierRepo.findOneBy({ id });

    if (!tier) {
      throw new NotFoundException('Wholesale tier not found');
    }

    return tier;
  }

  async updateTier(id: string, dto: UpdateWholesaleTierDto) {
    const tier = await this.tierRepo.findOneBy({ id });

    if (!tier) {
      throw new NotFoundException('Wholesale tier not found');
    }

    if (dto.minMonthlyQty !== undefined) tier.minMonthlyQty = dto.minMonthlyQty;
    if (dto.discountPercent !== undefined) tier.discountPercent = dto.discountPercent;
    if (dto.maxDiscountAmount !== undefined) tier.maxDiscountAmount = dto.maxDiscountAmount;
    if (dto.freeShipping !== undefined) tier.freeShipping = dto.freeShipping;
    if (dto.minOrderAmount !== undefined) tier.minOrderAmount = dto.minOrderAmount;

    return this.tierRepo.save(tier);
  }

  // ─── Newsletter ─────────────────────────────────────────────────────────────

  async listNewsletterSubscribers(query: NewsletterListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.newsletterRepo
      .createQueryBuilder('subscriber')
      .skip(skip)
      .take(limit)
      .orderBy('subscriber.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('subscriber.status = :status', { status: query.status });
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

  async updateNewsletterSubscriber(id: string, dto: UpdateNewsletterSubscriberDto) {
    const subscriber = await this.newsletterRepo.findOneBy({ id });

    if (!subscriber) {
      throw new NotFoundException('Newsletter subscriber not found');
    }

    if (dto.status !== undefined) {
      subscriber.status = dto.status;
      if (dto.status === NewsletterStatus.UNSUBSCRIBED) {
        subscriber.unsubscribedAt = new Date();
      } else {
        subscriber.unsubscribedAt = null;
      }
    }

    return this.newsletterRepo.save(subscriber);
  }
}
