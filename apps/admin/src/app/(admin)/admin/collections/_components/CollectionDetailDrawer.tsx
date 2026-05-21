'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Star, StarOff, Eye, EyeOff, Trash2, Edit2, Package } from 'lucide-react';
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
  const [detail, setDetail] = useState<CollectionWithProducts | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setError((result as any).error ?? 'Action failed');
    } else if (result.data) {
      onUpdate(result.data as Collection);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this collection? This cannot be undone.')) return;
    setActionLoading('delete');
    const result = await deleteCollectionAction(collection.id);
    setActionLoading(null);
    if (result.success) {
      onDelete(collection.id);
      onClose();
    } else {
      setError((result as { success: false; error: string }).error ?? 'Delete failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative ml-auto flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
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
              <Edit2 className="size-3.5" /> Edit
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
              {collection.isActive ? 'Deactivate' : 'Activate'}
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
              {collection.isFeatured ? 'Unfeature' : 'Feature'}
            </button>
            <button
              disabled={!!actionLoading}
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {actionLoading === 'delete' ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
              Delete
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
              {collection.isActive ? 'Active' : 'Inactive'}
            </span>
            {collection.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                <Star className="size-3" /> Featured
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-xs font-medium text-[#6B7280]">
              <Package className="size-3" /> {collection.productCount ?? 0} products
            </span>
          </div>

          {/* Description */}
          {collection.description && (
            <div>
              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-1">Description</p>
              <p className="text-sm text-[#374151]">{collection.description}</p>
            </div>
          )}

          {/* SEO */}
          {(collection.seoTitle || collection.seoDescription) && (
            <div className="rounded border border-[#E5E7EB] p-4">
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">SEO</p>
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
              Assigned Products
            </p>
            {loadingDetail ? (
              <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                <Loader2 className="size-4 animate-spin" /> Loading...
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
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[#9CA3AF]">No products assigned yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
