import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WholesaleEnquiryEntity } from '@/db/entities/wholesales/wholesale-enquiry.entity';
import { WholesaleAccountEntity } from '@/db/entities/wholesales/wholesale-account.entity';
import { WholesaleOrderEntity } from '@/db/entities/wholesales/wholesale-order.entity';
import { WholesaleTierEntity } from '@/db/entities/wholesales/wholesale-tier.entity';
import { NewsletterSubscriberEntity } from '@/db/entities/wholesales/newsletter-subscribers.entity';
import { UserEntity } from '@/db/entities/auths/user.entity';
import { AuthModule } from '@/shared/auth/auth.module';

import { ClientWholesalesService } from './wholesales.service';
import {
  WholesaleEnquiryController,
  WholesaleAccountController,
  NewsletterController,
} from './wholesales.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WholesaleEnquiryEntity,
      WholesaleAccountEntity,
      WholesaleOrderEntity,
      WholesaleTierEntity,
      NewsletterSubscriberEntity,
      UserEntity,
    ]),
    AuthModule,
  ],
  providers: [ClientWholesalesService],
  controllers: [WholesaleEnquiryController, WholesaleAccountController, NewsletterController],
})
export class ClientWholesalesModule {}
