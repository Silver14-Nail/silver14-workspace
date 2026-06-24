'use client';

import { useState } from 'react';
import { Search, Plus, X, Edit, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../shared/ConfirmDialog';
import { useConfirmDialog } from '../../../shared/useConfirmDialog';
import { useRouter } from 'next/navigation';
import { useNailSizeFilters } from '../../_hooks/useNailSizeFilters';
import { sizeColors } from '../../_constants';
import type { NailSize } from '../../_types';
import Pagination from '../../../shared/Pagination';
import SizeDrawer from './SizeDrawer';
import { deleteNailSizeAction } from '../../actions';

interface NailSizesTabProps {
  initialSizes: NailSize[];
}

export default function NailSizesTab({ initialSizes }: NailSizesTabProps) {
  const router = useRouter();

  const {
    search,
    handleSearch,
    clearSearch,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    handleItemsPerPageChange,
    paginated,
    totalFiltered,
    totalCount,
  } = useNailSizeFilters(initialSizes);

  const [showDrawer, setShowDrawer] = useState(false);
  const [editSize, setEditSize] = useState<NailSize | null>(null);
  const { dialogProps, openDialog } = useConfirmDialog();

  const openAdd = () => {
    setEditSize(null);
    setShowDrawer(true);
  };

  const openEdit = (size: NailSize) => {
    setEditSize(size);
    setShowDrawer(true);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
    setEditSize(null);
  };

  const handleDelete = (size: NailSize) => {
    openDialog({
      title: `Delete size "${size.sizeCode}"?`,
      description: 'This size will be permanently deleted and cannot be undone.',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        const result = await deleteNailSizeAction(size.id);
        if (!result.success) throw new Error((result as { error: string }).error);
        router.refresh();
      },
    });
  };

  const standardCount = initialSizes.filter((s) => ['XS', 'S', 'M'].includes(s.label)).length;
  const largeCount = initialSizes.filter((s) => ['L', 'XL'].includes(s.label)).length;
  const xxlCount = initialSizes.filter((s) => s.label === 'XXL').length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Nail Sizes</h1>
          <p className="text-sm mt-0.5 text-[#6B7280]">{totalCount} sizes configured</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Size
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Sizes', value: totalCount },
          { label: 'Standard (XS–M)', value: standardCount },
          { label: 'Large (L–XL)', value: largeCount },
          { label: 'Extra Large (XXL)', value: xxlCount },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-[#E5E7EB] px-4 py-3">
            <p className="text-2xl font-bold text-[#111827]">{stat.value}</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg max-w-sm">
          <Search className="w-4 h-4 text-[#9CA3AF] shrink-0" />
          <input
            type="text"
            placeholder="Search sizes..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 text-sm outline-none placeholder:text-[#9CA3AF]"
          />
          {search && (
            <button onClick={clearSearch} className="text-[#9CA3AF] hover:text-[#374151]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <Pagination
          currentPage={currentPage}
          totalItems={totalFiltered}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                {['Label', 'Size Code', 'Measurements', 'Actions'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6B7280] ${
                      i === 3 ? 'text-right' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {paginated.map((size) => (
                <tr key={size.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sizeColors[size.label] ?? 'bg-gray-100 text-gray-700'}`}
                    >
                      {size.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-[#111827]">{size.sizeCode}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-[#6B7280]">{size.measurements || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(size)}
                        className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(size)}
                        className="p-1.5 rounded-lg text-[#6B7280] hover:bg-red-50 hover:text-red-600 transition-colors"
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
            <p className="text-sm text-[#9CA3AF]">No sizes found</p>
          </div>
        )}
      </div>

      {showDrawer && (
        <SizeDrawer
          size={editSize}
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
