'use client';

import { useState, useCallback, memo, useTransition } from 'react';
import { Search, Plus, Package, X, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CURRENCY_SYMBOLS } from '../../_constants';
import type { Product, ProductListResponse, ApiNailShape, ApiNailSize } from '../../types';
import ProductFormDrawer from './ProductFormDrawer';
import ProductEditDrawer from './ProductEditDrawer';
import { deleteProductAction } from '../../actions';

interface ProductRowProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  isDeleting: boolean;
}

const ProductRow = memo(function ProductRow({
  product,
  onEdit,
  onDelete,
  isDeleting,
}: ProductRowProps) {
  return (
    <tr className="hover:bg-[#F9FAFB] transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F3F4F6] to-[#E5E7EB] flex items-center justify-center shrink-0 overflow-hidden">
            {product.images[0] ? (
              <img
                src={product.images[0].url}
                alt={product.name}
                className="w-10 h-10 object-cover"
              />
            ) : (
              <Package className="w-5 h-5 text-[#9CA3AF]" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#111827] truncate">{product.name}</p>
            {product.description && (
              <p className="text-xs text-[#9CA3AF] truncate max-w-[200px]">{product.description}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm font-medium text-[#111827] whitespace-nowrap">
        {CURRENCY_SYMBOLS[product.currency] ?? product.currency}
        {Number(product.basePrice).toFixed(2)}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium ${
            product.isActive ? 'text-emerald-600' : 'text-[#9CA3AF]'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              product.isActive ? 'bg-emerald-400' : 'bg-[#D1D5DB]'
            }`}
          />
          {product.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(product)}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors disabled:opacity-40"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(product)}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-[#6B7280] hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});

interface ProductsTabProps {
  initialProducts: ProductListResponse;
  currentPage: number;
  currentSearch: string;
  currentLimit: number;
  shapes: ApiNailShape[];
  sizes: ApiNailSize[];
}

export default function ProductsTab({
  initialProducts,
  currentPage,
  currentSearch,
  currentLimit,
  shapes,
  sizes,
}: ProductsTabProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentSearch);
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { items, pagination } = initialProducts;

  const navigate = useCallback(
    (params: { page?: number; search?: string }) => {
      const q = new URLSearchParams();
      q.set('tab', 'products');
      if ((params.page ?? 1) > 1) q.set('page', String(params.page));
      if (params.search) q.set('search', params.search);
      if (currentLimit !== 20) q.set('limit', String(currentLimit));
      startTransition(() => router.push(`/admin/products?${q.toString()}`));
    },
    [router, currentLimit],
  );

  const handleSearchSubmit = useCallback(
    (e: { preventDefault(): void }) => {
      e.preventDefault();
      navigate({ search, page: 1 });
    },
    [navigate, search],
  );

  const clearSearch = useCallback(() => {
    setSearch('');
    navigate({ page: 1 });
  }, [navigate]);

  const handleEdit = useCallback((p: Product) => {
    setEditProductId(p.id);
  }, []);

  const handleDelete = useCallback(
    async (p: Product) => {
      if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
      setDeletingId(p.id);
      const result = await deleteProductAction(p.id);
      setDeletingId(null);
      if (result.success) router.refresh();
      else alert((result as { error: string }).error);
    },
    [router],
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Products</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {pagination.totalItems} products in catalog
          </p>
        </div>
        <button
          onClick={() => setShowAddDrawer(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Total Products', value: pagination.totalItems, color: 'text-[#111827]' },
          {
            label: 'Active (page)',
            value: items.filter((p) => p.isActive).length,
            color: 'text-emerald-600',
          },
          {
            label: 'Pages',
            value: `${pagination.currentPage} / ${Math.max(1, pagination.totalPages)}`,
            color: 'text-[#111827]',
          },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-[#E5E7EB] px-4 py-3">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4">
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg max-w-sm"
        >
          <Search className="w-4 h-4 text-[#9CA3AF] shrink-0" />
          <input
            type="text"
            placeholder="Search products... (press Enter)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none placeholder:text-[#9CA3AF]"
          />
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="p-0.5 hover:text-[#374151] text-[#9CA3AF]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                {[
                  { label: 'Product', cls: 'text-left' },
                  { label: 'Base Price', cls: 'text-left' },
                  { label: 'Status', cls: 'text-left' },
                  { label: 'Actions', cls: 'text-right' },
                ].map((h) => (
                  <th
                    key={h.label}
                    className={`px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider ${h.cls}`}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {items.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isDeleting={deletingId === product.id}
                />
              ))}
            </tbody>
          </table>
        </div>

        {items.length === 0 && (
          <div className="py-16 text-center">
            <Package className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
            <p className="text-sm text-[#9CA3AF]">No products found</p>
          </div>
        )}

        <div className="px-5 py-3 border-t border-[#E5E7EB] flex items-center justify-between">
          <p className="text-xs text-[#6B7280]">
            Showing {items.length} of {pagination.totalItems} products
          </p>
          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1 || isPending}
                onClick={() => navigate({ page: currentPage - 1, search: currentSearch })}
                className="px-3 py-1.5 text-xs rounded-lg border border-[#E5E7EB] hover:bg-[#F3F4F6] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span className="text-xs text-[#6B7280]">
                {currentPage} / {pagination.totalPages}
              </span>
              <button
                disabled={currentPage >= pagination.totalPages || isPending}
                onClick={() => navigate({ page: currentPage + 1, search: currentSearch })}
                className="px-3 py-1.5 text-xs rounded-lg border border-[#E5E7EB] hover:bg-[#F3F4F6] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add new product */}
      {showAddDrawer && (
        <ProductFormDrawer
          onClose={() => setShowAddDrawer(false)}
          onSuccess={() => {
            setShowAddDrawer(false);
            router.refresh();
          }}
        />
      )}

      {/* Edit product (full tabbed drawer) */}
      {editProductId && (
        <ProductEditDrawer
          productId={editProductId}
          shapes={shapes}
          sizes={sizes}
          onClose={() => setEditProductId(null)}
          onSuccess={() => {
            setEditProductId(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
