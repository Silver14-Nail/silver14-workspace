'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import type { ApiProductVariant, ApiNailShape, ApiNailSize, ProductType } from '../../types';
import { listProductVariantsAction, deleteVariantAction } from '../../actions';
import VariantFormDrawer from './VariantFormDrawer';
import ConfirmDialog from '../../../shared/ConfirmDialog';
import { useConfirmDialog } from '../../../shared/useConfirmDialog';

interface VariantRowProps {
  variant: ApiProductVariant;
  productType: ProductType;
  onEdit: (v: ApiProductVariant) => void;
  onDelete: (v: ApiProductVariant) => void;
  isDeleting: boolean;
}

const VariantRow = memo(function VariantRow({
  variant,
  productType,
  onEdit,
  onDelete,
  isDeleting,
}: VariantRowProps) {
  const { t } = useTranslation('products');
  // A row is "nail-style" if the product is nail type OR this variant has shape data
  const isNail = productType === 'nail' || variant.shape != null;

  return (
    <tr className={`transition-colors hover:bg-[#F9FAFB] ${isDeleting ? 'opacity-40' : ''}`}>
      <td className="px-3 py-2.5">
        {isNail ? (
          variant.shape ? (
            <>
              <span className="text-xs font-medium text-[#111827]">{variant.shape.name}</span>
              <span className="text-xs text-[#9CA3AF] ml-1">({variant.shape.sizeTier})</span>
            </>
          ) : (
            <span className="text-xs text-[#9CA3AF]">—</span>
          )
        ) : variant.colorName ? (
          <div className="flex items-center gap-2">
            {variant.colorHex && (
              <span
                className="w-4 h-4 rounded-full border border-[#E5E7EB] flex-shrink-0"
                style={{ backgroundColor: variant.colorHex }}
              />
            )}
            <span className="text-xs font-medium text-[#111827]">{variant.colorName}</span>
          </div>
        ) : (
          <span className="text-xs text-[#9CA3AF]">Default</span>
        )}
      </td>
      <td className="px-3 py-2.5">
        {isNail ? (
          variant.size ? (
            <span className="text-xs text-[#374151]">
              {variant.size.label} — {variant.size.sizeCode}
            </span>
          ) : (
            <span className="text-xs text-[#9CA3AF]">—</span>
          )
        ) : (
          <span className="text-xs text-[#9CA3AF]">—</span>
        )}
      </td>
      <td className="px-3 py-2.5">
        {variant.sku ? (
          <span className="text-xs font-mono text-[#374151]">{variant.sku}</span>
        ) : (
          <span className="text-xs text-[#D1D5DB]">—</span>
        )}
      </td>
      <td className="px-3 py-2.5 text-right">
        <span className="text-xs font-medium text-[#111827]">
          ${Number(variant.computedPrice).toFixed(2)}
        </span>
      </td>
      <td className="px-3 py-2.5 text-right">
        <span
          className={`text-xs font-medium ${
            variant.stockQty === 0
              ? 'text-red-600'
              : variant.stockQty < 10
                ? 'text-amber-600'
                : 'text-[#374151]'
          }`}
        >
          {variant.stockQty}
        </span>
      </td>
      <td className="px-3 py-2.5 text-center">
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium ${
            variant.isAvailable ? 'text-emerald-600' : 'text-[#9CA3AF]'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              variant.isAvailable ? 'bg-emerald-400' : 'bg-[#D1D5DB]'
            }`}
          />
          {variant.isAvailable ? t('variants.yes') : t('variants.no')}
        </span>
      </td>
      <td className="px-3 py-2.5 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(variant)}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors disabled:opacity-40"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(variant)}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-[#6B7280] hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
});

interface ProductEditVariantsTabProps {
  productId: string;
  productType: ProductType;
  shapes: ApiNailShape[];
  sizes: ApiNailSize[];
}

export default function ProductEditVariantsTab({
  productId,
  productType,
  shapes,
  sizes,
}: ProductEditVariantsTabProps) {
  const { t } = useTranslation('products');
  const [variants, setVariants] = useState<ApiProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editVariant, setEditVariant] = useState<ApiProductVariant | null>(null);
  const { dialogProps, openDialog } = useConfirmDialog();

  const loadVariants = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    const result = await listProductVariantsAction(productId);
    if (result.success) {
      setVariants(result.data);
    } else {
      setLoadError((result as { error: string }).error);
    }
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    loadVariants();
  }, [loadVariants]);

  // Treat as nail-style if product is nail type OR if existing variants have shape data
  const isNail = productType === 'nail' || variants.some((v) => v.shape != null);

  const handleDelete = (v: ApiProductVariant) => {
    const label = isNail
      ? `${v.shape?.name ?? '?'} / ${v.size?.label ?? '?'}`
      : (v.colorName ?? 'Default variant');
    openDialog({
      title: `Delete variant (${label})?`,
      description: 'This variant will be permanently deleted and cannot be undone.',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        const result = await deleteVariantAction(productId, v.id);
        if (!result.success) throw new Error((result as { error: string }).error);
        await loadVariants();
      },
    });
  };

  const openEdit = (v: ApiProductVariant) => {
    setEditVariant(v);
    setShowForm(true);
  };

  const openAdd = () => {
    setEditVariant(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditVariant(null);
  };

  const handleSuccess = async () => {
    closeForm();
    await loadVariants();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-[#9CA3AF] animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <p className="text-sm text-red-500 text-center">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider">
          {t('variants.title', { count: variants.length })}
        </h3>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] text-white text-xs font-medium hover:bg-[#374151] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {t('variants.add')}
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="py-14 text-center border border-dashed border-[#E5E7EB] rounded-xl">
          <p className="text-sm text-[#9CA3AF] mb-3">{t('variants.empty')}</p>
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-lg bg-[#111827] text-white text-xs font-medium hover:bg-[#374151] transition-colors"
          >
            {t('variants.addFirst')}
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                {[
                  { label: isNail ? t('variants.colShape') : t('variants.colColor'), cls: 'text-left' },
                  { label: isNail ? t('variants.colSize') : '', cls: 'text-left' },
                  { label: t('variants.colSku'), cls: 'text-left' },
                  { label: t('variants.colPrice'), cls: 'text-right' },
                  { label: t('variants.colStock'), cls: 'text-right' },
                  { label: t('variants.colAvailable'), cls: 'text-center' },
                  { label: t('table.actions'), cls: 'text-right' },
                ].map((h) => (
                  <th
                    key={h.label}
                    className={`px-3 py-2.5 font-semibold text-[#6B7280] uppercase tracking-wider ${h.cls}`}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {variants.map((v) => (
                <VariantRow
                  key={v.id}
                  variant={v}
                  productType={productType}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  isDeleting={false}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <VariantFormDrawer
          productId={productId}
          productType={productType}
          variant={editVariant ?? undefined}
          shapes={shapes}
          sizes={sizes}
          onClose={closeForm}
          onSuccess={handleSuccess}
        />
      )}

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
