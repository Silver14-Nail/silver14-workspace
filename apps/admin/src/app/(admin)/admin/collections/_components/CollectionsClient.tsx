'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Plus,
  Search,
  Star,
  ChevronLeft,
  ChevronRight,
  Package,
  Loader2,
} from 'lucide-react';
import type { Collection, CollectionListResponse, CollectionStats } from '../types';
import { CollectionFormDrawer } from './CollectionFormDrawer';
import { CollectionDetailDrawer } from './CollectionDetailDrawer';
import { listCollectionsAction } from '../actions';

interface Props {
  initialCollections: CollectionListResponse;
  initialStats: CollectionStats;
  currentPage: number;
  currentSearch: string;
}

export function CollectionsClient({
  initialCollections,
  initialStats,
  currentPage,
  currentSearch,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [collections, setCollections] = useState(initialCollections);
  const [stats, setStats] = useState(initialStats);
  const [search, setSearch] = useState(currentSearch);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [editingCollection, setEditingCollection] = useState<Collection | null | undefined>(
    undefined,
  );
  const [isPending, startTransition] = useTransition();

  const pushQuery = (params: URLSearchParams) => {
    router.push(`/admin/collections?${params.toString()}`);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    value.trim() ? params.set('search', value) : params.delete('search');
    params.delete('page');
    pushQuery(params);
  };

  const handlePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    pushQuery(params);
  };

  const refreshCollections = () => {
    startTransition(async () => {
      const result = await listCollectionsAction({
        page: currentPage,
        search: currentSearch || undefined,
      });
      if (result.success) setCollections(result.data);
    });
  };

  const handleFormSuccess = (collection: Collection) => {
    setEditingCollection(undefined);
    refreshCollections();
  };

  const handleDetailUpdate = (collection: Collection) => {
    setCollections((prev) => ({
      ...prev,
      data: prev.data.map((c) => (c.id === collection.id ? { ...c, ...collection } : c)),
    }));
    setSelectedCollection(collection);
  };

  const handleDelete = (id: string) => {
    setCollections((prev) => ({
      ...prev,
      data: prev.data.filter((c) => c.id !== id),
      meta: { ...prev.meta, total: prev.meta.total - 1 },
    }));
    setStats((prev) => ({ ...prev, total: prev.total - 1 }));
  };

  const { data, meta } = collections;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Collections</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {stats.total} total · {stats.active} active · {stats.featured} featured
          </p>
        </div>
        <button
          onClick={() => setEditingCollection(null)}
          className="flex items-center gap-2 rounded bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#1F2937]"
        >
          <Plus className="size-4" /> New Collection
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#9CA3AF]" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search collections..."
            className="w-full rounded border border-[#D1D5DB] pl-9 pr-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
          />
        </div>
        {isPending && <Loader2 className="size-5 animate-spin text-[#9CA3AF] self-center" />}
      </div>

      {/* Table */}
      <div className="rounded border border-[#E5E7EB] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                Collection
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider hidden md:table-cell">
                Slug
              </th>
              <th className="text-center px-4 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                Products
              </th>
              <th className="text-center px-4 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider hidden sm:table-cell">
                Featured
              </th>
              <th className="text-center px-4 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-[#9CA3AF]">
                  No collections found
                </td>
              </tr>
            ) : (
              data.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedCollection(c)}
                  className="cursor-pointer hover:bg-[#F9FAFB] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {c.image ? (
                        <img
                          src={c.image}
                          alt={c.name}
                          className="size-9 rounded object-cover shrink-0"
                        />
                      ) : (
                        <div className="size-9 rounded bg-[#F3F4F6] flex items-center justify-center shrink-0">
                          <Package className="size-4 text-[#D1D5DB]" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-[#111827] truncate">{c.name}</p>
                        {c.shortDescription && (
                          <p className="text-xs text-[#9CA3AF] truncate">{c.shortDescription}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="font-mono text-xs text-[#6B7280]">{c.slug}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-[#374151]">{c.productCount ?? 0}</span>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    {c.isFeatured ? (
                      <Star className="size-4 text-amber-400 mx-auto fill-amber-400" />
                    ) : (
                      <span className="text-[#D1D5DB]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        c.isActive
                          ? 'bg-green-50 text-green-700'
                          : 'bg-[#F3F4F6] text-[#6B7280]'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-[#6B7280]">
            {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of{' '}
            {meta.total}
          </p>
          <div className="flex gap-1">
            <button
              disabled={meta.page <= 1}
              onClick={() => handlePage(meta.page - 1)}
              className="rounded border border-[#D1D5DB] p-1.5 disabled:opacity-40 hover:bg-[#F9FAFB]"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              disabled={meta.page >= meta.totalPages}
              onClick={() => handlePage(meta.page + 1)}
              className="rounded border border-[#D1D5DB] p-1.5 disabled:opacity-40 hover:bg-[#F9FAFB]"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Drawers */}
      {editingCollection !== undefined && (
        <CollectionFormDrawer
          collection={editingCollection}
          onClose={() => setEditingCollection(undefined)}
          onSuccess={handleFormSuccess}
        />
      )}

      {selectedCollection && editingCollection === undefined && (
        <CollectionDetailDrawer
          collection={selectedCollection}
          onClose={() => setSelectedCollection(null)}
          onEdit={(c) => {
            setSelectedCollection(null);
            setEditingCollection(c);
          }}
          onDelete={handleDelete}
          onUpdate={handleDetailUpdate}
        />
      )}
    </div>
  );
}
