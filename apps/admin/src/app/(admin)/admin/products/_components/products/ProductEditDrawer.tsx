'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { ApiProductDetail, ApiNailShape, ApiNailSize } from '../../types';
import { getProductDetailAction, updateProductAction } from '../../actions';
import ProductEditImagesTab from './ProductEditImagesTab';
import ProductEditVariantsTab from './ProductEditVariantsTab';

type Tab = 'info' | 'images' | 'variants';

interface ProductEditDrawerProps {
  productId: string;
  shapes: ApiNailShape[];
  sizes: ApiNailSize[];
  onClose: () => void;
  onSuccess: () => void;
}

const CURRENCIES = ['EUR', 'USD', 'GBP'];

export default function ProductEditDrawer({
  productId,
  shapes,
  sizes,
  onClose,
  onSuccess,
}: ProductEditDrawerProps) {
  const [product, setProduct] = useState<ApiProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [tab, setTab] = useState<Tab>('info');

  // Info tab state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const loadProduct = useCallback(async () => {
    const result = await getProductDetailAction(productId);
    if (result.success) {
      const p = result.data;
      setProduct(p);
      setName(p.name);
      setDescription(p.description ?? '');
      setBasePrice(Number(p.basePrice).toFixed(2));
      setSalePrice(p.salePrice != null ? Number(p.salePrice).toFixed(2) : '');
      setCurrency(p.currency);
      setIsActive(p.isActive);
    } else {
      setLoadError((result as { error: string }).error);
    }
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const refreshProduct = useCallback(async () => {
    const result = await getProductDetailAction(productId);
    if (result.success) setProduct(result.data);
  }, [productId]);

  const handleSaveInfo = async () => {
    if (!name.trim() || !basePrice) return;
    setSaving(true);
    setSaveError('');
    const result = await updateProductAction(productId, {
      name: name.trim(),
      description: description.trim() || undefined,
      basePrice: parseFloat(basePrice),
      salePrice: salePrice !== '' ? parseFloat(salePrice) : null,
      currency,
      isActive,
    });
    setSaving(false);
    if (result.success) {
      onSuccess();
    } else {
      setSaveError((result as { error: string }).error);
    }
  };

  const salePriceNum = salePrice !== '' ? parseFloat(salePrice) : null;
  const basePriceNum = basePrice !== '' ? parseFloat(basePrice) : 0;
  const salePriceValid =
    salePriceNum === null || (salePriceNum >= 0 && salePriceNum < basePriceNum);
  const discountPreview =
    salePriceNum != null && basePriceNum > 0 && salePriceNum < basePriceNum
      ? Math.round((1 - salePriceNum / basePriceNum) * 100)
      : null;

  const canSave = name.trim() !== '' && basePrice !== '' && basePriceNum >= 0 && salePriceValid;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'info', label: 'General Info' },
    {
      key: 'images',
      label: product ? `Images (${product.images.length})` : 'Images',
    },
    {
      key: 'variants',
      label: product ? `Variants (${product.variants.length})` : 'Variants',
    },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[600px] z-50 flex flex-col shadow-2xl bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] shrink-0">
          <div className="min-w-0 pr-4">
            <h2 className="text-sm font-semibold text-[#111827]">Edit Product</h2>
            {product && <p className="text-xs text-[#9CA3AF] mt-0.5 truncate">{product.name}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#F3F4F6] transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E5E7EB] px-6 shrink-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`py-3 mr-6 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                tab === t.key
                  ? 'border-[#111827] text-[#111827]'
                  : 'border-transparent text-[#9CA3AF] hover:text-[#374151]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#9CA3AF] animate-spin" />
          </div>
        ) : loadError ? (
          <div className="flex-1 flex items-center justify-center px-6">
            <p className="text-sm text-red-500 text-center">{loadError}</p>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            {tab === 'info' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {saveError && (
                  <div className="px-3 py-2.5 rounded-lg bg-red-50 text-xs text-red-600 border border-red-100">
                    {saveError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
                    Name *
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none focus:border-[#111827] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
                    Description <span className="font-normal text-[#9CA3AF]">(optional)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none focus:border-[#111827] transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
                      Base Price *
                    </label>
                    <input
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none focus:border-[#111827] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
                      Currency *
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none cursor-pointer focus:border-[#111827] transition-colors"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
                    Sale Price <span className="font-normal text-[#9CA3AF]">(optional)</span>
                  </label>
                  <input
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Leave empty for no sale"
                    className={`w-full px-3 py-2 border rounded-lg text-sm text-[#111827] outline-none transition-colors ${
                      !salePriceValid
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-[#E5E7EB] focus:border-[#111827]'
                    }`}
                  />
                  {!salePriceValid && (
                    <p className="mt-1 text-xs text-red-500">
                      Sale price must be less than base price
                    </p>
                  )}
                  {discountPreview != null && (
                    <p className="mt-1 text-xs text-emerald-600 font-medium">
                      {discountPreview}% off
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-[#F9FAFB]">
                  <div>
                    <p className="text-sm font-medium text-[#374151]">Active</p>
                    <p className="text-xs text-[#9CA3AF]">Visible to customers</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsActive((v) => !v)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      isActive ? 'bg-[#111827]' : 'bg-[#D1D5DB]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        isActive ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {product && (
                  <div className="pt-2 border-t border-[#F3F4F6] space-y-2">
                    {[
                      { label: 'Product ID', value: product.id, mono: true },
                      {
                        label: 'Created',
                        value: new Date(product.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }),
                        mono: false,
                      },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between text-xs">
                        <span className="text-[#9CA3AF]">{row.label}</span>
                        <span
                          className={
                            row.mono ? 'font-mono text-[#9CA3AF] text-[11px]' : 'text-[#374151]'
                          }
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'images' && product && (
              <ProductEditImagesTab
                productId={productId}
                images={product.images}
                onRefresh={refreshProduct}
              />
            )}

            {tab === 'variants' && product && (
              <ProductEditVariantsTab
                productId={productId}
                variants={product.variants}
                shapes={shapes}
                sizes={sizes}
                onRefresh={refreshProduct}
              />
            )}
          </div>
        )}

        {/* Footer (info tab only) */}
        {tab === 'info' && !loading && !loadError && (
          <div className="px-6 py-4 border-t border-[#E5E7EB] flex gap-3 shrink-0">
            <button
              onClick={handleSaveInfo}
              disabled={!canSave || saving}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </>
  );
}
