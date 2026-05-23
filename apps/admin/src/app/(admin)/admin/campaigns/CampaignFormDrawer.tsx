'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAdminTheme } from '@/app/context/AdminThemeContext';
import { uploadCampaignImageAction } from './actions';
import type {
  Campaign,
  CampaignType,
  CampaignPlacement,
  CampaignStatus,
  CreateCampaignPayload,
  UpdateCampaignPayload,
} from './types';
import {
  CAMPAIGN_TYPE_LABELS,
  CAMPAIGN_PLACEMENT_LABELS,
  CAMPAIGN_STATUS_LABELS,
} from './types';

interface CampaignFormDrawerProps {
  open: boolean;
  onClose: () => void;
  campaign?: Campaign | null;
  onSubmit: (
    payload: CreateCampaignPayload | UpdateCampaignPayload,
  ) => Promise<{ success: boolean; error?: string }>;
}

const inputClass = (isDark: boolean) =>
  `w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${
    isDark
      ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
      : 'bg-white border-[#E5E7EB] text-[#111827] focus:border-[#111827]'
  }`;

const labelClass = (isDark: boolean) =>
  `block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-[#374151]'}`;

export default function CampaignFormDrawer({
  open,
  onClose,
  campaign,
  onSubmit,
}: CampaignFormDrawerProps) {
  const { t } = useTranslation('campaigns');
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';
  const isEdit = !!campaign;

  const [name, setName] = useState('');
  const [type, setType] = useState<CampaignType>('hero');
  const [placement, setPlacement] = useState<CampaignPlacement>('homepage_hero');
  const [status, setStatus] = useState<CampaignStatus>('draft');
  const [ctaUrl, setCtaUrl] = useState('');
  const [priority, setPriority] = useState('0');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [overlayOpacity, setOverlayOpacity] = useState('0.35');
  const [desktopImageUrl, setDesktopImageUrl] = useState('');
  const [mobileImageUrl, setMobileImageUrl] = useState('');

  // Translations
  const [enTitle, setEnTitle] = useState('');
  const [enEyebrow, setEnEyebrow] = useState('');
  const [enSubtitle, setEnSubtitle] = useState('');
  const [enCtaLabel, setEnCtaLabel] = useState('');
  const [enSecondaryLabel, setEnSecondaryLabel] = useState('');
  const [enSecondaryUrl, setEnSecondaryUrl] = useState('');
  const [viTitle, setViTitle] = useState('');
  const [viEyebrow, setViEyebrow] = useState('');
  const [viSubtitle, setViSubtitle] = useState('');
  const [viCtaLabel, setViCtaLabel] = useState('');
  const [viSecondaryLabel, setViSecondaryLabel] = useState('');
  const [viSecondaryUrl, setViSecondaryUrl] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'en' | 'vi'>('general');

  useEffect(() => {
    if (campaign) {
      setName(campaign.name);
      setType(campaign.type);
      setPlacement(campaign.placement);
      setStatus(campaign.status);
      setCtaUrl(campaign.ctaUrl ?? '');
      setPriority(String(campaign.priority));
      setStartsAt(campaign.startsAt ? campaign.startsAt.slice(0, 16) : '');
      setEndsAt(campaign.endsAt ? campaign.endsAt.slice(0, 16) : '');
      setOverlayOpacity(String(campaign.overlayOpacity ?? 0.35));
      setDesktopImageUrl(campaign.desktopImageUrl ?? '');
      setMobileImageUrl(campaign.mobileImageUrl ?? '');

      const en = campaign.translations?.find((t) => t.locale === 'en');
      setEnTitle(en?.title ?? '');
      setEnEyebrow(en?.eyebrow ?? '');
      setEnSubtitle(en?.subtitle ?? '');
      setEnCtaLabel(en?.ctaLabel ?? '');
      setEnSecondaryLabel(en?.secondaryCtaLabel ?? '');
      setEnSecondaryUrl(en?.secondaryCtaUrl ?? '');

      const vi = campaign.translations?.find((t) => t.locale === 'vi');
      setViTitle(vi?.title ?? '');
      setViEyebrow(vi?.eyebrow ?? '');
      setViSubtitle(vi?.subtitle ?? '');
      setViCtaLabel(vi?.ctaLabel ?? '');
      setViSecondaryLabel(vi?.secondaryCtaLabel ?? '');
      setViSecondaryUrl(vi?.secondaryCtaUrl ?? '');
    } else {
      setName('');
      setType('hero');
      setPlacement('homepage_hero');
      setStatus('draft');
      setCtaUrl('');
      setPriority('0');
      setStartsAt('');
      setEndsAt('');
      setOverlayOpacity('0.35');
      setDesktopImageUrl('');
      setMobileImageUrl('');
      setEnTitle('');
      setEnEyebrow('');
      setEnSubtitle('');
      setEnCtaLabel('');
      setEnSecondaryLabel('');
      setEnSecondaryUrl('');
      setViTitle('');
      setViEyebrow('');
      setViSubtitle('');
      setViCtaLabel('');
      setViSecondaryLabel('');
      setViSecondaryUrl('');
    }
    setError('');
    setActiveTab('general');
  }, [campaign, open]);

  if (!open) return null;

  const handleDesktopUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!campaign?.id || !e.target.files?.[0]) return;
    setUploadingDesktop(true);
    try {
      const formData = new FormData();
      formData.append('file', e.target.files[0]);
      const result = await uploadCampaignImageAction(campaign.id, 'desktop', formData);
      if (!result.success) {
        setError((result as { error: string }).error ?? t('form.uploadDesktopError'));
      } else {
        setDesktopImageUrl(result.data.desktopImageUrl ?? '');
      }
    } finally {
      setUploadingDesktop(false);
    }
  };

  const handleMobileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!campaign?.id || !e.target.files?.[0]) return;
    setUploadingMobile(true);
    try {
      const formData = new FormData();
      formData.append('file', e.target.files[0]);
      const result = await uploadCampaignImageAction(campaign.id, 'mobile', formData);
      if (!result.success) {
        setError((result as { error: string }).error ?? t('form.uploadMobileError'));
      } else {
        setMobileImageUrl(result.data.mobileImageUrl ?? '');
      }
    } finally {
      setUploadingMobile(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError(t('form.nameRequired'));
      return;
    }

    const translations = [];
    if (enTitle || enEyebrow || enSubtitle || enCtaLabel) {
      translations.push({
        locale: 'en',
        eyebrow: enEyebrow || null,
        title: enTitle || null,
        subtitle: enSubtitle || null,
        ctaLabel: enCtaLabel || null,
        secondaryCtaLabel: enSecondaryLabel || null,
        secondaryCtaUrl: enSecondaryUrl || null,
      });
    }
    if (viTitle || viEyebrow || viSubtitle || viCtaLabel) {
      translations.push({
        locale: 'vi',
        eyebrow: viEyebrow || null,
        title: viTitle || null,
        subtitle: viSubtitle || null,
        ctaLabel: viCtaLabel || null,
        secondaryCtaLabel: viSecondaryLabel || null,
        secondaryCtaUrl: viSecondaryUrl || null,
      });
    }

    const payload: CreateCampaignPayload = {
      name: name.trim(),
      type,
      placement,
      status,
      ctaUrl: ctaUrl.trim() || null,
      priority: parseInt(priority, 10) || 0,
      startsAt: startsAt ? new Date(startsAt).toISOString() : null,
      endsAt: endsAt ? new Date(endsAt).toISOString() : null,
      overlayOpacity: parseFloat(overlayOpacity) || 0.35,
      desktopImageUrl: desktopImageUrl.trim() || null,
      mobileImageUrl: mobileImageUrl.trim() || null,
      ...(translations.length > 0 ? { translations } : {}),
    };

    setLoading(true);
    try {
      const result = await onSubmit(payload);
      if (!result.success) {
        setError(result.error ?? t('form.error'));
      }
    } finally {
      setLoading(false);
    }
  }

  const tabClass = (tab: 'general' | 'en' | 'vi') =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      activeTab === tab
        ? isDark
          ? 'border-white text-white'
          : 'border-[#111827] text-[#111827]'
        : isDark
          ? 'border-transparent text-gray-400 hover:text-gray-300'
          : 'border-transparent text-[#6B7280] hover:text-[#374151]'
    }`;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-lg z-50 flex flex-col shadow-2xl ${
          isDark ? 'bg-gray-900' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark ? 'border-gray-800' : 'border-[#E5E7EB]'
          }`}
        >
          <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-[#111827]'}`}>
            {isEdit ? t('form.editTitle') : t('form.createTitle')}
          </h2>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ${
              isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-[#F3F4F6] text-[#6B7280]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div
          className={`flex border-b ${isDark ? 'border-gray-800' : 'border-[#E5E7EB]'}`}
        >
          <button className={tabClass('general')} onClick={() => setActiveTab('general')}>
            {t('form.tabGeneral')}
          </button>
          <button className={tabClass('en')} onClick={() => setActiveTab('en')}>
            EN
          </button>
          <button className={tabClass('vi')} onClick={() => setActiveTab('vi')}>
            VI
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-4">
            {activeTab === 'general' && (
              <>
                <div>
                  <label className={labelClass(isDark)}>{t('form.name')} *</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass(isDark)}
                    placeholder="e.g. Summer Sale Hero"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass(isDark)}>{t('form.type')}</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as CampaignType)}
                      className={inputClass(isDark)}
                    >
                      {(Object.keys(CAMPAIGN_TYPE_LABELS) as CampaignType[]).map((t) => (
                        <option key={t} value={t}>
                          {CAMPAIGN_TYPE_LABELS[t]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass(isDark)}>{t('form.placement')}</label>
                    <select
                      value={placement}
                      onChange={(e) => setPlacement(e.target.value as CampaignPlacement)}
                      className={inputClass(isDark)}
                    >
                      {(Object.keys(CAMPAIGN_PLACEMENT_LABELS) as CampaignPlacement[]).map((p) => (
                        <option key={p} value={p}>
                          {CAMPAIGN_PLACEMENT_LABELS[p]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass(isDark)}>{t('form.status')}</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as CampaignStatus)}
                      className={inputClass(isDark)}
                    >
                      {(Object.keys(CAMPAIGN_STATUS_LABELS) as CampaignStatus[]).map((s) => (
                        <option key={s} value={s}>
                          {CAMPAIGN_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass(isDark)}>{t('form.priority')}</label>
                    <input
                      type="number"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className={inputClass(isDark)}
                      min="0"
                      max="9999"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass(isDark)}>{t('form.ctaUrl')}</label>
                  <input
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    className={inputClass(isDark)}
                    placeholder="/products or https://..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass(isDark)}>{t('form.startsAt')}</label>
                    <input
                      type="datetime-local"
                      value={startsAt}
                      onChange={(e) => setStartsAt(e.target.value)}
                      className={inputClass(isDark)}
                    />
                  </div>
                  <div>
                    <label className={labelClass(isDark)}>{t('form.endsAt')}</label>
                    <input
                      type="datetime-local"
                      value={endsAt}
                      onChange={(e) => setEndsAt(e.target.value)}
                      className={inputClass(isDark)}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass(isDark)}>
                    {t('form.overlayOpacity', { value: overlayOpacity })}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Images */}
                <div
                  className={`rounded-lg border p-4 space-y-3 ${
                    isDark ? 'border-gray-700 bg-gray-800/50' : 'border-[#E5E7EB] bg-[#F9FAFB]'
                  }`}
                >
                  <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                    {t('form.images')}
                  </p>

                  <div>
                    <label className={labelClass(isDark)}>{t('form.desktopImageUrl')}</label>
                    <input
                      value={desktopImageUrl}
                      onChange={(e) => setDesktopImageUrl(e.target.value)}
                      className={inputClass(isDark)}
                      placeholder="https://cdn.../desktop.jpg"
                    />
                    {desktopImageUrl && (
                      <img
                        src={desktopImageUrl}
                        alt="Desktop preview"
                        className="mt-2 h-20 w-full object-cover rounded"
                      />
                    )}
                    {isEdit && (
                      <label className={`mt-2 flex items-center gap-2 cursor-pointer text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                        {uploadingDesktop ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Upload className="w-3 h-3" />
                        )}
                        {t('form.uploadDesktop')}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleDesktopUpload}
                          disabled={uploadingDesktop}
                        />
                      </label>
                    )}
                  </div>

                  <div>
                    <label className={labelClass(isDark)}>{t('form.mobileImageUrl')}</label>
                    <input
                      value={mobileImageUrl}
                      onChange={(e) => setMobileImageUrl(e.target.value)}
                      className={inputClass(isDark)}
                      placeholder="https://cdn.../mobile.jpg"
                    />
                    {mobileImageUrl && (
                      <img
                        src={mobileImageUrl}
                        alt="Mobile preview"
                        className="mt-2 h-20 w-full object-cover rounded"
                      />
                    )}
                    {isEdit && (
                      <label className={`mt-2 flex items-center gap-2 cursor-pointer text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                        {uploadingMobile ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Upload className="w-3 h-3" />
                        )}
                        {t('form.uploadMobile')}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleMobileUpload}
                          disabled={uploadingMobile}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </>
            )}

            {(activeTab === 'en' || activeTab === 'vi') && (
              <TranslationFields
                isDark={isDark}
                eyebrow={activeTab === 'en' ? enEyebrow : viEyebrow}
                setEyebrow={activeTab === 'en' ? setEnEyebrow : setViEyebrow}
                title={activeTab === 'en' ? enTitle : viTitle}
                setTitle={activeTab === 'en' ? setEnTitle : setViTitle}
                subtitle={activeTab === 'en' ? enSubtitle : viSubtitle}
                setSubtitle={activeTab === 'en' ? setEnSubtitle : setViSubtitle}
                ctaLabel={activeTab === 'en' ? enCtaLabel : viCtaLabel}
                setCtaLabel={activeTab === 'en' ? setEnCtaLabel : setViCtaLabel}
                secondaryLabel={activeTab === 'en' ? enSecondaryLabel : viSecondaryLabel}
                setSecondaryLabel={activeTab === 'en' ? setEnSecondaryLabel : setViSecondaryLabel}
                secondaryUrl={activeTab === 'en' ? enSecondaryUrl : viSecondaryUrl}
                setSecondaryUrl={activeTab === 'en' ? setEnSecondaryUrl : setViSecondaryUrl}
              />
            )}
          </div>

          {/* Footer */}
          <div
            className={`sticky bottom-0 px-6 py-4 border-t flex items-center gap-3 ${
              isDark ? 'border-gray-800 bg-gray-900' : 'border-[#E5E7EB] bg-white'
            }`}
          >
            {error && <p className="text-red-500 text-xs flex-1">{error}</p>}
            {!error && <div className="flex-1" />}
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-sm rounded-lg border ${
                isDark
                  ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                  : 'border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]'
              }`}
            >
              {t('form.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#111827] text-white text-sm rounded-lg font-medium hover:bg-[#1F2937] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? t('form.saveChanges') : t('form.create')}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function TranslationFields({
  isDark,
  eyebrow, setEyebrow,
  title, setTitle,
  subtitle, setSubtitle,
  ctaLabel, setCtaLabel,
  secondaryLabel, setSecondaryLabel,
  secondaryUrl, setSecondaryUrl,
}: {
  isDark: boolean;
  eyebrow: string; setEyebrow: (v: string) => void;
  title: string; setTitle: (v: string) => void;
  subtitle: string; setSubtitle: (v: string) => void;
  ctaLabel: string; setCtaLabel: (v: string) => void;
  secondaryLabel: string; setSecondaryLabel: (v: string) => void;
  secondaryUrl: string; setSecondaryUrl: (v: string) => void;
}) {
  const { t } = useTranslation('campaigns');
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass(isDark)}>{t('form.eyebrow')}</label>
        <input
          value={eyebrow}
          onChange={(e) => setEyebrow(e.target.value)}
          className={inputClass(isDark)}
          placeholder="e.g. LIMITED TIME OFFER"
        />
      </div>
      <div>
        <label className={labelClass(isDark)}>{t('form.translationTitle')}</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass(isDark)}
          placeholder="e.g. Summer Nail Collection"
        />
      </div>
      <div>
        <label className={labelClass(isDark)}>{t('form.subtitle')}</label>
        <textarea
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className={`${inputClass(isDark)} resize-none`}
          rows={3}
          placeholder="Campaign description or tagline..."
        />
      </div>
      <div>
        <label className={labelClass(isDark)}>{t('form.ctaLabel')}</label>
        <input
          value={ctaLabel}
          onChange={(e) => setCtaLabel(e.target.value)}
          className={inputClass(isDark)}
          placeholder="e.g. Shop Now"
        />
      </div>
      <div>
        <label className={labelClass(isDark)}>{t('form.secondaryCtaLabel')}</label>
        <input
          value={secondaryLabel}
          onChange={(e) => setSecondaryLabel(e.target.value)}
          className={inputClass(isDark)}
          placeholder="e.g. Learn More"
        />
      </div>
      <div>
        <label className={labelClass(isDark)}>{t('form.secondaryCtaUrl')}</label>
        <input
          value={secondaryUrl}
          onChange={(e) => setSecondaryUrl(e.target.value)}
          className={inputClass(isDark)}
          placeholder="/wholesales or https://..."
        />
      </div>
    </div>
  );
}
