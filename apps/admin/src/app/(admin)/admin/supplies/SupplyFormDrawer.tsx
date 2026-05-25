'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAdminTheme } from '@/app/context/AdminThemeContext';
import { getProductDetailAction } from '../products/actions';
import { listSupplyVariantsAction, deleteSupplyVariantAction } from './actions';
import SupplyVariantFormDrawer from './SupplyVariantFormDrawer';
import ConfirmDialog from '../shared/ConfirmDialog';
import { useConfirmDialog } from '../shared/useConfirmDialog';
import type { Product, CreateProductPayload, UpdateProductPayload, ApiProductVariant } from '../products/types';

interface SupplyFormDrawerProps {
  open: boolean;
  onClose: () => void;
  supply?: Product | null;
  onSubmit: (
    payload: CreateProductPayload | UpdateProductPayload,
  ) => Promise<{ success: boolean; error?: string }>;
}

type Tab = 'details' | 'variants';

export default function SupplyFormDrawer({
  open,
  onClose,
  supply,
  onSubmit,
}: SupplyFormDrawerProps) {
  const { t } = useTranslation('supplies');
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';
  const isEdit = !!supply;

  const [activeTab, setActiveTab] = useState<Tab>('details');

  // ── Details fields ────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [sku, setSku] = useState('');
  const [stockQty, setStockQty] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [isNew, setIsNew] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── Variants tab state ────────────────────────────────────────────────────
  const [variants, setVariants] = useState<ApiProductVariant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [variantsError, setVariantsError] = useState('');
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ApiProductVariant | null>(null);
  const { dialogProps, openDialog } = useConfirmDialog();

  // ── Load variants ─────────────────────────────────────────────────────────
  const loadVariants = useCallback(async () => {
    if (!supply?.id) return;
    setVariantsLoading(true);
    setVariantsError('');
    const result = await listSupplyVariantsAction(supply.id);
    if (result.success) {
      setVariants(result.data);
    } else {
      setVariantsError((result as { error: string }).error);
    }
    setVariantsLoading(false);
  }, [supply?.id]);

  // ── Populate fields when drawer opens ─────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setError('');
    setActiveTab('details');

    if (supply) {
      setName(supply.name);
      setDescription(supply.description ?? '');
      setBasePrice(Number(supply.basePrice).toFixed(2));
      setSalePrice(supply.salePrice != null ? Number(supply.salePrice).toFixed(2) : '');
      setIsActive(supply.isActive);
      setIsNew(supply.isNew);
      setIsBestSeller(supply.isBestSeller);
      setSku('');
      setStockQty('0');

      setDetailLoading(true);
      getProductDetailAction(supply.id).then((result) => {
        if (result.success) {
          const variant = result.data.variants[0];
          if (variant) {
            setSku(variant.sku ?? '');
            setStockQty(String(variant.stockQty ?? 0));
          }
        }
        setDetailLoading(false);
      });

      loadVariants();
    } else {
      setName('');
      setDescription('');
      setBasePrice('');
      setSalePrice('');
      setSku('');
      setStockQty('0');
      setIsActive(true);
      setIsNew(false);
      setIsBestSeller(false);
      setVariants([]);
    }
  }, [supply, open, loadVariants]);

  if (!open) return null;

  // ── Details submit ────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const basePriceNum = parseFloat(basePrice);
    if (isNaN(basePriceNum) || basePriceNum < 0) {
      setError(t('form.basePriceError'));
      return;
    }

    const salePriceNum = salePrice ? parseFloat(salePrice) : undefined;
    if (salePrice && (isNaN(salePriceNum!) || salePriceNum! >= basePriceNum)) {
      setError(t('form.salePriceError'));
      return;
    }

    const payload: CreateProductPayload = {
      name: name.trim(),
      description: description.trim() || undefined,
      basePrice: basePriceNum,
      salePrice: salePriceNum ?? null,
      currency: 'USD',
      isActive,
      isNew,
      isBestSeller,
      type: 'supply',
      ...(sku.trim() ? { sku: sku.trim() } : {}),
      ...(stockQty ? { stockQty: parseInt(stockQty, 10) } : {}),
    };

    setLoading(true);
    try {
      const result = await onSubmit(payload);
      if (!result.success) {
        setError(result.error ?? t('form.error'));
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Variant actions ───────────────────────────────────────────────────────
  const handleDeleteVariant = (v: ApiProductVariant) => {
    const label = v.colorName ?? 'Default';
    openDialog({
      title: t('variants.deleteConfirm'),
      description: `Variant "${label}" will be permanently deleted.`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        const result = await deleteSupplyVariantAction(supply!.id, v.id);
        if (!result.success) throw new Error((result as { error: string }).error);
        await loadVariants();
      },
    });
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const inputCls = `w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[#111827] ${
    isDark
      ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'
      : 'bg-white border-[#E5E7EB] text-[#111827] placeholder:text-[#9CA3AF]'
  }`;
  const labelCls = `block text-xs font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-[#374151]'}`;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col shadow-2xl ${
          isDark ? 'bg-gray-900' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark ? 'border-gray-800' : 'border-[#E5E7EB]'
          }`}
        >
          <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-[#111827]'}`}>
            {isEdit ? t('form.editTitle') : t('form.createTitle')}
          </h2>
          <button
            onClick={onClose}
            className={`p-1.5 rounded hover:bg-[#F3F4F6] ${
              isDark ? 'hover:bg-gray-800 text-gray-400' : 'text-[#6B7280]'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs (only in edit mode) */}
        {isEdit && (
          <div
            className={`flex border-b ${isDark ? 'border-gray-800' : 'border-[#E5E7EB]'}`}
          >
            {(['details', 'variants'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
                  activeTab === tab
                    ? isDark
                      ? 'border-white text-white'
                      : 'border-[#111827] text-[#111827]'
                    : isDark
                      ? 'border-transparent text-gray-500 hover:text-gray-300'
                      : 'border-transparent text-[#9CA3AF] hover:text-[#374151]'
                }`}
              >
                {tab === 'details' ? t('form.editTitle').split(' ')[0] : t('variants.tab')}
                {tab === 'variants' && variants.length > 0 && (
                  <span
                    className={`ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                      isDark ? 'bg-gray-700 text-gray-300' : 'bg-[#F3F4F6] text-[#6B7280]'
                    }`}
                  >
                    {variants.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ── Details Tab ── */}
        {activeTab === 'details' && (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className={labelCls}>{t('form.name')} *</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('form.namePlaceholder')}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>{t('form.description')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('form.descriptionPlaceholder')}
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>{t('form.basePrice')} *</label>
                <div className="relative">
                  <span
                    className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${
                      isDark ? 'text-gray-400' : 'text-[#6B7280]'
                    }`}
                  >
                    $
                  </span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="0.00"
                    className={inputCls.replace('px-3', 'pl-7 pr-3')}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>{t('form.salePrice')}</label>
                <div className="relative">
                  <span
                    className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${
                      isDark ? 'text-gray-400' : 'text-[#6B7280]'
                    }`}
                  >
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder={t('form.salePricePlaceholder')}
                    className={inputCls.replace('px-3', 'pl-7 pr-3')}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>{t('form.sku')}</label>
                {detailLoading ? (
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-gray-400'
                        : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#9CA3AF]'
                    }`}
                  >
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <input
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. SUP-001"
                    className={inputCls}
                  />
                )}
              </div>
              <div>
                <label className={labelCls}>{t('form.stockQty')}</label>
                {detailLoading ? (
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-gray-400'
                        : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#9CA3AF]'
                    }`}
                  >
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <input
                    type="number"
                    min="0"
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                    placeholder="0"
                    className={inputCls}
                  />
                )}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { label: t('form.active'), value: isActive, set: setIsActive },
                { label: t('form.newArrival'), value: isNew, set: setIsNew },
                { label: t('form.bestSeller'), value: isBestSeller, set: setIsBestSeller },
              ].map(({ label, value, set }) => (
                <label key={label} className="flex items-center justify-between cursor-pointer">
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-[#374151]'}`}>
                    {label}
                  </span>
                  <button
                    type="button"
                    onClick={() => set(!value)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      value ? 'bg-[#111827]' : isDark ? 'bg-gray-700' : 'bg-[#E5E7EB]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        value ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </label>
              ))}
            </div>
          </form>
        )}

        {/* ── Variants Tab ── */}
        {activeTab === 'variants' && supply && (
          <div className="flex-1 overflow-y-auto p-5">
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                {t('variants.title_other', { count: variants.length })}
              </p>
              <button
                onClick={() => { setEditingVariant(null); setShowVariantForm(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] text-white text-xs font-medium hover:bg-[#374151] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('variants.add')}
              </button>
            </div>

            {variantsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-[#9CA3AF]" />
              </div>
            ) : variantsError ? (
              <p className="text-sm text-red-500 text-center py-8">{variantsError}</p>
            ) : variants.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-[#E5E7EB] rounded-xl">
                <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-[#9CA3AF]'}`}>
                  {t('variants.empty')}
                </p>
                <button
                  onClick={() => { setEditingVariant(null); setShowVariantForm(true); }}
                  className="px-4 py-2 rounded-lg bg-[#111827] text-white text-xs font-medium hover:bg-[#374151] transition-colors"
                >
                  {t('variants.addFirst')}
                </button>
              </div>
            ) : (
              <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-gray-700' : 'border-[#E5E7EB]'}`}>
                <table className="w-full text-xs">
                  <thead>
                    <tr className={isDark ? 'bg-gray-800' : 'bg-[#F9FAFB]'}>
                      {[
                        { label: t('variants.colColor'), cls: 'text-left' },
                        { label: t('variants.colSku'), cls: 'text-left' },
                        { label: t('variants.colPrice'), cls: 'text-right' },
                        { label: t('variants.colStock'), cls: 'text-right' },
                        { label: t('variants.colAvailable'), cls: 'text-center' },
                        { label: '', cls: 'text-right' },
                      ].map((h, i) => (
                        <th
                          key={i}
                          className={`px-3 py-2.5 font-semibold uppercase tracking-wider ${
                            isDark ? 'text-gray-400' : 'text-[#6B7280]'
                          } ${h.cls}`}
                        >
                          {h.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-[#F3F4F6]'}`}>
                    {variants.map((v) => (
                      <tr
                        key={v.id}
                        className={`transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-[#F9FAFB]'}`}
                      >
                        {/* Color */}
                        <td className="px-3 py-2.5">
                          {v.colorName ? (
                            <div className="flex items-center gap-2">
                              {v.colorHex && (
                                <span
                                  className="w-4 h-4 rounded-full border border-[#E5E7EB] flex-shrink-0"
                                  style={{ backgroundColor: v.colorHex }}
                                />
                              )}
                              <span className={`font-medium ${isDark ? 'text-white' : 'text-[#111827]'}`}>
                                {v.colorName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#9CA3AF]">Default</span>
                          )}
                        </td>
                        {/* SKU */}
                        <td className="px-3 py-2.5">
                          {v.sku ? (
                            <span className={`font-mono ${isDark ? 'text-gray-300' : 'text-[#374151]'}`}>
                              {v.sku}
                            </span>
                          ) : (
                            <span className="text-[#D1D5DB]">—</span>
                          )}
                        </td>
                        {/* Price */}
                        <td className="px-3 py-2.5 text-right">
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-[#111827]'}`}>
                            ${Number(v.computedPrice).toFixed(2)}
                          </span>
                        </td>
                        {/* Stock */}
                        <td className="px-3 py-2.5 text-right">
                          <span
                            className={`font-medium ${
                              v.stockQty === 0
                                ? 'text-red-500'
                                : v.stockQty < 10
                                  ? 'text-amber-500'
                                  : isDark
                                    ? 'text-gray-300'
                                    : 'text-[#374151]'
                            }`}
                          >
                            {v.stockQty}
                          </span>
                        </td>
                        {/* Available */}
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={`inline-flex items-center gap-1 font-medium ${
                              v.isAvailable ? 'text-emerald-600' : 'text-[#9CA3AF]'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                v.isAvailable ? 'bg-emerald-400' : 'bg-[#D1D5DB]'
                              }`}
                            />
                            {v.isAvailable ? t('variants.yes') : t('variants.no')}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setEditingVariant(v); setShowVariantForm(true); }}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isDark
                                  ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                  : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]'
                              }`}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteVariant(v)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isDark
                                  ? 'text-gray-400 hover:bg-red-900/40 hover:text-red-400'
                                  : 'text-[#6B7280] hover:bg-red-50 hover:text-red-600'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Footer — only on Details tab */}
        {activeTab === 'details' && (
          <div
            className={`px-6 py-4 border-t flex gap-3 ${isDark ? 'border-gray-800' : 'border-[#E5E7EB]'}`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                isDark
                  ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                  : 'border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]'
              }`}
            >
              {t('form.cancel')}
            </button>
            <button
              onClick={handleSubmit as any}
              disabled={loading || detailLoading}
              className="flex-1 px-4 py-2.5 bg-[#111827] text-white rounded-lg text-sm font-medium hover:bg-[#1F2937] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? t('form.saveChanges') : t('form.create')}
            </button>
          </div>
        )}
      </div>

      {/* Variant form sub-drawer */}
      {showVariantForm && supply && (
        <SupplyVariantFormDrawer
          supplyId={supply.id}
          variant={editingVariant ?? undefined}
          onClose={() => { setShowVariantForm(false); setEditingVariant(null); }}
          onSuccess={async () => {
            setShowVariantForm(false);
            setEditingVariant(null);
            await loadVariants();
          }}
        />
      )}

      <ConfirmDialog {...dialogProps} />
    </>
  );
}
