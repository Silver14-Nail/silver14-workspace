import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WholesaleAccountEntity } from '@/db/entities/wholesales/wholesale-account.entity';
import { WholesaleEnquiryEntity } from '@/db/entities/wholesales/wholesale-enquiry.entity';
import { WholesaleTierEntity } from '@/db/entities/wholesales/wholesale-tier.entity';
import { NewsletterSubscriberEntity } from '@/db/entities/wholesales/newsletter-subscribers.entity';
import { UserEntity } from '@/db/entities/auths/user.entity';

import { WholesalesService } from './wholesales.service';
import {
  WholesaleAccountsController,
  WholesaleEnquiriesController,
  WholesaleTiersController,
  NewsletterController,
} from './wholesales.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WholesaleAccountEntity,
      WholesaleEnquiryEntity,
      WholesaleTierEntity,
      NewsletterSubscriberEntity,
      UserEntity,
    ]),
  ],
  providers: [WholesalesService],
  controllers: [
    WholesaleAccountsController,
    WholesaleEnquiriesController,
    WholesaleTiersController,
    NewsletterController,
  ],
})
export class WholesalesModule {}
