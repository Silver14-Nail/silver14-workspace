'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, X, Plus, FolderOpen } from 'lucide-react';
import type { ProductCollection } from '../../types';
import type { Collection } from '../../../collections/types';
import {
  getProductCollectionsAction,
  addProductToCollectionAction,
  removeProductFromCollectionAction,
} from '../../actions';
import { listCollectionsAction } from '../../../collections/actions';

interface Props {
  productId: string;
}

export default function ProductEditCollectionsTab({ productId }: Props) {
  const [assigned, setAssigned] = useState<ProductCollection[]>([]);
  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const [assignedResult, allResult] = await Promise.all([
      getProductCollectionsAction(productId),
      listCollectionsAction({ limit: 200 }),
    ]);

    if (!assignedResult.success) {
      setError((assignedResult as { error: string }).error);
    } else {
      setAssigned(assignedResult.data);
    }

    if (allResult.success) {
      setAllCollections(allResult.data.data);
    }

    setLoading(false);
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const assignedIds = new Set(assigned.map((c) => c.id));
  const available = allCollections.filter((c) => !assignedIds.has(c.id));

  const handleAdd = async () => {
    if (!selectedId) return;
    setAdding(true);
    setAddError('');
    const result = await addProductToCollectionAction(productId, selectedId);
    setAdding(false);
    if (result.success) {
      setSelectedId('');
      await load();
    } else {
      setAddError((result as { error: string }).error);
    }
  };

  const handleRemove = async (collectionId: string) => {
    setRemovingId(collectionId);
    const result = await removeProductFromCollectionAction(productId, collectionId);
    setRemovingId(null);
    if (result.success) {
      setAssigned((prev) => prev.filter((c) => c.id !== collectionId));
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-[#9CA3AF] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <p className="text-sm text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      {/* Add to collection */}
      <div>
        <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
          Add to collection
        </label>
        <div className="flex gap-2">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none focus:border-[#111827] transition-colors bg-white"
          >
            <option value="">Select a collection...</option>
            {available.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {!c.isActive ? ' (inactive)' : ''}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!selectedId || adding}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#111827] text-white text-xs font-medium hover:bg-[#374151] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {adding ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            Add
          </button>
        </div>
        {addError && (
          <p className="mt-1.5 text-xs text-red-500">{addError}</p>
        )}
      </div>

      {/* Assigned collections */}
      <div>
        <p className="text-xs font-semibold text-[#374151] mb-2">
          Assigned collections ({assigned.length})
        </p>

        {assigned.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FolderOpen className="w-8 h-8 text-[#D1D5DB] mb-2" />
            <p className="text-sm text-[#9CA3AF]">Not in any collection yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {assigned.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#111827] truncate">{c.name}</p>
                  <p className="text-xs text-[#9CA3AF] truncate">/{c.slug}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {!c.isActive && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F3F4F6] text-[#9CA3AF] font-medium">
                      inactive
                    </span>
                  )}
                  {c.isFeatured && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                      featured
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(c.id)}
                    disabled={removingId === c.id}
                    className="p-1 rounded hover:bg-red-50 text-[#9CA3AF] hover:text-red-500 transition-colors disabled:opacity-50"
                    title="Remove from collection"
                  >
                    {removingId === c.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <X className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
