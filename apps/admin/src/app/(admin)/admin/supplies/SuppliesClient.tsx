'use client';

import { useState, useTransition, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { Search, Plus, Package, Edit, Trash2, X, ShoppingBag } from 'lucide-react';
import { useAdminTheme } from '@/app/context/AdminThemeContext';
import Pagination from '../shared/Pagination';
import type { Product, ProductListResponse, CreateProductPayload } from '../products/types';
import { createSupplyAction, updateSupplyAction, deleteSupplyAction } from './actions';
import SupplyFormDrawer from './SupplyFormDrawer';
import ConfirmDialog from '../shared/ConfirmDialog';
import { useConfirmDialog } from '../shared/useConfirmDialog';

interface SuppliesClientProps {
  initialSupplies: ProductListResponse;
  currentPage: number;
  currentSearch: string;
  currentLimit: number;
}

export function SuppliesClient({
  initialSupplies,
  currentPage,
  currentSearch,
  currentLimit,
}: SuppliesClientProps) {
  const router = useRouter();
  const { theme } = useAdminTheme();
  const { t } = useTranslation('supplies');
  const [search, setSearch] = useState(currentSearch);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSupply, setEditingSupply] = useState<Product | null>(null);
  const [isPending] = useTransition();
  const { dialogProps, openDialog } = useConfirmDialog();

  const isDark = theme === 'dark';

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('page', '1');
      params.set('limit', String(currentLimit));
      router.push(`/admin/supplies?${params.toString()}`);
    },
    [search, currentLimit, router],
  );

  const handleDelete = useCallback(
    (id: string) => {
      openDialog({
        title: t('deleteConfirm'),
        description: 'This supply will be permanently deleted and cannot be undone.',
        confirmLabel: 'Delete',
        onConfirm: async () => {
          const result = await deleteSupplyAction(id);
          if (!result.success) throw new Error((result as { error: string }).error);
          router.refresh();
        },
      });
    },
    [router, openDialog, t],
  );

  const { items: supplies, pagination } = initialSupplies;

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-[#111827]'}`}>
            {t('title')}
          </h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-[#6B7280]'}`}>
            {t('subtitle', { count: pagination.totalItems })}
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-[#111827] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#1F2937] transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('addSupply')}
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <div
          className={`flex items-center gap-2 flex-1 max-w-xs px-3 py-2 rounded-lg border text-sm ${
            isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-[#E5E7EB]'
          }`}
        >
          <Search className="w-4 h-4 text-[#9CA3AF]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search')}
            className="bg-transparent outline-none flex-1 text-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                router.push('/admin/supplies');
              }}
            >
              <X className="w-4 h-4 text-[#9CA3AF]" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-3 py-2 bg-[#111827] text-white rounded-lg text-sm font-medium hover:bg-[#1F2937] transition-colors"
        >
          {t('searchBtn')}
        </button>
      </form>

      {/* Table */}
      <div
        className={`rounded-xl border overflow-hidden ${isDark ? 'border-gray-800 bg-gray-900' : 'border-[#E5E7EB] bg-white'}`}
      >
        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={(page) => {
              const params = new URLSearchParams();
              if (currentSearch) params.set('search', currentSearch);
              params.set('page', String(page));
              params.set('limit', String(currentLimit));
              router.push(`/admin/supplies?${params.toString()}`);
            }}
            onItemsPerPageChange={(value) => {
              const params = new URLSearchParams();
              if (currentSearch) params.set('search', currentSearch);
              params.set('page', '1');
              params.set('limit', String(value));
              router.push(`/admin/supplies?${params.toString()}`);
            }}
          />
        )}
        <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className={isDark ? 'bg-gray-800' : 'bg-[#F9FAFB]'}>
              {[
                t('table.supply'),
                t('table.sku'),
                t('table.price'),
                t('table.stock'),
                t('table.status'),
                '',
              ].map((h) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-[#6B7280]'}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-gray-800' : 'divide-[#F3F4F6]'}`}>
            {supplies.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-[#D1D5DB]" />
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-[#9CA3AF]'}`}>
                    {t('empty')}
                  </p>
                </td>
              </tr>
            ) : (
              supplies.map((supply) => {
                // API returns variants relation even though ProductListResponse type doesn't declare it
                const supplyWithVariants = supply as Product & { variants?: { stockQty?: number; sku?: string }[] };
                const defaultVariant = supplyWithVariants.variants?.[0];
                const stockQty: number = defaultVariant?.stockQty ?? 0;
                const sku: string | null = defaultVariant?.sku ?? null;

                return (
                  <tr
                    key={supply.id}
                    className={`transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-[#F9FAFB]'}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] flex items-center justify-center overflow-hidden">
                          {supply.images[0] ? (
                            <img
                              src={supply.images[0].url}
                              alt={supply.name}
                              className="w-10 h-10 object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-[#9CA3AF]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-[#111827]'}`}
                          >
                            {supply.name}
                          </p>
                          {supply.description && (
                            <p className="text-xs text-[#9CA3AF] truncate max-w-[200px]">
                              {supply.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td
                      className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-[#374151]'}`}
                    >
                      {sku ?? <span className="text-[#9CA3AF]">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <p
                        className={`text-sm font-medium ${isDark ? 'text-white' : 'text-[#111827]'}`}
                      >
                        ${Number(supply.basePrice).toFixed(2)}
                      </p>
                      {supply.salePrice != null && (
                        <p className="text-xs text-red-500">
                          ${Number(supply.salePrice).toFixed(2)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-medium ${stockQty === 0 ? 'text-red-500' : stockQty <= 5 ? 'text-amber-500' : isDark ? 'text-green-400' : 'text-green-600'}`}
                      >
                        {stockQty}
                      </span>
                      {stockQty <= 5 && stockQty > 0 && (
                        <span className="ml-1 text-xs text-amber-500">{t('badge.low')}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          supply.isActive
                            ? isDark
                              ? 'bg-green-900 text-green-300'
                              : 'bg-green-100 text-green-700'
                            : isDark
                              ? 'bg-gray-700 text-gray-400'
                              : 'bg-[#F3F4F6] text-[#6B7280]'
                        }`}
                      >
                        {supply.isActive ? t('badge.active') : t('badge.inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => setEditingSupply(supply)}
                          className={`p-1.5 rounded hover:bg-[#F3F4F6] transition-colors ${isDark ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-[#9CA3AF] hover:text-[#374151]'}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(supply.id)}
                          disabled={isPending}
                          className={`p-1.5 rounded transition-colors disabled:opacity-40 ${isDark ? 'text-gray-400 hover:bg-red-900 hover:text-red-300' : 'text-[#9CA3AF] hover:bg-red-50 hover:text-red-500'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Create Drawer */}
      <SupplyFormDrawer
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={async (payload) => {
          const result = await createSupplyAction(payload as CreateProductPayload);
          if (result.success) {
            setIsCreateOpen(false);
            router.refresh();
          }
          return result;
        }}
      />

      {/* Edit Drawer */}
      {editingSupply && (
        <SupplyFormDrawer
          open={!!editingSupply}
          onClose={() => setEditingSupply(null)}
          supply={editingSupply}
          onSubmit={async (payload) => {
            const result = await updateSupplyAction(editingSupply.id, payload);
            if (result.success) {
              setEditingSupply(null);
              router.refresh();
            }
            return result;
          }}
        />
      )}

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
