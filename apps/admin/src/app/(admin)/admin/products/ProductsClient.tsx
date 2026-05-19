'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Package, Edit, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product, ProductListResponse } from './types';
import { createProductAction, updateProductAction, deleteProductAction } from './actions';

const CURRENCY_SYMBOLS: Record<string, string> = { EUR: '€', USD: '$', GBP: '£' };

function currencySymbol(c: string) {
  return CURRENCY_SYMBOLS[c] ?? c;
}

// ─── Modal ───────────────────────────────────────────────────────────────────

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

function ProductModal({ product, onClose, onSaved }: ProductModalProps) {
  const isEdit = product !== null;
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product ? String(Number(product.basePrice)) : '');
  const [currency, setCurrency] = useState(product?.currency ?? 'EUR');
  const [active, setActive] = useState(product?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Product name is required');
      return;
    }
    const basePrice = parseFloat(price);
    if (isNaN(basePrice) || basePrice < 0) {
      setError('Enter a valid price');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      basePrice,
      currency,
      isActive: active,
    };

    const result = isEdit
      ? await updateProductAction(product.id, payload)
      : await createProductAction(payload);

    setLoading(false);

    if (result.success === false) {
      setError(result.error);
      return;
    }

    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-sm font-semibold text-[#111827]">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F3F4F6]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827] transition-colors"
              placeholder="e.g. Crystal Aurora Set"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827] transition-colors resize-none"
              placeholder="Product description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Base Price <span className="text-red-500">*</span>
              </label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827] transition-colors"
                placeholder="38.00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827] cursor-pointer"
              >
                {['EUR', 'USD', 'GBP'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg">
            <div>
              <p className="text-sm font-medium text-[#374151]">Product Active</p>
              <p className="text-xs text-[#9CA3AF]">Visible in storefront</p>
            </div>
            <button
              type="button"
              onClick={() => setActive((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${active ? 'bg-[#111827]' : 'bg-[#D1D5DB]'}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${active ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#E5E7EB] flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] transition-colors disabled:opacity-60"
          >
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-[#374151] text-sm font-medium hover:bg-[#F3F4F6] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main client component ────────────────────────────────────────────────────

interface ProductsClientProps {
  data: ProductListResponse;
  currentSearch?: string;
  currentStatus?: string;
  currentPage: number;
}

export function ProductsClient({
  data,
  currentSearch,
  currentStatus,
  currentPage,
}: ProductsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch ?? '');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { items, pagination } = data;

  const pushParams = (updates: { search?: string; status?: string; page?: string }) => {
    const params = new URLSearchParams();

    const finalSearch = 'search' in updates ? updates.search : currentSearch;
    const finalStatus = 'status' in updates ? updates.status : currentStatus;
    const finalPage = 'page' in updates ? updates.page : String(currentPage);

    if (finalSearch) params.set('search', finalSearch);
    if (finalStatus && finalStatus !== 'all') params.set('status', finalStatus);
    if (finalPage && finalPage !== '1') params.set('page', finalPage);

    const qs = params.toString();
    router.push(`/admin/products${qs ? `?${qs}` : ''}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    pushParams({ search, page: '1' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setDeletingId(id);
    const result = await deleteProductAction(id);
    setDeletingId(null);
    if (result.success === true) {
      startTransition(() => router.refresh());
    } else {
      alert(result.error);
    }
  };

  const handleModalSaved = () => {
    setShowModal(false);
    setEditProduct(null);
    startTransition(() => router.refresh());
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Products</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {pagination.totalItems} products in catalog
          </p>
        </div>
        <button
          onClick={() => {
            setEditProduct(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Total Products', value: pagination.totalItems },
          { label: 'Active (this page)', value: items.filter((p) => p.isActive).length },
          { label: 'Inactive (this page)', value: items.filter((p) => !p.isActive).length },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-[#E5E7EB] px-4 py-3">
            <p className="text-xl font-bold text-[#111827]">{stat.value}</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4 flex flex-wrap gap-3 items-center">
        <form
          onSubmit={handleSearch}
          className="flex-1 min-w-48 flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg"
        >
          <Search className="w-4 h-4 text-[#9CA3AF] shrink-0" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none placeholder:text-[#9CA3AF]"
          />
        </form>
        <select
          value={currentStatus ?? 'all'}
          onChange={(e) => pushParams({ status: e.target.value, page: '1' })}
          className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden lg:table-cell">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden md:table-cell">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {items.map((product) => (
                <tr
                  key={product.id}
                  className={`hover:bg-[#F9FAFB] transition-colors ${isPending ? 'opacity-60' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F3F4F6] to-[#E5E7EB] flex items-center justify-center shrink-0 overflow-hidden">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-10 h-10 object-cover"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-[#9CA3AF]" />
                        )}
                      </div>
                      <p className="text-sm font-medium text-[#111827]">{product.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-xs text-[#6B7280] line-clamp-2 max-w-[240px]">
                      {product.description ?? '—'}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-[#111827] whitespace-nowrap">
                    {currencySymbol(product.currency)}
                    {Number(product.basePrice).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${product.isActive ? 'text-emerald-600' : 'text-[#9CA3AF]'}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${product.isActive ? 'bg-emerald-400' : 'bg-[#D1D5DB]'}`}
                      />
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-[#6B7280]">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditProduct(product);
                          setShowModal(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827] transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-[#6B7280] hover:text-red-600 transition-colors disabled:opacity-40"
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

        {items.length === 0 && (
          <div className="py-16 text-center">
            <Package className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
            <p className="text-sm text-[#9CA3AF]">No products found</p>
          </div>
        )}

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-[#E5E7EB] flex items-center justify-between">
          <p className="text-xs text-[#6B7280]">
            Showing {items.length} of {pagination.totalItems} products
          </p>
          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1 || isPending}
                onClick={() => pushParams({ page: String(currentPage - 1) })}
                className="p-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F3F4F6] disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-[#374151] px-2">
                {currentPage} / {pagination.totalPages}
              </span>
              <button
                disabled={currentPage >= pagination.totalPages || isPending}
                onClick={() => pushParams({ page: String(currentPage + 1) })}
                className="p-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F3F4F6] disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ProductModal
          product={editProduct}
          onClose={() => {
            setShowModal(false);
            setEditProduct(null);
          }}
          onSaved={handleModalSaved}
        />
      )}
    </div>
  );
}
