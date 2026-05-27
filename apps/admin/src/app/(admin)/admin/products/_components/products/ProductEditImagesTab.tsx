'use client';

import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Trash2, Star, ChevronUp, ChevronDown, Loader2, Package } from 'lucide-react';
import type { ApiProductImage } from '../../types';
import {
  uploadProductImageAction,
  presignProductImageUploadAction,
  confirmProductImageUploadAction,
  deleteProductImageAction,
  reorderProductImagesAction,
  setMainProductImageAction,
} from '../../actions';
import ConfirmDialog from '../../../shared/ConfirmDialog';
import { useConfirmDialog } from '../../../shared/useConfirmDialog';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_MB = 5;

interface ProductEditImagesTabProps {
  productId: string;
  images: ApiProductImage[];
  onRefresh: () => Promise<void>;
}

export default function ProductEditImagesTab({
  productId,
  images,
  onRefresh,
}: ProductEditImagesTabProps) {
  const { t } = useTranslation('products');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ completed: number; total: number } | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [settingMainId, setSettingMainId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const { dialogProps, openDialog } = useConfirmDialog();

  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    e.target.value = '';
    setUploadError('');

    // Validate all files first, collect valid ones and validation errors separately
    const validFiles: File[] = [];
    const validationErrors: string[] = [];
    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        validationErrors.push(t('images.errorType', { name: file.name }));
      } else if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        validationErrors.push(t('images.errorSize', { name: file.name, max: MAX_SIZE_MB }));
      } else {
        validFiles.push(file);
      }
    }
    if (validationErrors.length) setUploadError(validationErrors.join('\n'));
    if (!validFiles.length) return;

    setUploading(true);
    setUploadProgress({ completed: 0, total: validFiles.length });

    // Upload all valid files in parallel using presigned URLs for direct browser→R2 upload
    const results = await Promise.allSettled(
      validFiles.map(async (file) => {
        // 1. Get a short-lived presigned PUT URL from the API
        const presignResult = await presignProductImageUploadAction(productId, file.type);
        if (!presignResult.success) throw new Error((presignResult as { error: string }).error);
        const { presignedUrl, publicUrl } = presignResult.data!;

        // 2. PUT directly to R2; fall back to server-proxied upload if CORS blocks it
        let finalResult;
        try {
          const putRes = await fetch(presignedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file,
          });
          if (!putRes.ok) throw new Error(`Storage returned ${putRes.status}`);
          // 3a. Confirm — ask API to save the DB record
          const confirmResult = await confirmProductImageUploadAction(productId, publicUrl);
          if (!confirmResult.success) throw new Error((confirmResult as { error: string }).error);
          finalResult = confirmResult;
        } catch {
          // CORS not configured or direct upload unavailable — fall back via server
          const formData = new FormData();
          formData.append('file', file);
          const fallback = await uploadProductImageAction(productId, formData);
          if (!fallback.success) throw new Error((fallback as { error: string }).error);
          finalResult = fallback;
        }

        setUploadProgress((prev) => (prev ? { ...prev, completed: prev.completed + 1 } : null));
        return finalResult;
      }),
    );

    const failures = results
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map((r) => (r.reason instanceof Error ? r.reason.message : t('images.errorUnexpected')));
    if (failures.length) setUploadError(failures.join('\n'));

    // Single refresh after all uploads settle — only if at least one succeeded
    if (results.some((r) => r.status === 'fulfilled')) await onRefresh();

    setUploadProgress(null);
    setUploading(false);
  };

  const handleDelete = (img: ApiProductImage) => {
    openDialog({
      title: t('images.removeConfirm'),
      description: 'This image will be permanently deleted.',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        const result = await deleteProductImageAction(productId, img.id);
        if (!result.success) throw new Error((result as { error: string }).error);
        await onRefresh();
      },
    });
  };

  const handleSetMain = async (img: ApiProductImage) => {
    if (img.isMain) return;
    setActionError('');
    setSettingMainId(img.id);
    const result = await setMainProductImageAction(productId, img.id);
    setSettingMainId(null);
    if (result.success) {
      await onRefresh();
    } else {
      setActionError((result as { error: string }).error);
    }
  };

  const handleMove = async (img: ApiProductImage, direction: 'up' | 'down') => {
    const idx = sorted.findIndex((i) => i.id === img.id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === sorted.length - 1) return;

    const newOrder = [...sorted];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];

    setReordering(true);
    setActionError('');
    const result = await reorderProductImagesAction(productId, {
      orderedIds: newOrder.map((i) => i.id),
    });
    setReordering(false);
    if (result.success) {
      await onRefresh();
    } else {
      setActionError((result as { error: string }).error);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-5">
      {/* Upload button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider">
          {t('images.title', { count: images.length })}
        </h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] text-white text-xs font-medium hover:bg-[#374151] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          {uploading && uploadProgress
            ? `${t('images.uploading')} ${uploadProgress.completed}/${uploadProgress.total}`
            : uploading
              ? t('images.uploading')
              : t('images.upload')}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {uploadError && (
        <div className="mb-3 px-3 py-2.5 rounded-lg bg-red-50 text-xs text-red-600 border border-red-100">
          {uploadError}
        </div>
      )}
      {actionError && (
        <div className="mb-3 px-3 py-2.5 rounded-lg bg-red-50 text-xs text-red-600 border border-red-100">
          {actionError}
        </div>
      )}

      {/* Upload dropzone hint */}
      <div
        className="mb-4 border-2 border-dashed border-[#E5E7EB] rounded-xl p-4 text-center cursor-pointer hover:border-[#9CA3AF] transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-5 h-5 text-[#D1D5DB] mx-auto mb-1" />
        <p className="text-xs text-[#9CA3AF]">
          {t('images.dropHint')}
          <br />
          {t('images.formatHint', { max: MAX_SIZE_MB })}
        </p>
      </div>

      {/* Image list */}
      {sorted.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-[#E5E7EB] rounded-xl">
          <Package className="w-7 h-7 text-[#D1D5DB] mx-auto mb-2" />
          <p className="text-sm text-[#9CA3AF]">{t('images.noImages')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((img, idx) => {
            const isSettingMain = settingMainId === img.id;
            const busy = isSettingMain || reordering;

            return (
              <div
                key={img.id}
                className={`flex items-center gap-3 p-3 border rounded-xl transition-colors ${
                  img.isMain ? 'border-[#111827] bg-[#F9FAFB]' : 'border-[#E5E7EB] bg-white'
                } ${busy ? 'opacity-60' : ''}`}
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#F3F4F6] shrink-0">
                  <img
                    src={img.url}
                    alt={`Image ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {img.isMain && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#111827] text-white text-[10px] font-semibold">
                        <Star className="w-2.5 h-2.5" />
                        {t('images.mainBadge')}
                      </span>
                    )}
                    <span className="text-xs text-[#6B7280]">#{idx + 1}</span>
                  </div>
                  <p className="text-[11px] text-[#9CA3AF] truncate">{img.url}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Reorder */}
                  <div className="flex flex-col">
                    <button
                      onClick={() => handleMove(img, 'up')}
                      disabled={busy || idx === 0}
                      className="p-1 rounded text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] disabled:opacity-30 transition-colors"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(img, 'down')}
                      disabled={busy || idx === sorted.length - 1}
                      className="p-1 rounded text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] disabled:opacity-30 transition-colors"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Set main */}
                  {!img.isMain && (
                    <button
                      onClick={() => handleSetMain(img)}
                      disabled={busy}
                      title={t('images.setMain')}
                      className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-amber-500 hover:bg-amber-50 disabled:opacity-40 transition-colors"
                    >
                      {isSettingMain ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Star className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(img)}
                    disabled={busy}
                    className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 disabled:opacity-40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
