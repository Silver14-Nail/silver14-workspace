'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  Upload,
  Loader2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  LayoutTemplate,
  Save,
  ImageIcon,
  Type,
  Settings2,
  Calendar,
} from 'lucide-react';
import { useAdminTheme } from '@/app/context/AdminThemeContext';
import {
  getHomepageCampaignAction,
  saveHomepageCampaignAction,
  uploadHomepageImageAction,
} from './actions';
import type { Campaign, CampaignStatus } from '../campaigns/types';

const STOREFRONT_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL ?? 'http://localhost:4200';

// Mirrors PLACEMENT_TRANSLATION_DEFAULTS in the API service.
// Used to pre-populate the form when no campaign exists yet so admins
// see the live fallback content instead of blank fields.
const HERO_DEFAULTS = {
  en: {
    eyebrow: 'Handcrafted Luxury',
    title: 'Silver14 Nail',
    subtitle: '',
    ctaLabel: 'Shop Collection',
    secondaryLabel: 'Wholesale Enquiry',
    secondaryUrl: '/wholesales',
  },
  vi: {
    eyebrow: 'Sang trọng thủ công',
    title: 'Silver14 Nail',
    subtitle: '',
    ctaLabel: 'Mua bộ sưu tập',
    secondaryLabel: 'Yêu cầu bán sỉ',
    secondaryUrl: '/wholesales',
  },
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ic = (isDark: boolean) =>
  `w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${
    isDark
      ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500'
      : 'bg-white border-[#E5E7EB] text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#111827]'
  }`;

const lc = (isDark: boolean) =>
  `block text-xs font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-[#374151]'}`;

const cardClass = (isDark: boolean) =>
  `rounded-xl border p-5 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-[#E5E7EB]'}`;

const STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  scheduled: 'Scheduled',
  expired: 'Expired',
  archived: 'Archived',
};

const STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-green-100 text-green-700',
  scheduled: 'bg-blue-100 text-blue-700',
  expired: 'bg-orange-100 text-orange-600',
  archived: 'bg-gray-100 text-gray-500',
};

// ─── Section headers ──────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  isDark,
}: {
  icon: React.ElementType;
  title: string;
  isDark: boolean;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-[#6B7280]'}`} />
      <span
        className={`text-xs font-semibold uppercase tracking-wider ${
          isDark ? 'text-gray-400' : 'text-[#6B7280]'
        }`}
      >
        {title}
      </span>
    </div>
  );
}

// ─── Image field ──────────────────────────────────────────────────────────────

function ImageField({
  label,
  value,
  onChange,
  onUpload,
  uploading,
  campaignId,
  isDark,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  campaignId: string | null;
  isDark: boolean;
}) {
  return (
    <div>
      <label className={lc(isDark)}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={ic(isDark)}
        placeholder="https://cdn.example.com/image.jpg"
      />
      {value && (
        <div className="mt-2 relative rounded overflow-hidden h-24 bg-gray-100">
          <img src={value} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      {campaignId && (
        <label
          className={`mt-2 inline-flex items-center gap-1.5 cursor-pointer text-xs transition-colors ${
            isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
          }`}
        >
          {uploading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Upload className="w-3 h-3" />
          )}
          Upload from device
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onUpload}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function HomepageClient() {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeContentTab, setActiveContentTab] = useState<'en' | 'vi'>('en');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  // Upload states
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);

  // Form state
  const [status, setStatus] = useState<CampaignStatus>('draft');
  const [ctaUrl, setCtaUrl] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [overlayOpacity, setOverlayOpacity] = useState('0.35');
  const [desktopImageUrl, setDesktopImageUrl] = useState('');
  const [mobileImageUrl, setMobileImageUrl] = useState('');

  // Translations
  const [enEyebrow, setEnEyebrow] = useState('');
  const [enTitle, setEnTitle] = useState('');
  const [enSubtitle, setEnSubtitle] = useState('');
  const [enCtaLabel, setEnCtaLabel] = useState('');
  const [enSecondaryLabel, setEnSecondaryLabel] = useState('');
  const [enSecondaryUrl, setEnSecondaryUrl] = useState('');
  const [viEyebrow, setViEyebrow] = useState('');
  const [viTitle, setViTitle] = useState('');
  const [viSubtitle, setViSubtitle] = useState('');
  const [viCtaLabel, setViCtaLabel] = useState('');
  const [viSecondaryLabel, setViSecondaryLabel] = useState('');
  const [viSecondaryUrl, setViSecondaryUrl] = useState('');

  useEffect(() => {
    getHomepageCampaignAction()
      .then((c) => {
        if (c) {
          populateForm(c);
        } else {
          // Pre-fill with i18n defaults so admins see the live fallback
          // content rather than blank fields before creating the campaign.
          setEnEyebrow(HERO_DEFAULTS.en.eyebrow);
          setEnTitle(HERO_DEFAULTS.en.title);
          setEnCtaLabel(HERO_DEFAULTS.en.ctaLabel);
          setEnSecondaryLabel(HERO_DEFAULTS.en.secondaryLabel);
          setEnSecondaryUrl(HERO_DEFAULTS.en.secondaryUrl);
          setViEyebrow(HERO_DEFAULTS.vi.eyebrow);
          setViTitle(HERO_DEFAULTS.vi.title);
          setViCtaLabel(HERO_DEFAULTS.vi.ctaLabel);
          setViSecondaryLabel(HERO_DEFAULTS.vi.secondaryLabel);
          setViSecondaryUrl(HERO_DEFAULTS.vi.secondaryUrl);
        }
        setCampaign(c);
      })
      .finally(() => setLoading(false));
  }, []);

  function populateForm(c: Campaign) {
    setStatus(c.status);
    setCtaUrl(c.ctaUrl ?? '');
    setStartsAt(c.startsAt ? c.startsAt.slice(0, 16) : '');
    setEndsAt(c.endsAt ? c.endsAt.slice(0, 16) : '');
    setOverlayOpacity(String(c.overlayOpacity ?? 0.35));
    setDesktopImageUrl(c.desktopImageUrl ?? '');
    setMobileImageUrl(c.mobileImageUrl ?? '');

    const en = c.translations?.find((t) => t.locale === 'en');
    setEnEyebrow(en?.eyebrow ?? '');
    setEnTitle(en?.title ?? '');
    setEnSubtitle(en?.subtitle ?? '');
    setEnCtaLabel(en?.ctaLabel ?? '');
    setEnSecondaryLabel(en?.secondaryCtaLabel ?? '');
    setEnSecondaryUrl(en?.secondaryCtaUrl ?? '');

    const vi = c.translations?.find((t) => t.locale === 'vi');
    setViEyebrow(vi?.eyebrow ?? '');
    setViTitle(vi?.title ?? '');
    setViSubtitle(vi?.subtitle ?? '');
    setViCtaLabel(vi?.ctaLabel ?? '');
    setViSecondaryLabel(vi?.secondaryCtaLabel ?? '');
    setViSecondaryUrl(vi?.secondaryCtaUrl ?? '');
  }

  function buildTranslations() {
    return [
      {
        locale: 'en',
        eyebrow: enEyebrow || '',
        title: enTitle || '',
        subtitle: enSubtitle || '',
        ctaLabel: enCtaLabel || '',
        secondaryCtaLabel: enSecondaryLabel || '',
        secondaryCtaUrl: enSecondaryUrl || '',
      },
      {
        locale: 'vi',
        eyebrow: viEyebrow || '',
        title: viTitle || '',
        subtitle: viSubtitle || '',
        ctaLabel: viCtaLabel || '',
        secondaryCtaLabel: viSecondaryLabel || '',
        secondaryCtaUrl: viSecondaryUrl || '',
      },
    ];
  }

  function handleSave() {
    setError('');
    setSaved(false);
    startTransition(async () => {
      const translations = buildTranslations();
      const payload = {
        name: 'Homepage Hero',
        type: 'hero' as const,
        placement: 'homepage_hero' as const,
        status,
        ctaUrl: ctaUrl.trim() || null,
        priority: 100,
        startsAt: startsAt ? new Date(startsAt).toISOString() : null,
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        overlayOpacity: parseFloat(overlayOpacity) || 0.35,
        desktopImageUrl: desktopImageUrl.trim() || null,
        mobileImageUrl: mobileImageUrl.trim() || null,
        translations,
      };

      const result = await saveHomepageCampaignAction(campaign?.id ?? null, payload);
      if (!result.success) {
        setError((result as { success: false; error: string }).error);
        return;
      }
      setCampaign((result as { success: true; data: Campaign }).data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  const handleDesktopUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!campaign?.id || !e.target.files?.[0]) return;
    setUploadingDesktop(true);
    try {
      const fd = new FormData();
      fd.append('file', e.target.files[0]);
      const result = await uploadHomepageImageAction(campaign.id, 'desktop', fd);
      if (!result.success) {
        setError((result as { success: false; error: string }).error);
      } else {
        const c = (result as { success: true; data: Campaign }).data;
        setDesktopImageUrl(c.desktopImageUrl ?? '');
        setCampaign(c);
      }
    } finally {
      setUploadingDesktop(false);
    }
  };

  const handleMobileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!campaign?.id || !e.target.files?.[0]) return;
    setUploadingMobile(true);
    try {
      const fd = new FormData();
      fd.append('file', e.target.files[0]);
      const result = await uploadHomepageImageAction(campaign.id, 'mobile', fd);
      if (!result.success) {
        setError((result as { success: false; error: string }).error);
      } else {
        const c = (result as { success: true; data: Campaign }).data;
        setMobileImageUrl(c.mobileImageUrl ?? '');
        setCampaign(c);
      }
    } finally {
      setUploadingMobile(false);
    }
  };

  const tabBtn = (tab: 'en' | 'vi') =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      activeContentTab === tab
        ? isDark
          ? 'border-white text-white'
          : 'border-[#111827] text-[#111827]'
        : isDark
          ? 'border-transparent text-gray-400 hover:text-gray-300'
          : 'border-transparent text-[#6B7280] hover:text-[#374151]'
    }`;

  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className={`h-10 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-[#F3F4F6]'} w-64`} />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className={`h-48 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-[#F3F4F6]'}`} />
            <div className={`h-40 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-[#F3F4F6]'}`} />
          </div>
          <div className="lg:col-span-2">
            <div className={`h-80 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-[#F3F4F6]'}`} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <LayoutTemplate className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-[#6B7280]'}`} />
            <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-[#111827]'}`}>
              Homepage Hero
            </h1>
            {campaign && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[campaign.status]}`}
              >
                {STATUS_LABELS[campaign.status]}
              </span>
            )}
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-[#6B7280]'}`}>
            Manage the hero banner displayed on the storefront homepage
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {saved && (
            <span className="flex items-center gap-1.5 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              Saved
            </span>
          )}
          {error && (
            <span className="flex items-center gap-1.5 text-red-500 text-sm max-w-xs truncate">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </span>
          )}
          <a
            href={`${STOREFRONT_URL}/en`}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-colors ${
              isDark
                ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                : 'border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Live
          </a>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-[#111827] text-white text-sm rounded-lg font-medium hover:bg-[#1F2937] transition-colors disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {campaign ? 'Save Changes' : 'Create Hero'}
          </button>
        </div>
      </div>

      {/* ── Two-column grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column: Media + Appearance + Schedule */}
        <div className="lg:col-span-3 space-y-5">
          {/* Images */}
          <div className={cardClass(isDark)}>
            <SectionHeader icon={ImageIcon} title="Hero Images" isDark={isDark} />
            <div className="space-y-5">
              <ImageField
                label="Desktop Image"
                value={desktopImageUrl}
                onChange={setDesktopImageUrl}
                onUpload={handleDesktopUpload}
                uploading={uploadingDesktop}
                campaignId={campaign?.id ?? null}
                isDark={isDark}
              />
              <ImageField
                label="Mobile Image"
                value={mobileImageUrl}
                onChange={setMobileImageUrl}
                onUpload={handleMobileUpload}
                uploading={uploadingMobile}
                campaignId={campaign?.id ?? null}
                isDark={isDark}
              />
              {!campaign && (
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-[#9CA3AF]'}`}>
                  Save the campaign first to enable image uploads from device.
                </p>
              )}
            </div>
          </div>

          {/* Appearance */}
          <div className={cardClass(isDark)}>
            <SectionHeader icon={Settings2} title="Appearance" isDark={isDark} />
            <div className="space-y-5">
              <div>
                <label className={lc(isDark)}>
                  Overlay Opacity —{' '}
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#111827]'}`}>
                    {overlayOpacity}
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(e.target.value)}
                  className="w-full accent-[#111827]"
                />
                <div
                  className="mt-2 h-10 rounded-lg"
                  style={{
                    background: `rgba(0,0,0,${overlayOpacity})`,
                    border: isDark ? '1px solid #374151' : '1px solid #E5E7EB',
                  }}
                />
              </div>

              <div>
                <label className={lc(isDark)}>Primary CTA URL</label>
                <input
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  className={ic(isDark)}
                  placeholder="/products or https://..."
                />
              </div>
            </div>
          </div>

          {/* Status & Schedule */}
          <div className={cardClass(isDark)}>
            <SectionHeader icon={Calendar} title="Status & Schedule" isDark={isDark} />
            <div className="space-y-4">
              <div>
                <label className={lc(isDark)}>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CampaignStatus)}
                  className={ic(isDark)}
                >
                  {(Object.keys(STATUS_LABELS) as CampaignStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
                <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-[#9CA3AF]'}`}>
                  Set to <strong>Active</strong> to display on the homepage.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lc(isDark)}>Starts At (optional)</label>
                  <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className={ic(isDark)}
                  />
                </div>
                <div>
                  <label className={lc(isDark)}>Ends At (optional)</label>
                  <input
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className={ic(isDark)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Content */}
        <div className="lg:col-span-2">
          <div className={`${cardClass(isDark)} h-fit`}>
            <SectionHeader icon={Type} title="Content" isDark={isDark} />

            {/* Language tabs */}
            <div
              className={`flex border-b mb-5 -mx-5 px-5 ${
                isDark ? 'border-gray-700' : 'border-[#E5E7EB]'
              }`}
            >
              <button className={tabBtn('en')} onClick={() => setActiveContentTab('en')}>
                🇬🇧 English
              </button>
              <button className={tabBtn('vi')} onClick={() => setActiveContentTab('vi')}>
                🇻🇳 Vietnamese
              </button>
            </div>

            <div className="space-y-4">
              {activeContentTab === 'en' ? (
                <>
                  <div>
                    <label className={lc(isDark)}>Eyebrow</label>
                    <input
                      value={enEyebrow}
                      onChange={(e) => setEnEyebrow(e.target.value)}
                      className={ic(isDark)}
                      placeholder="e.g. NEW COLLECTION"
                    />
                  </div>
                  <div>
                    <label className={lc(isDark)}>Title</label>
                    <input
                      value={enTitle}
                      onChange={(e) => setEnTitle(e.target.value)}
                      className={ic(isDark)}
                      placeholder="e.g. Luxury Nail Art"
                    />
                  </div>
                  <div>
                    <label className={lc(isDark)}>Subtitle</label>
                    <textarea
                      value={enSubtitle}
                      onChange={(e) => setEnSubtitle(e.target.value)}
                      className={`${ic(isDark)} resize-none`}
                      rows={3}
                      placeholder="A short description or tagline..."
                    />
                  </div>
                  <div>
                    <label className={lc(isDark)}>CTA Button Label</label>
                    <input
                      value={enCtaLabel}
                      onChange={(e) => setEnCtaLabel(e.target.value)}
                      className={ic(isDark)}
                      placeholder="e.g. Shop Now"
                    />
                  </div>
                  <div
                    className={`rounded-lg border p-3 space-y-3 ${isDark ? 'border-gray-700 bg-gray-800/40' : 'border-[#E5E7EB] bg-[#F9FAFB]'}`}
                  >
                    <p
                      className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-[#6B7280]'}`}
                    >
                      Secondary Button
                    </p>
                    <div>
                      <label className={lc(isDark)}>Label</label>
                      <input
                        value={enSecondaryLabel}
                        onChange={(e) => setEnSecondaryLabel(e.target.value)}
                        className={ic(isDark)}
                        placeholder="e.g. Wholesale Enquiry"
                      />
                    </div>
                    <div>
                      <label className={lc(isDark)}>URL</label>
                      <input
                        value={enSecondaryUrl}
                        onChange={(e) => setEnSecondaryUrl(e.target.value)}
                        className={ic(isDark)}
                        placeholder="/wholesales or https://..."
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className={lc(isDark)}>Eyebrow</label>
                    <input
                      value={viEyebrow}
                      onChange={(e) => setViEyebrow(e.target.value)}
                      className={ic(isDark)}
                      placeholder="vd: BST MỚI"
                    />
                  </div>
                  <div>
                    <label className={lc(isDark)}>Tiêu đề</label>
                    <input
                      value={viTitle}
                      onChange={(e) => setViTitle(e.target.value)}
                      className={ic(isDark)}
                      placeholder="vd: Nghệ Thuật Móng Cao Cấp"
                    />
                  </div>
                  <div>
                    <label className={lc(isDark)}>Phụ đề</label>
                    <textarea
                      value={viSubtitle}
                      onChange={(e) => setViSubtitle(e.target.value)}
                      className={`${ic(isDark)} resize-none`}
                      rows={3}
                      placeholder="Mô tả ngắn hoặc tagline..."
                    />
                  </div>
                  <div>
                    <label className={lc(isDark)}>Nhãn nút CTA</label>
                    <input
                      value={viCtaLabel}
                      onChange={(e) => setViCtaLabel(e.target.value)}
                      className={ic(isDark)}
                      placeholder="vd: Mua ngay"
                    />
                  </div>
                  <div
                    className={`rounded-lg border p-3 space-y-3 ${isDark ? 'border-gray-700 bg-gray-800/40' : 'border-[#E5E7EB] bg-[#F9FAFB]'}`}
                  >
                    <p
                      className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-[#6B7280]'}`}
                    >
                      Nút phụ
                    </p>
                    <div>
                      <label className={lc(isDark)}>Nhãn</label>
                      <input
                        value={viSecondaryLabel}
                        onChange={(e) => setViSecondaryLabel(e.target.value)}
                        className={ic(isDark)}
                        placeholder="vd: Liên hệ bán sỉ"
                      />
                    </div>
                    <div>
                      <label className={lc(isDark)}>URL</label>
                      <input
                        value={viSecondaryUrl}
                        onChange={(e) => setViSecondaryUrl(e.target.value)}
                        className={ic(isDark)}
                        placeholder="/wholesales hoặc https://..."
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
