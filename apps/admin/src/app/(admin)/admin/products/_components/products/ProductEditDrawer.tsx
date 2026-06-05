'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Loader2, Trash2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ApiProductDetail, ApiNailShape, ApiNailSize } from '../../types';
import { getProductDetailAction, updateProductAction, permanentDeleteProductAction } from '../../actions';
import ProductEditImagesTab from './ProductEditImagesTab';
import ProductEditVariantsTab from './ProductEditVariantsTab';
import ProductTranslationsTab from './ProductTranslationsTab';
import ProductEditCollectionsTab from './ProductEditCollectionsTab';

type Tab = 'info' | 'images' | 'variants' | 'translations' | 'collections';

interface ProductEditDrawerProps {
  productId: string;
  shapes: ApiNailShape[];
  sizes: ApiNailSize[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductEditDrawer({
  productId,
  shapes,
  sizes,
  onClose,
  onSuccess,
}: ProductEditDrawerProps) {
  const { t } = useTranslation('products');
  const [product, setProduct] = useState<ApiProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [tab, setTab] = useState<Tab>('info');

  // Info tab state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isNew, setIsNew] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadProduct = useCallback(async () => {
    const result = await getProductDetailAction(productId);
    if (result.success) {
      const p = result.data;
      setProduct(p);
      setName(p.name);
      setDescription(p.description ?? '');
      setBasePrice(Number(p.basePrice).toFixed(2));
      setSalePrice(p.salePrice != null ? Number(p.salePrice).toFixed(2) : '');
      setIsActive(p.isActive);
      setIsNew(p.isNew ?? false);
      setIsBestSeller(p.isBestSeller ?? false);
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
      currency: 'USD',
      isActive,
      isNew,
      isBestSeller,
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
    { key: 'info', label: t('edit.tabGeneral') },
    {
      key: 'images',
      label: product ? `${t('edit.tabImages')} (${product.images.length})` : t('edit.tabImages'),
    },
    {
      key: 'variants',
      label: product
        ? `${t('edit.tabVariants')} (${product.variants.length})`
        : t('edit.tabVariants'),
    },
    { key: 'translations', label: t('edit.tabTranslations') },
    { key: 'collections', label: 'Collections' },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed bottom-0 right-0 sm:top-0 w-full sm:w-[600px] h-[90vh] sm:h-full z-50 flex flex-col shadow-2xl bg-white rounded-t-2xl sm:rounded-none overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] shrink-0">
          <div className="min-w-0 pr-4">
            <h2 className="text-sm font-semibold text-[#111827]">{t('edit.title')}</h2>
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
        <div className="flex border-b border-[#E5E7EB] px-6 shrink-0 overflow-x-auto no-scrollbar">
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
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                {saveError && (
                  <div className="px-3 py-2.5 rounded-lg bg-red-50 text-xs text-red-600 border border-red-100">
                    {saveError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
                    {t('form.name')}
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none focus:border-[#111827] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
                    {t('form.description')}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none focus:border-[#111827] transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
                    {t('form.basePrice')} (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6B7280]">$</span>
                    <input
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none focus:border-[#111827] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
                    {t('form.salePrice')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6B7280]">$</span>
                    <input
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={t('form.salePriceHint')}
                      className={`w-full pl-7 pr-3 py-2 border rounded-lg text-sm text-[#111827] outline-none transition-colors ${
                        !salePriceValid
                          ? 'border-red-400 focus:border-red-500'
                          : 'border-[#E5E7EB] focus:border-[#111827]'
                      }`}
                    />
                  </div>
                  {!salePriceValid && (
                    <p className="mt-1 text-xs text-red-500">{t('form.salePriceError')}</p>
                  )}
                  {discountPreview != null && (
                    <p className="mt-1 text-xs text-emerald-600 font-medium">
                      {discountPreview}
                      {t('form.off')}
                    </p>
                  )}
                </div>

                <div className="rounded-lg bg-[#F9FAFB] divide-y divide-[#E5E7EB]">
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-[#374151]">{t('form.active')}</p>
                      <p className="text-xs text-[#9CA3AF]">{t('form.activeHint')}</p>
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

                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-[#374151]">{t('form.isNew')}</p>
                      <p className="text-xs text-[#9CA3AF]">{t('form.isNewHint')}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsNew((v) => !v)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        isNew ? 'bg-[#111827]' : 'bg-[#D1D5DB]'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          isNew ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-[#374151]">{t('form.isBestSeller')}</p>
                      <p className="text-xs text-[#9CA3AF]">{t('form.isBestSellerHint')}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsBestSeller((v) => !v)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        isBestSeller ? 'bg-[#111827]' : 'bg-[#D1D5DB]'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          isBestSeller ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {product && (
                  <div className="pt-2 border-t border-[#F3F4F6] space-y-2">
                    {[
                      { label: t('edit.productId'), value: product.id, mono: true },
                      {
                        label: t('edit.created'),
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

                {/* ── Danger Zone ─────────────────────────────────────── */}
                {product && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
                    <h3 className="text-xs font-semibold text-red-700 uppercase tracking-wider flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {t('edit.dangerZone')}
                    </h3>
                    <p className="text-xs text-red-600">{t('edit.permanentDeleteDesc')}</p>
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-300 bg-white text-red-600 text-xs font-medium hover:bg-red-600 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t('edit.permanentDelete')}
                    </button>
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
                productType={product.type}
                shapes={shapes}
                sizes={sizes}
              />
            )}

            {tab === 'translations' && <ProductTranslationsTab productId={productId} />}

            {tab === 'collections' && <ProductEditCollectionsTab productId={productId} />}
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
              {saving ? t('form.saving') : t('edit.save')}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] transition-colors"
            >
              {t('form.cancel')}
            </button>
          </div>
        )}
      </div>

      {/* ── Permanent Delete Modal ────────────────────────────────── */}
      {showDeleteModal && product && (
        <ProductDeleteModal
          product={product}
          isPending={deleting}
          onConfirm={async () => {
            setDeleting(true);
            const result = await permanentDeleteProductAction(productId);
            setDeleting(false);
            if (result.success) {
              setShowDeleteModal(false);
              onSuccess();
            }
          }}
          onClose={() => setShowDeleteModal(false)}
          t={t}
        />
      )}
    </>
  );
}

// ── Permanent Delete Confirmation Modal ───────────────────────────────────────

function ProductDeleteModal({
  product,
  isPending,
  onConfirm,
  onClose,
  t,
}: {
  product: ApiProductDetail;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string) => any;
}) {
  const [confirmText, setConfirmText] = useState('');
  const canDelete = confirmText === 'confirm';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-red-100 bg-red-50">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#111827]">
                {t('edit.permanentDeleteModal.title')}
              </h2>
              <p className="text-xs text-red-600 mt-0.5">
                {t('edit.permanentDeleteModal.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Product info */}
        <div className="px-6 py-4 space-y-4">
          <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
            {[
              { label: t('edit.permanentDeleteModal.productId'), value: product.id.slice(0, 8).toUpperCase(), mono: true },
              { label: t('edit.permanentDeleteModal.name'), value: product.name },
              { label: t('edit.permanentDeleteModal.type'), value: product.type },
              { label: t('edit.permanentDeleteModal.price'), value: `$${Number(product.basePrice).toFixed(2)}` },
            ].map(({ label, value, mono }) => (
              <div key={label} className="flex justify-between items-center px-4 py-2.5 border-b border-[#F3F4F6] last:border-0 bg-[#FAFAFA]">
                <span className="text-xs text-[#6B7280]">{label}</span>
                <span className={`text-xs text-[#111827] ${mono ? 'font-mono' : ''}`}>{value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center px-4 py-2.5 bg-[#FAFAFA]">
              <span className="text-xs text-[#6B7280]">{t('edit.permanentDeleteModal.status')}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${product.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                {product.isActive ? t('edit.permanentDeleteModal.active') : t('edit.permanentDeleteModal.inactive')}
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs text-[#374151] mb-2">
              {t('edit.permanentDeleteModal.confirmPrompt')}
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={t('edit.permanentDeleteModal.confirmPlaceholder')}
              autoComplete="off"
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-colors"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canDelete || isPending}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {t('edit.permanentDeleteModal.deleteBtn')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-[#374151] text-sm font-medium hover:bg-[#F3F4F6] transition-colors"
          >
            {t('edit.permanentDeleteModal.cancelBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
