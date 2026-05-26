import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

import { WholesalesService } from './wholesales.service';
import { AccountListQueryDto } from './dto/account-list-query.dto';
import { UpdateWholesaleAccountDto } from './dto/update-wholesale-account.dto';
import { EnquiryListQueryDto } from './dto/enquiry-list-query.dto';
import { UpdateWholesaleEnquiryDto } from './dto/update-wholesale-enquiry.dto';
import { UpdateWholesaleTierDto } from './dto/update-wholesale-tier.dto';
import { CreateWholesaleTierDto } from './dto/create-wholesale-tier.dto';
import { NewsletterListQueryDto } from './dto/newsletter-list-query.dto';
import { UpdateNewsletterSubscriberDto } from './dto/update-newsletter-subscriber.dto';
import { ApproveEnquiryDto } from './dto/approve-enquiry.dto';

@ApiTags('Admin - Wholesale Accounts')
@ApiBearerAuth()
@Controller('wholesales/accounts')
export class WholesaleAccountsController {
  constructor(private readonly wholesalesService: WholesalesService) {}

  @Get('stats')
  @ApiOkResponse({ description: 'Wholesale stats summary' })
  getStats() {
    return this.wholesalesService.getStats();
  }

  @Get()
  @ApiOkResponse({ description: 'Paginated list of wholesale accounts' })
  list(@Query() query: AccountListQueryDto) {
    return this.wholesalesService.listAccounts(query);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Wholesale account detail' })
  @ApiNotFoundResponse({ description: 'Account not found' })
  getOne(@Param('id') id: string) {
    return this.wholesalesService.getAccount(id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Updated wholesale account' })
  @ApiNotFoundResponse({ description: 'Account not found' })
  update(@Param('id') id: string, @Body() dto: UpdateWholesaleAccountDto) {
    return this.wholesalesService.updateAccount(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Account soft-deleted' })
  @ApiNotFoundResponse({ description: 'Account not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.wholesalesService.removeAccount(id);
  }
}

@ApiTags('Admin - Wholesale Enquiries')
@ApiBearerAuth()
@Controller('wholesales/enquiries')
export class WholesaleEnquiriesController {
  constructor(private readonly wholesalesService: WholesalesService) {}

  @Get()
  @ApiOkResponse({ description: 'Paginated list of wholesale enquiries' })
  list(@Query() query: EnquiryListQueryDto) {
    return this.wholesalesService.listEnquiries(query);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Wholesale enquiry detail' })
  @ApiNotFoundResponse({ description: 'Enquiry not found' })
  getOne(@Param('id') id: string) {
    return this.wholesalesService.getEnquiry(id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Updated wholesale enquiry' })
  @ApiNotFoundResponse({ description: 'Enquiry not found' })
  update(@Param('id') id: string, @Body() dto: UpdateWholesaleEnquiryDto) {
    return this.wholesalesService.updateEnquiry(id, dto);
  }

  @Patch(':id/approve')
  @ApiOkResponse({ description: 'Enquiry approved; account created if user exists' })
  @ApiNotFoundResponse({ description: 'Enquiry or tier not found' })
  approve(@Param('id') id: string, @Body() dto: ApproveEnquiryDto) {
    return this.wholesalesService.approveEnquiry(id, dto);
  }

  @Patch(':id/reject')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Enquiry rejected' })
  @ApiNotFoundResponse({ description: 'Enquiry not found' })
  reject(@Param('id') id: string) {
    return this.wholesalesService.rejectEnquiry(id);
  }
}

@ApiTags('Admin - Wholesale Tiers')
@ApiBearerAuth()
@Controller('wholesales/tiers')
export class WholesaleTiersController {
  constructor(private readonly wholesalesService: WholesalesService) {}

  @Get()
  @ApiOkResponse({ description: 'List of all wholesale tiers' })
  list() {
    return this.wholesalesService.listTiers();
  }

  @Post()
  create(@Body() dto: CreateWholesaleTierDto) {
    return this.wholesalesService.createTier(dto);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Wholesale tier detail' })
  @ApiNotFoundResponse({ description: 'Tier not found' })
  getOne(@Param('id') id: string) {
    return this.wholesalesService.getTier(id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Updated wholesale tier' })
  @ApiNotFoundResponse({ description: 'Tier not found' })
  update(@Param('id') id: string, @Body() dto: UpdateWholesaleTierDto) {
    return this.wholesalesService.updateTier(id, dto);
  }
}

@ApiTags('Admin - Newsletter')
@ApiBearerAuth()
@Controller('wholesales/newsletter')
export class NewsletterController {
  constructor(private readonly wholesalesService: WholesalesService) {}

  @Get()
  @ApiOkResponse({ description: 'Paginated list of newsletter subscribers' })
  list(@Query() query: NewsletterListQueryDto) {
    return this.wholesalesService.listNewsletterSubscribers(query);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Updated subscriber status' })
  @ApiNotFoundResponse({ description: 'Subscriber not found' })
  update(@Param('id') id: string, @Body() dto: UpdateNewsletterSubscriberDto) {
    return this.wholesalesService.updateNewsletterSubscriber(id, dto);
  }
}
