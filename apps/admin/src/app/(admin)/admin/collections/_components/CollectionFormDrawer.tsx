'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Collection, CreateCollectionPayload } from '../types';
import { createCollectionAction, updateCollectionAction } from '../actions';
import { CollectionTranslationsSection } from './CollectionTranslationsSection';

interface Props {
  collection?: Collection | null;
  onClose: () => void;
  onSuccess: (collection: Collection) => void;
}

export function CollectionFormDrawer({ collection, onClose, onSuccess }: Props) {
  const { t } = useTranslation('collections');
  const isEdit = !!collection;

  const [form, setForm] = useState<CreateCollectionPayload>({
    name: collection?.name ?? '',
    slug: collection?.slug ?? '',
    shortDescription: collection?.shortDescription ?? '',
    description: collection?.description ?? '',
    seoTitle: collection?.seoTitle ?? '',
    seoDescription: collection?.seoDescription ?? '',
    image: collection?.image ?? '',
    bannerImage: collection?.bannerImage ?? '',
    isFeatured: collection?.isFeatured ?? false,
    isActive: collection?.isActive ?? true,
    sortOrder: collection?.sortOrder ?? 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof CreateCollectionPayload, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: CreateCollectionPayload = {
      name: form.name,
      slug: form.slug || undefined,
      shortDescription: form.shortDescription || undefined,
      description: form.description || undefined,
      seoTitle: form.seoTitle || undefined,
      seoDescription: form.seoDescription || undefined,
      image: form.image || undefined,
      bannerImage: form.bannerImage || undefined,
      isFeatured: form.isFeatured,
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder) || 0,
    };

    const result = isEdit
      ? await updateCollectionAction(collection!.id, payload)
      : await createCollectionAction(payload);

    setLoading(false);
    if (result.success) {
      onSuccess(result.data);
    } else {
      setError((result as { success: false; error: string }).error ?? 'Save failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative ml-auto flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-base font-semibold text-[#111827]">
            {isEdit ? t('form.editTitle') : t('form.createTitle')}
          </h2>
          <button onClick={onClose} className="p-1 text-[#6B7280] hover:text-[#111827]">
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {error && (
            <div className="rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">
              {t('form.name')} <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="w-full rounded border border-[#D1D5DB] px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
              placeholder={t('form.namePlaceholder')}
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">
              {t('form.slug')} <span className="text-[#9CA3AF]">{t('form.slugHint')}</span>
            </label>
            <input
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              className="w-full rounded border border-[#D1D5DB] px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
              placeholder={t('form.slugPlaceholder')}
            />
          </div>

          {/* Short description */}
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">{t('form.shortDescription')}</label>
            <input
              value={form.shortDescription}
              onChange={(e) => set('shortDescription', e.target.value)}
              className="w-full rounded border border-[#D1D5DB] px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
              placeholder={t('form.shortDescriptionPlaceholder')}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">{t('form.description')}</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className="w-full rounded border border-[#D1D5DB] px-3 py-2 text-sm focus:border-[#111827] focus:outline-none resize-none"
              placeholder={t('form.descriptionPlaceholder')}
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">{t('form.coverImage')}</label>
            <input
              value={form.image}
              onChange={(e) => set('image', e.target.value)}
              className="w-full rounded border border-[#D1D5DB] px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
              placeholder="https://..."
            />
          </div>

          {/* Banner Image URL */}
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">{t('form.bannerImage')}</label>
            <input
              value={form.bannerImage}
              onChange={(e) => set('bannerImage', e.target.value)}
              className="w-full rounded border border-[#D1D5DB] px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
              placeholder="https://..."
            />
          </div>

          {/* SEO */}
          <div className="border-t border-[#E5E7EB] pt-5">
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">{t('form.seo')}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">{t('form.seoTitle')}</label>
                <input
                  value={form.seoTitle}
                  onChange={(e) => set('seoTitle', e.target.value)}
                  className="w-full rounded border border-[#D1D5DB] px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
                  placeholder={t('form.seoTitlePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">{t('form.seoDescription')}</label>
                <textarea
                  rows={2}
                  value={form.seoDescription}
                  onChange={(e) => set('seoDescription', e.target.value)}
                  className="w-full rounded border border-[#D1D5DB] px-3 py-2 text-sm focus:border-[#111827] focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="border-t border-[#E5E7EB] pt-5">
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">{t('form.settings')}</p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => set('isActive', e.target.checked)}
                  className="size-4 rounded border-[#D1D5DB]"
                />
                <span className="text-sm text-[#374151]">{t('form.activeLabel')}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => set('isFeatured', e.target.checked)}
                  className="size-4 rounded border-[#D1D5DB]"
                />
                <span className="text-sm text-[#374151]">{t('form.featuredLabel')}</span>
              </label>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">{t('form.sortOrder')}</label>
                <input
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) => set('sortOrder', Number(e.target.value))}
                  className="w-24 rounded border border-[#D1D5DB] px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Translations — edit mode only */}
          {isEdit && collection?.id && (
            <CollectionTranslationsSection collectionId={collection.id} />
          )}
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-[#E5E7EB] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-[#D1D5DB] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB]"
          >
            {t('form.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 rounded bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#1F2937] disabled:opacity-50"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? t('form.saveChanges') : t('form.create')}
          </button>
        </div>
      </div>
    </div>
  );
}
