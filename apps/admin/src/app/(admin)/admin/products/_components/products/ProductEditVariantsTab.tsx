'use client';

import { useState, memo } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { ApiProductVariant, ApiNailShape, ApiNailSize } from '../../types';
import { deleteVariantAction } from '../../actions';
import VariantFormDrawer from './VariantFormDrawer';

interface VariantRowProps {
  variant: ApiProductVariant;
  onEdit: (v: ApiProductVariant) => void;
  onDelete: (v: ApiProductVariant) => void;
  isDeleting: boolean;
}

const VariantRow = memo(function VariantRow({
  variant,
  onEdit,
  onDelete,
  isDeleting,
}: VariantRowProps) {
  return (
    <tr
      className={`transition-colors hover:bg-[#F9FAFB] ${isDeleting ? 'opacity-40' : ''}`}
    >
      <td className="px-3 py-2.5">
        <span className="text-xs font-medium text-[#111827]">{variant.shape.name}</span>
        <span className="text-xs text-[#9CA3AF] ml-1">({variant.shape.sizeTier})</span>
      </td>
      <td className="px-3 py-2.5">
        <span className="text-xs text-[#374151]">
          {variant.size.label} — {variant.size.sizeCode}
        </span>
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
          €{Number(variant.computedPrice).toFixed(2)}
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
          {variant.isAvailable ? 'Yes' : 'No'}
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
  variants: ApiProductVariant[];
  shapes: ApiNailShape[];
  sizes: ApiNailSize[];
  onRefresh: () => Promise<void>;
}

export default function ProductEditVariantsTab({
  productId,
  variants,
  shapes,
  sizes,
  onRefresh,
}: ProductEditVariantsTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editVariant, setEditVariant] = useState<ApiProductVariant | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (v: ApiProductVariant) => {
    if (!confirm(`Delete variant (${v.shape.name} / ${v.size.label})? This cannot be undone.`))
      return;
    setDeletingId(v.id);
    const result = await deleteVariantAction(productId, v.id);
    setDeletingId(null);
    if (result.success) {
      await onRefresh();
    } else {
      alert((result as { error: string }).error);
    }
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
    await onRefresh();
  };

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider">
          Variants ({variants.length})
        </h3>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] text-white text-xs font-medium hover:bg-[#374151] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Variant
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="py-14 text-center border border-dashed border-[#E5E7EB] rounded-xl">
          <p className="text-sm text-[#9CA3AF] mb-3">No variants configured</p>
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-lg bg-[#111827] text-white text-xs font-medium hover:bg-[#374151] transition-colors"
          >
            Add first variant
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                {[
                  { label: 'Shape', cls: 'text-left' },
                  { label: 'Size', cls: 'text-left' },
                  { label: 'SKU', cls: 'text-left' },
                  { label: 'Price', cls: 'text-right' },
                  { label: 'Stock', cls: 'text-right' },
                  { label: 'Available', cls: 'text-center' },
                  { label: 'Actions', cls: 'text-right' },
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
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  isDeleting={deletingId === v.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <VariantFormDrawer
          productId={productId}
          variant={editVariant ?? undefined}
          shapes={shapes}
          sizes={sizes}
          onClose={closeForm}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
