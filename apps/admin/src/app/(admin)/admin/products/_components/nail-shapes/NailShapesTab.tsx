'use client';

import { useState } from 'react';
import { Search, Plus, X, Edit, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../shared/ConfirmDialog';
import { useConfirmDialog } from '../../../shared/useConfirmDialog';
import { useRouter } from 'next/navigation';
import { useAdminTheme } from '@/app/context/AdminThemeContext';
import { useNailShapeFilters } from '../../_hooks/useNailShapeFilters';
import { tierColors, TIER_LABELS, SIZE_TIERS } from '../../_constants';
import type { NailShape } from '../../_types';
import Pagination from '../../../shared/Pagination';
import ShapeDrawer from './ShapeDrawer';
import { deleteNailShapeAction } from '../../actions';

interface NailShapesTabProps {
  initialShapes: NailShape[];
}

export default function NailShapesTab({ initialShapes }: NailShapesTabProps) {
  const { theme } = useAdminTheme();
  const dark = theme === 'dark';
  const router = useRouter();

  const {
    search,
    handleSearch,
    clearSearch,
    tierFilter,
    handleTierFilter,
    statusFilter,
    handleStatusFilter,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    handleItemsPerPageChange,
    paginated,
    totalFiltered,
    totalCount,
    activeCount,
  } = useNailShapeFilters(initialShapes);

  const [showDrawer, setShowDrawer] = useState(false);
  const [editShape, setEditShape] = useState<NailShape | null>(null);
  const { dialogProps, openDialog } = useConfirmDialog();

  const openAdd = () => {
    setEditShape(null);
    setShowDrawer(true);
  };

  const openEdit = (shape: NailShape) => {
    setEditShape(shape);
    setShowDrawer(true);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
    setEditShape(null);
  };

  const handleDelete = (shape: NailShape) => {
    openDialog({
      title: `Delete "${shape.name}"?`,
      description: 'This shape will be permanently deleted and cannot be undone.',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        const result = await deleteNailShapeAction(shape.id);
        if (!result.success) throw new Error((result as { error: string }).error);
        router.refresh();
      },
    });
  };

  const standardCount = initialShapes.filter((s) => s.sizeTier === 'standard').length;
  const premiumCount = initialShapes.filter(
    (s) => s.sizeTier === 'large' || s.sizeTier === 'xl',
  ).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-xl font-semibold ${dark ? 'text-white' : 'text-[#111827]'}`}>
            Nail Shapes
          </h1>
          <p className={`text-sm mt-0.5 ${dark ? 'text-gray-500' : 'text-[#6B7280]'}`}>
            {totalCount} shapes configured
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Shape
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Shapes', value: totalCount },
          { label: 'Active', value: activeCount },
          { label: 'Standard Tier', value: standardCount },
          { label: 'Premium (L/XL)', value: premiumCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border px-4 py-3 ${
              dark ? 'bg-[#1C1E26] border-[#2E3244]' : 'bg-white border-[#E5E7EB]'
            }`}
          >
            <p className={`text-2xl font-bold ${dark ? 'text-white' : 'text-[#111827]'}`}>
              {stat.value}
            </p>
            <p className={`text-xs mt-0.5 ${dark ? 'text-gray-500' : 'text-[#9CA3AF]'}`}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        className={`rounded-xl border p-4 mb-4 flex flex-wrap gap-3 items-center ${
          dark ? 'bg-[#1C1E26] border-[#2E3244]' : 'bg-white border-[#E5E7EB]'
        }`}
      >
        <div
          className={`flex-1 min-w-48 flex items-center gap-2 px-3 py-2 border rounded-lg ${
            dark ? 'border-[#2E3244] bg-[#0F1117]' : 'border-[#E5E7EB]'
          }`}
        >
          <Search className={`w-4 h-4 shrink-0 ${dark ? 'text-gray-600' : 'text-[#9CA3AF]'}`} />
          <input
            type="text"
            placeholder="Search shapes..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className={`flex-1 text-sm outline-none bg-transparent ${
              dark ? 'text-white placeholder:text-gray-600' : 'placeholder:text-[#9CA3AF]'
            }`}
          />
          {search && (
            <button onClick={clearSearch} className="text-[#9CA3AF] hover:text-[#374151]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <select
          value={tierFilter}
          onChange={(e) => handleTierFilter(e.target.value)}
          className={`px-3 py-2 border rounded-lg text-sm outline-none cursor-pointer ${
            dark ? 'border-[#2E3244] bg-[#0F1117] text-white' : 'border-[#E5E7EB] text-[#374151]'
          }`}
        >
          <option value="all">All Tiers</option>
          {SIZE_TIERS.map((t) => (
            <option key={t} value={t}>
              {TIER_LABELS[t]}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className={`px-3 py-2 border rounded-lg text-sm outline-none cursor-pointer ${
            dark ? 'border-[#2E3244] bg-[#0F1117] text-white' : 'border-[#E5E7EB] text-[#374151]'
          }`}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div
        className={`rounded-xl border overflow-hidden ${
          dark ? 'bg-[#1C1E26] border-[#2E3244]' : 'bg-white border-[#E5E7EB]'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className={`border-b ${
                  dark ? 'border-[#2E3244] bg-[#0F1117]' : 'border-[#E5E7EB] bg-[#F9FAFB]'
                }`}
              >
                {[
                  'Name',
                  'Length (mm)',
                  'Size Tier',
                  'Price Adjustment',
                  'Type',
                  'Status',
                  'Actions',
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${
                      i === 6 ? 'text-right' : 'text-left'
                    } ${dark ? 'text-gray-500' : 'text-[#6B7280]'}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${dark ? 'divide-[#2E3244]' : 'divide-[#F3F4F6]'}`}>
              {paginated.map((shape) => (
                <tr
                  key={shape.id}
                  className={`transition-colors ${
                    dark ? 'hover:bg-[#2E3244]/30' : 'hover:bg-[#F9FAFB]'
                  }`}
                >
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-medium ${dark ? 'text-white' : 'text-[#111827]'}`}
                    >
                      {shape.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${dark ? 'text-gray-300' : 'text-[#374151]'}`}>
                      {shape.lengthMm}mm
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tierColors[shape.sizeTier]}`}
                    >
                      {TIER_LABELS[shape.sizeTier]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-medium ${dark ? 'text-white' : 'text-[#111827]'}`}
                    >
                      {shape.adjustmentType === 'percent'
                        ? `${Number(shape.priceAdjustment)}%`
                        : `$${Number(shape.priceAdjustment).toFixed(2)}`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${dark ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                      {shape.adjustmentType === 'percent' ? 'Percentage' : 'Fixed'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${
                        shape.isActive
                          ? 'text-emerald-600'
                          : dark
                            ? 'text-gray-500'
                            : 'text-[#9CA3AF]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          shape.isActive ? 'bg-emerald-400' : dark ? 'bg-gray-600' : 'bg-[#D1D5DB]'
                        }`}
                      />
                      {shape.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(shape)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          dark
                            ? 'text-gray-400 hover:bg-[#2E3244] hover:text-white'
                            : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]'
                        }`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(shape)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          dark
                            ? 'text-gray-400 hover:bg-red-900/30 hover:text-red-400'
                            : 'text-[#6B7280] hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalFiltered === 0 && (
          <div className="py-16 text-center">
            <p className={`text-sm ${dark ? 'text-gray-500' : 'text-[#9CA3AF]'}`}>
              No shapes found
            </p>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalItems={totalFiltered}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      {showDrawer && (
        <ShapeDrawer
          shape={editShape}
          onClose={closeDrawer}
          onSuccess={() => {
            closeDrawer();
            router.refresh();
          }}
        />
      )}

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
