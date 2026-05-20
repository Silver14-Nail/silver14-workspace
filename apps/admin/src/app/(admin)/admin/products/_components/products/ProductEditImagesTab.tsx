'use client';

import { useRef, useState } from 'react';
import { Upload, Trash2, Star, ChevronUp, ChevronDown, Loader2, Package } from 'lucide-react';
import type { ApiProductImage } from '../../types';
import {
  getPresignedUrlAction,
  addProductImageAction,
  deleteProductImageAction,
  reorderProductImagesAction,
  setMainProductImageAction,
} from '../../actions';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingMainId, setSettingMainId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    e.target.value = '';

    setUploadError('');

    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setUploadError(`"${file.name}" is not a supported image type (JPEG, PNG, WebP, GIF).`);
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setUploadError(`"${file.name}" exceeds the ${MAX_SIZE_MB}MB limit.`);
        continue;
      }

      setUploading(true);
      try {
        const presignResult = await getPresignedUrlAction(productId, {
          filename: file.name,
          contentType: file.type,
        });

        if (!presignResult.success) {
          setUploadError((presignResult as { error: string }).error);
          setUploading(false);
          return;
        }

        const { presignedUrl, publicUrl } = presignResult.data;

        const uploadRes = await fetch(presignedUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });

        if (!uploadRes.ok) {
          setUploadError(`Upload failed for "${file.name}". Please try again.`);
          setUploading(false);
          return;
        }

        const addResult = await addProductImageAction(productId, { url: publicUrl });
        if (!addResult.success) {
          setUploadError((addResult as { error: string }).error);
          setUploading(false);
          return;
        }

        await onRefresh();
      } catch {
        setUploadError('An unexpected error occurred during upload.');
      }
      setUploading(false);
    }
  };

  const handleDelete = async (img: ApiProductImage) => {
    if (!confirm('Remove this image?')) return;
    setActionError('');
    setDeletingId(img.id);
    const result = await deleteProductImageAction(productId, img.id);
    setDeletingId(null);
    if (result.success) {
      await onRefresh();
    } else {
      setActionError((result as { error: string }).error);
    }
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
    <div className="flex-1 overflow-y-auto p-5">
      {/* Upload button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider">
          Images ({images.length})
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
          {uploading ? 'Uploading...' : 'Upload Images'}
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
          Click to upload or drag &amp; drop
          <br />
          JPEG, PNG, WebP, GIF · max {MAX_SIZE_MB}MB per file
        </p>
      </div>

      {/* Image list */}
      {sorted.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-[#E5E7EB] rounded-xl">
          <Package className="w-7 h-7 text-[#D1D5DB] mx-auto mb-2" />
          <p className="text-sm text-[#9CA3AF]">No images yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((img, idx) => {
            const isDeleting = deletingId === img.id;
            const isSettingMain = settingMainId === img.id;
            const busy = isDeleting || isSettingMain || reordering;

            return (
              <div
                key={img.id}
                className={`flex items-center gap-3 p-3 border rounded-xl transition-colors ${
                  img.isMain
                    ? 'border-[#111827] bg-[#F9FAFB]'
                    : 'border-[#E5E7EB] bg-white'
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
                        Main
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
                      title="Set as main image"
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
                    {isDeleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
