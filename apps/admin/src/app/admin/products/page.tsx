'use client';

import { useState } from 'react';
import { Search, Plus, Package, Edit, Trash2, X, Upload } from 'lucide-react';
import { mockProducts, type AdminProduct } from '../../../MOCK_DATAS/mockData';

const categoryColors: Record<string, string> = {
  'Gel Press-On': 'bg-purple-50 text-purple-700 border-purple-200',
  'Matte Press-On': 'bg-slate-50 text-slate-700 border-slate-200',
  'Classic Press-On': 'bg-blue-50 text-blue-700 border-blue-200',
  'XXL Press-On': 'bg-rose-50 text-rose-700 border-rose-200',
  'Almond Press-On': 'bg-amber-50 text-amber-700 border-amber-200',
  Custom: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function ProductModal({ product, onClose }: { product: AdminProduct | null; onClose: () => void }) {
  const isEdit = product !== null;
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.basePrice.toString() || '');
  const [category, setCategory] = useState(product?.category || 'Gel Press-On');
  const [active, setActive] = useState(product?.active ?? true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-sm font-semibold text-[#111827]">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F3F4F6]">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Image Upload */}
          <div className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-8 text-center hover:border-[#9CA3AF] transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
            <p className="text-sm text-[#6B7280]">
              Drag & drop images or <span className="text-[#635BFF] underline">browse</span>
            </p>
            <p className="text-xs text-[#9CA3AF] mt-1">PNG, JPG up to 10MB each</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Product Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827] transition-colors"
                placeholder="e.g. Crystal Aurora Set"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Base Price (€)
              </label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827] transition-colors"
                placeholder="38.00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827] cursor-pointer"
              >
                {[
                  'Gel Press-On',
                  'Matte Press-On',
                  'Classic Press-On',
                  'XXL Press-On',
                  'Almond Press-On',
                  'Custom',
                ].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">SKU</label>
              <input
                defaultValue={product?.sku}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827] transition-colors"
                placeholder="LUN-XX-001"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Initial Stock
              </label>
              <input
                defaultValue={product?.stock}
                type="number"
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827] transition-colors"
                placeholder="100"
              />
            </div>
          </div>

          {/* Nail Shapes */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-2">Nail Shapes</label>
            <div className="grid grid-cols-3 gap-2">
              {['Almond', 'Coffin', 'Square', 'Oval', 'Stiletto', 'Ballerina'].map((shape) => (
                <label
                  key={shape}
                  className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg cursor-pointer hover:border-[#111827] transition-colors"
                >
                  <input
                    type="checkbox"
                    defaultChecked={shape === 'Almond' || shape === 'Coffin'}
                    className="rounded"
                  />
                  <span className="text-xs text-[#374151]">{shape}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Size Tiers */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-2">
              Size Kit Options
            </label>
            <div className="space-y-2">
              {[
                { kit: 'XS Kit', sizes: 'Fingers: 0,0,1,1,2' },
                { kit: 'S Kit', sizes: 'Fingers: 1,1,2,2,3' },
                { kit: 'M Kit', sizes: 'Fingers: 2,2,3,3,4' },
                { kit: 'L Kit', sizes: 'Fingers: 3,3,4,4,5' },
                { kit: 'Custom', sizes: 'Measurement per finger' },
              ].map((kit) => (
                <label
                  key={kit.kit}
                  className="flex items-center justify-between px-3 py-2 border border-[#E5E7EB] rounded-lg cursor-pointer hover:border-[#111827] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-xs font-medium text-[#374151]">{kit.kit}</span>
                  </div>
                  <span className="text-xs text-[#9CA3AF]">{kit.sizes}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg">
            <div>
              <p className="text-sm font-medium text-[#374151]">Product Active</p>
              <p className="text-xs text-[#9CA3AF]">Visible in storefront</p>
            </div>
            <button
              onClick={() => setActive(!active)}
              className={`relative w-11 h-6 rounded-full transition-colors ${active ? 'bg-[#111827]' : 'bg-[#D1D5DB]'}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${active ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </button>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#E5E7EB] flex gap-3">
          <button className="flex-1 px-4 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] transition-colors">
            {isEdit ? 'Save Changes' : 'Create Product'}
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

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null);

  const filtered = mockProducts.filter((p) => {
    const matchSearch =
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchStatus =
      statusFilter === 'all' || (statusFilter === 'active' ? p.active : !p.active);
    return matchSearch && matchCat && matchStatus;
  });

  const categories = [...new Set(mockProducts.map((p) => p.category))];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Products</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">{mockProducts.length} products in catalog</p>
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
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Products', value: mockProducts.length },
          { label: 'Active', value: mockProducts.filter((p) => p.active).length },
          { label: 'Low Stock (< 20)', value: mockProducts.filter((p) => p.stock < 20).length },
          { label: 'Out of Stock', value: mockProducts.filter((p) => p.stock === 0).length },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-[#E5E7EB] px-4 py-3">
            <p className="text-xl font-bold text-[#111827]">{stat.value}</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-48 flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg">
          <Search className="w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none placeholder:text-[#9CA3AF]"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none cursor-pointer"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
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
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden md:table-cell">
                  Sales
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden lg:table-cell">
                  Variants
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F3F4F6] to-[#E5E7EB] flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-[#9CA3AF]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#111827]">{product.name}</p>
                        <p className="text-xs text-[#9CA3AF]">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryColors[product.category] || 'bg-gray-50 text-gray-700 border-gray-200'}`}
                    >
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-[#111827]">
                    €{product.basePrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${product.stock === 0 ? 'bg-red-500' : product.stock < 20 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                          style={{ width: `${Math.min(100, (product.stock / 200) * 100)}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ${product.stock === 0 ? 'text-red-600' : product.stock < 20 ? 'text-amber-600' : 'text-[#374151]'}`}
                      >
                        {product.stock}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm text-[#374151]">
                    {product.sales}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm text-[#374151]">
                    {product.variantsCount}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${product.active ? 'text-emerald-600' : 'text-[#9CA3AF]'}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${product.active ? 'bg-emerald-400' : 'bg-[#D1D5DB]'}`}
                      />
                      {product.active ? 'Active' : 'Inactive'}
                    </span>
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
                      <button className="p-1.5 rounded-lg hover:bg-red-50 text-[#6B7280] hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Package className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
            <p className="text-sm text-[#9CA3AF]">No products found</p>
          </div>
        )}
        <div className="px-5 py-3 border-t border-[#E5E7EB] flex items-center justify-between">
          <p className="text-xs text-[#6B7280]">
            Showing {filtered.length} of {mockProducts.length} products
          </p>
          <div className="flex items-center gap-1">
            {[1].map((p) => (
              <button
                key={p}
                className="w-7 h-7 rounded-lg text-xs font-medium bg-[#111827] text-white"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <ProductModal
          product={editProduct}
          onClose={() => {
            setShowModal(false);
            setEditProduct(null);
          }}
        />
      )}
    </div>
  );
}
