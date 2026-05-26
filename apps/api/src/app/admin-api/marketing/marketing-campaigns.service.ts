import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketingCampaignEntity } from '@/db/entities/marketing/marketing-campaign.entity';
import { MarketingCampaignTranslationEntity } from '@/db/entities/marketing/marketing-campaign-translation.entity';
import { CampaignStatus, CampaignPlacement } from '@/common/enums/entity.enum';
import { R2Service } from '@/shared/r2/r2.service';
import { TranslationService } from '@/shared/translation/translation.service';
import { PaginationDTO } from '@/common/dtos/pagination';
import { CampaignListQueryDto } from './dto/campaign-list-query.dto';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

// Default i18n content per locale for each placement.
// Merges into null translation fields so the client API always returns complete data
// when a campaign is active but some text fields haven't been customised yet.
const PLACEMENT_TRANSLATION_DEFAULTS: Partial<
  Record<CampaignPlacement, Record<string, Partial<MarketingCampaignTranslationEntity>>>
> = {
  [CampaignPlacement.HOMEPAGE_HERO]: {
    en: {
      eyebrow: 'Handcrafted Luxury',
      title: 'Silver14 Nail',
      subtitle: null,
      ctaLabel: 'Shop Collection',
      secondaryCtaLabel: 'Wholesale Enquiry',
      secondaryCtaUrl: '/wholesales',
    },
    vi: {
      eyebrow: 'Sang trọng thủ công',
      title: 'Silver14 Nail',
      subtitle: null,
      ctaLabel: 'Mua bộ sưu tập',
      secondaryCtaLabel: 'Yêu cầu bán sỉ',
      secondaryCtaUrl: '/wholesales',
    },
  },
};

@Injectable()
export class MarketingCampaignsService {
  constructor(
    @InjectRepository(MarketingCampaignEntity)
    private readonly campaignRepo: Repository<MarketingCampaignEntity>,
    @InjectRepository(MarketingCampaignTranslationEntity)
    private readonly translationRepo: Repository<MarketingCampaignTranslationEntity>,
    private readonly r2: R2Service,
    private readonly translationService: TranslationService,
  ) {}

  async translateCampaignContent(
    texts: Record<string, string>,
    from: 'en' | 'vi',
    to: 'en' | 'vi',
  ): Promise<Record<string, string>> {
    const context = 'nail art marketing campaign content — keep brand names unchanged';
    const entries = Object.entries(texts).filter(([, v]) => v?.trim());
    const translated = await Promise.all(
      entries.map(async ([key, value]) => {
        const result = await this.translationService.translateText(value, from, to, context);
        return [key, result ?? value] as [string, string];
      }),
    );
    return Object.fromEntries(translated);
  }

  async listCampaigns(query: CampaignListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.campaignRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.translations', 'translations')
      .orderBy('c.priority', 'DESC')
      .addOrderBy('c.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.search) {
      qb.andWhere('c.name LIKE :search', { search: `%${query.search}%` });
    }
    if (query.status) qb.andWhere('c.status = :status', { status: query.status });
    if (query.placement) qb.andWhere('c.placement = :placement', { placement: query.placement });
    if (query.type) qb.andWhere('c.type = :type', { type: query.type });

    const [items, total] = await qb.getManyAndCount();

    const pagination: PaginationDTO = {
      totalItems: total,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };

    return { items, pagination };
  }

  async getCampaign(id: string): Promise<MarketingCampaignEntity> {
    const campaign = await this.campaignRepo.findOne({
      where: { id },
      relations: ['translations'],
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async createCampaign(dto: CreateCampaignDto): Promise<MarketingCampaignEntity> {
    const campaign = this.campaignRepo.create({
      name: dto.name,
      type: dto.type,
      placement: dto.placement,
      status: dto.status ?? CampaignStatus.DRAFT,
      desktopImageUrl: dto.desktopImageUrl ?? null,
      mobileImageUrl: dto.mobileImageUrl ?? null,
      ctaUrl: dto.ctaUrl ?? null,
      priority: dto.priority ?? 0,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
      overlayOpacity: dto.overlayOpacity ?? 0.35,
    });

    const saved = await this.campaignRepo.save(campaign);

    if (dto.translations?.length) {
      await this.upsertTranslations(saved.id, dto.translations);
    }

    return this.getCampaign(saved.id);
  }

  async updateCampaign(id: string, dto: UpdateCampaignDto): Promise<MarketingCampaignEntity> {
    // Load WITHOUT translations to prevent TypeORM from cascade-saving them
    const campaign = await this.campaignRepo.findOne({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    campaign.name = dto.name ?? campaign.name;
    campaign.type = dto.type ?? campaign.type;
    campaign.placement = dto.placement ?? campaign.placement;
    campaign.status = dto.status ?? campaign.status;
    campaign.desktopImageUrl =
      dto.desktopImageUrl !== undefined ? (dto.desktopImageUrl ?? null) : campaign.desktopImageUrl;
    campaign.mobileImageUrl =
      dto.mobileImageUrl !== undefined ? (dto.mobileImageUrl ?? null) : campaign.mobileImageUrl;
    campaign.ctaUrl = dto.ctaUrl !== undefined ? (dto.ctaUrl ?? null) : campaign.ctaUrl;
    campaign.priority = dto.priority ?? campaign.priority;
    campaign.startsAt =
      dto.startsAt !== undefined
        ? dto.startsAt
          ? new Date(dto.startsAt)
          : null
        : campaign.startsAt;
    campaign.endsAt =
      dto.endsAt !== undefined ? (dto.endsAt ? new Date(dto.endsAt) : null) : campaign.endsAt;
    campaign.overlayOpacity = dto.overlayOpacity ?? campaign.overlayOpacity;

    await this.campaignRepo.save(campaign);

    if (dto.translations?.length) {
      await this.upsertTranslations(id, dto.translations);
    }

    return this.getCampaign(id);
  }

  async deleteCampaign(id: string): Promise<void> {
    const campaign = await this.getCampaign(id);
    await this.campaignRepo.remove(campaign);
  }

  async uploadImage(
    id: string,
    field: 'desktop' | 'mobile',
    file: UploadedFile,
  ): Promise<MarketingCampaignEntity> {
    const campaign = await this.getCampaign(id);
    const url = await this.r2.upload(file.buffer, file.mimetype, 'campaigns');
    if (field === 'desktop') {
      campaign.desktopImageUrl = url;
    } else {
      campaign.mobileImageUrl = url;
    }
    await this.campaignRepo.save(campaign);
    return this.getCampaign(id);
  }

  // ─── Client-facing ────────────────────────────────────────────────────────────

  async getActiveCampaignByPlacement(
    placement: CampaignPlacement,
  ): Promise<MarketingCampaignEntity | null> {
    const now = new Date();

    const campaign = await this.campaignRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.translations', 'translations')
      .where('c.placement = :placement', { placement })
      .andWhere(
        `(
          c.status = :active
          OR (c.status = :scheduled AND (c.startsAt IS NULL OR c.startsAt <= :now))
        )`,
        { active: CampaignStatus.ACTIVE, scheduled: CampaignStatus.SCHEDULED, now },
      )
      .andWhere('(c.endsAt IS NULL OR c.endsAt >= :now)', { now })
      .orderBy('c.priority', 'DESC')
      .getOne();

    if (!campaign) return null;

    // Merge null translation fields with i18n defaults so the client always
    // receives complete content for active campaigns.
    const placementDefaults = PLACEMENT_TRANSLATION_DEFAULTS[placement];
    if (placementDefaults) {
      // Ensure every locale that has defaults is represented in the response.
      const existingLocales = new Set(campaign.translations.map((t) => t.locale));
      for (const [loc, defaults] of Object.entries(placementDefaults)) {
        if (!existingLocales.has(loc)) {
          // Synthesise a virtual translation row (not persisted — only for this response).
          const virtual = Object.assign(new MarketingCampaignTranslationEntity(), {
            campaignId: campaign.id,
            locale: loc,
            ...defaults,
            isAutoGenerated: false,
          });
          campaign.translations.push(virtual);
        }
      }

      // Fill null fields in existing translations with defaults for their locale.
      campaign.translations = campaign.translations.map((tr) => {
        const d = placementDefaults[tr.locale] ?? placementDefaults['en'];
        if (!d) return tr;
        if (tr.eyebrow === null) tr.eyebrow = d.eyebrow ?? null;
        if (tr.title === null) tr.title = d.title ?? null;
        if (tr.subtitle === null && d.subtitle !== undefined) tr.subtitle = d.subtitle;
        if (tr.ctaLabel === null) tr.ctaLabel = d.ctaLabel ?? null;
        if (tr.secondaryCtaLabel === null) tr.secondaryCtaLabel = d.secondaryCtaLabel ?? null;
        if (tr.secondaryCtaUrl === null) tr.secondaryCtaUrl = d.secondaryCtaUrl ?? null;
        return tr;
      });
    }

    return campaign;
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  private async upsertTranslations(
    campaignId: string,
    translations: Array<{
      locale: string;
      eyebrow?: string | null;
      title?: string | null;
      subtitle?: string | null;
      ctaLabel?: string | null;
      secondaryCtaLabel?: string | null;
      secondaryCtaUrl?: string | null;
      isAutoGenerated?: boolean;
    }>,
  ) {
    if (!translations.length) return;

    // TypeORM's entity-level save/upsert on this table generates malformed SQL
    // (omits `locale` from INSERT) due to the @Unique(['campaign','locale']) metadata.
    // Raw queries bypass all of that and give us exact control over the INSERT.
    await this.translationRepo.query(
      'DELETE FROM marketing_campaign_translations WHERE campaign_id = ?',
      [campaignId],
    );
    for (const t of translations) {
      await this.translationRepo.query(
        `INSERT INTO marketing_campaign_translations
           (id, campaign_id, locale, eyebrow, title, subtitle,
            cta_label, secondary_cta_label, secondary_cta_url, is_auto_generated, created_at)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          campaignId,
          t.locale,
          t.eyebrow ?? null,
          t.title ?? null,
          t.subtitle ?? null,
          t.ctaLabel ?? null,
          t.secondaryCtaLabel ?? null,
          t.secondaryCtaUrl ?? null,
          t.isAutoGenerated ?? false,
        ],
      );
    }
  }
}
