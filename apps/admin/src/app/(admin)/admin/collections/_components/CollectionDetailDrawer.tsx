'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Star, StarOff, Eye, EyeOff, Trash2, Edit2, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '../../shared/ConfirmDialog';
import { useConfirmDialog } from '../../shared/useConfirmDialog';
import type { Collection, CollectionWithProducts } from '../types';
import {
  getCollectionDetailAction,
  activateCollectionAction,
  deactivateCollectionAction,
  featureCollectionAction,
  unfeatureCollectionAction,
  deleteCollectionAction,
} from '../actions';

interface Props {
  collection: Collection;
  onClose: () => void;
  onEdit: (collection: Collection) => void;
  onDelete: (id: string) => void;
  onUpdate: (collection: Collection) => void;
}

export function CollectionDetailDrawer({ collection, onClose, onEdit, onDelete, onUpdate }: Props) {
  const { t } = useTranslation('collections');
  const [detail, setDetail] = useState<CollectionWithProducts | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { dialogProps, openDialog } = useConfirmDialog();

  useEffect(() => {
    setLoadingDetail(true);
    getCollectionDetailAction(collection.id).then((r) => {
      if (r.success) setDetail(r.data);
      setLoadingDetail(false);
    });
  }, [collection.id]);

  const runAction = async (
    key: string,
    fn: () => Promise<{ success: boolean; data?: unknown; error?: string }>,
  ) => {
    setActionLoading(key);
    setError(null);
    const result = await fn();
    setActionLoading(null);
    if (!result.success) {
      setError((result as any).error ?? t('detail.actionFailed'));
    } else if (result.data) {
      onUpdate(result.data as Collection);
    }
  };

  const handleDelete = () => {
    openDialog({
      title: t('detail.deleteConfirm'),
      description: 'This collection will be permanently deleted and cannot be undone.',
      confirmLabel: t('detail.delete'),
      onConfirm: async () => {
        const result = await deleteCollectionAction(collection.id);
        if (!result.success) {
          throw new Error(
            (result as { success: false; error: string }).error ?? t('detail.deleteFailed'),
          );
        }
        onDelete(collection.id);
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-stretch justify-center sm:justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex h-[90vh] sm:h-full w-full sm:max-w-xl flex-col bg-white shadow-2xl rounded-t-2xl sm:rounded-none overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-[#111827]">{collection.name}</h2>
            <p className="text-xs text-[#9CA3AF]">/{collection.slug}</p>
          </div>
          <button onClick={onClose} className="shrink-0 p-1 text-[#6B7280] hover:text-[#111827]">
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {error && (
            <div className="rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onEdit(collection)}
              className="flex items-center gap-1.5 rounded border border-[#D1D5DB] px-3 py-1.5 text-xs font-medium text-[#374151] hover:bg-[#F9FAFB]"
            >
              <Edit2 className="size-3.5" /> {t('detail.edit')}
            </button>
            <button
              disabled={!!actionLoading}
              onClick={() =>
                runAction('active', () =>
                  collection.isActive
                    ? deactivateCollectionAction(collection.id)
                    : activateCollectionAction(collection.id),
                )
              }
              className="flex items-center gap-1.5 rounded border border-[#D1D5DB] px-3 py-1.5 text-xs font-medium text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-50"
            >
              {actionLoading === 'active' ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : collection.isActive ? (
                <EyeOff className="size-3.5" />
              ) : (
                <Eye className="size-3.5" />
              )}
              {collection.isActive ? t('detail.deactivate') : t('detail.activate')}
            </button>
            <button
              disabled={!!actionLoading}
              onClick={() =>
                runAction('featured', () =>
                  collection.isFeatured
                    ? unfeatureCollectionAction(collection.id)
                    : featureCollectionAction(collection.id),
                )
              }
              className="flex items-center gap-1.5 rounded border border-[#D1D5DB] px-3 py-1.5 text-xs font-medium text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-50"
            >
              {actionLoading === 'featured' ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : collection.isFeatured ? (
                <StarOff className="size-3.5" />
              ) : (
                <Star className="size-3.5" />
              )}
              {collection.isFeatured ? t('detail.unfeature') : t('detail.feature')}
            </button>
            <button
              disabled={!!actionLoading}
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="size-3.5" />
              {t('detail.delete')}
            </button>
          </div>

          {/* Status badges */}
          <div className="flex gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                collection.isActive
                  ? 'bg-green-50 text-green-700'
                  : 'bg-[#F3F4F6] text-[#6B7280]'
              }`}
            >
              {collection.isActive ? t('badge.active') : t('badge.inactive')}
            </span>
            {collection.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                <Star className="size-3" /> {t('badge.featured')}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-xs font-medium text-[#6B7280]">
              <Package className="size-3" /> {t('detail.productCount', { count: collection.productCount ?? 0 })}
            </span>
          </div>

          {/* Description */}
          {collection.description && (
            <div>
              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-1">{t('detail.description')}</p>
              <p className="text-sm text-[#374151]">{collection.description}</p>
            </div>
          )}

          {/* SEO */}
          {(collection.seoTitle || collection.seoDescription) && (
            <div className="rounded border border-[#E5E7EB] p-4">
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">{t('detail.seo')}</p>
              {collection.seoTitle && (
                <p className="text-sm font-medium text-[#111827]">{collection.seoTitle}</p>
              )}
              {collection.seoDescription && (
                <p className="text-xs text-[#6B7280] mt-1">{collection.seoDescription}</p>
              )}
            </div>
          )}

          {/* Products */}
          <div>
            <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-3">
              {t('detail.assignedProducts')}
            </p>
            {loadingDetail ? (
              <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                <Loader2 className="size-4 animate-spin" /> {t('detail.loading')}
              </div>
            ) : detail?.products?.length ? (
              <div className="space-y-2">
                {detail.products.map((p) => {
                  const thumb = p.images?.find((i) => i.isMain) ?? p.images?.[0];
                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 rounded border border-[#E5E7EB] p-3"
                    >
                      {thumb ? (
                        <img
                          src={thumb.url}
                          alt={p.name}
                          className="size-10 shrink-0 rounded object-cover"
                        />
                      ) : (
                        <div className="size-10 shrink-0 rounded bg-[#F3F4F6] flex items-center justify-center">
                          <Package className="size-4 text-[#D1D5DB]" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#111827]">{p.name}</p>
                        <p className="text-xs text-[#9CA3AF]">
                          {p.currency} {Number(p.basePrice).toFixed(2)}
                        </p>
                      </div>
                      <span
                        className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs ${
                          p.isActive ? 'bg-green-50 text-green-700' : 'bg-[#F3F4F6] text-[#9CA3AF]'
                        }`}
                      >
                        {p.isActive ? t('badge.active') : t('badge.inactive')}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[#9CA3AF]">{t('detail.noProducts')}</p>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
