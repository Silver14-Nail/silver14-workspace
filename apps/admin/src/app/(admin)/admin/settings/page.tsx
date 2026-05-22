'use client';

import { useState } from 'react';
import {
  Store,
  CreditCard,
  Truck,
  Calculator,
  Globe,
  Bell,
  Shield,
  Mail,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';

const settingsTabs = [
  { id: 'store', label: 'Store', icon: Store },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'tax', label: 'Tax', icon: Calculator },
  { id: 'currency', label: 'Currency', icon: Globe },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'auth', label: 'Auth Providers', icon: Shield },
  { id: 'email', label: 'Email Templates', icon: Mail },
] as const;

type SettingsTab = (typeof settingsTabs)[number]['id'];

function Toggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors ${on ? 'bg-[#111827]' : 'bg-[#D1D5DB]'}`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-[#F3F4F6] last:border-0">
      <div className="flex-1 mr-8">
        <p className="text-sm font-medium text-[#111827]">{label}</p>
        {description && <p className="text-xs text-[#9CA3AF] mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function ApiKeyField({ label, value }: { label: string; value: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-semibold text-[#374151] mb-1.5">{label}</label>
      <div className="flex gap-2">
        <div className="flex-1 flex items-center px-3 py-2 border border-[#E5E7EB] rounded-lg bg-[#F9FAFB]">
          <input
            type={show ? 'text' : 'password'}
            defaultValue={value}
            className="flex-1 bg-transparent text-sm font-mono text-[#374151] outline-none"
          />
          <button onClick={() => setShow(!show)} className="text-[#9CA3AF] hover:text-[#374151]">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <button className="px-3 py-2 rounded-lg border border-[#E5E7EB] text-xs text-[#374151] hover:bg-[#F3F4F6]">
          Rotate
        </button>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('store');

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Settings</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Configure your store and integrations</p>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Sidebar nav */}
        <div className="w-48 flex-shrink-0">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-2 space-y-0.5">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-colors ${activeTab === tab.id ? 'bg-[#111827] text-white' : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]'}`}
              >
                <tab.icon className="w-4 h-4 flex-shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl border border-[#E5E7EB]">
          {/* Store Settings */}
          {activeTab === 'store' && (
            <div className="p-6">
              <h2 className="text-sm font-semibold text-[#111827] mb-5">Store Settings</h2>
              <div className="space-y-0">
                <SettingRow label="Store Name" description="Your brand name shown to customers">
                  <input
                    defaultValue="LUNELLE"
                    className="w-48 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
                  />
                </SettingRow>
                <SettingRow label="Store Email" description="Primary contact email">
                  <input
                    defaultValue="hello@lunelle.com"
                    className="w-48 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
                  />
                </SettingRow>
                <SettingRow label="Store URL" description="Your public storefront URL">
                  <input
                    defaultValue="https://lunelle.com"
                    className="w-48 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
                  />
                </SettingRow>
                <SettingRow label="Country" description="Store's primary country">
                  <select className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none cursor-pointer">
                    <option>France</option>
                    <option>Germany</option>
                    <option>UK</option>
                  </select>
                </SettingRow>
                <SettingRow label="Store Active" description="Enable or disable the storefront">
                  <Toggle defaultChecked={true} />
                </SettingRow>
                <SettingRow
                  label="Maintenance Mode"
                  description="Show maintenance page to visitors"
                >
                  <Toggle defaultChecked={false} />
                </SettingRow>
                <SettingRow
                  label="GDPR Cookie Banner"
                  description="Show GDPR consent banner to EU visitors"
                >
                  <Toggle defaultChecked={true} />
                </SettingRow>
              </div>
              <div className="mt-6 pt-5 border-t border-[#E5E7EB]">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] transition-colors">
                  <Save className="w-4 h-4" /> Save Store Settings
                </button>
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <div className="p-6">
              <h2 className="text-sm font-semibold text-[#111827] mb-5">Payment Settings</h2>
              <div className="space-y-6">
                {/* Stripe */}
                <div className="p-4 border border-[#E5E7EB] rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl">
                        ⚡
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">Stripe</p>
                        <p className="text-xs text-[#6B7280]">Card payments & SEPA</p>
                      </div>
                    </div>
                    <Toggle defaultChecked={true} />
                  </div>
                  <div className="space-y-3">
                    <ApiKeyField label="Publishable Key" value="pk_live_51PkA2B2eZvKYlo2C..." />
                    <ApiKeyField label="Secret Key" value="sk_live_51PkA2B2eZvKYlo2C..." />
                    <ApiKeyField label="Webhook Secret" value="whsec_K2B2eZvKYlo2C..." />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Live Mode
                    </span>
                    <span className="text-xs text-[#6B7280]">Connected · Last webhook 2m ago</span>
                  </div>
                </div>

                {/* PayPal */}
                <div className="p-4 border border-[#E5E7EB] rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">
                        🅿
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">PayPal</p>
                        <p className="text-xs text-[#6B7280]">PayPal & Pay Later</p>
                      </div>
                    </div>
                    <Toggle defaultChecked={true} />
                  </div>
                  <div className="space-y-3">
                    <ApiKeyField label="Client ID" value="AY7vIBiGLRQVhONpKJ..." />
                    <ApiKeyField label="Client Secret" value="EJb4K9x1ZvUO3mQp..." />
                  </div>
                </div>

                {/* Braintree */}
                <div className="p-4 border border-[#E5E7EB] rounded-xl opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl">
                        🌿
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">Braintree</p>
                        <p className="text-xs text-[#6B7280]">Alternative payments</p>
                      </div>
                    </div>
                    <Toggle defaultChecked={false} />
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-5 border-t border-[#E5E7EB]">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] transition-colors">
                  <Save className="w-4 h-4" /> Save Payment Settings
                </button>
              </div>
            </div>
          )}

          {/* Shipping Settings */}
          {activeTab === 'shipping' && (
            <div className="p-6">
              <h2 className="text-sm font-semibold text-[#111827] mb-5">Shipping Settings</h2>
              <div className="space-y-0">
                <SettingRow
                  label="Free Shipping Threshold"
                  description="Order amount for free shipping"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-[#6B7280]">$</span>
                    <input
                      type="number"
                      defaultValue="70"
                      className="w-24 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
                    />
                  </div>
                </SettingRow>
                <SettingRow label="Default Shipping Cost" description="Standard EU shipping">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-[#6B7280]">$</span>
                    <input
                      type="number"
                      defaultValue="5.90"
                      className="w-24 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
                    />
                  </div>
                </SettingRow>
                <SettingRow label="Express Shipping Cost" description="DHL Express premium">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-[#6B7280]">$</span>
                    <input
                      type="number"
                      defaultValue="12.90"
                      className="w-24 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
                    />
                  </div>
                </SettingRow>
                <SettingRow label="Processing Time" description="Business days before dispatch">
                  <select className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none cursor-pointer">
                    <option>1-2 business days</option>
                    <option>2-3 business days</option>
                    <option>3-5 business days</option>
                  </select>
                </SettingRow>
                <SettingRow label="Ship to EU Only" description="Restrict shipping to EU countries">
                  <Toggle defaultChecked={false} />
                </SettingRow>
                <SettingRow
                  label="Track All Shipments"
                  description="Auto-request tracking from carriers"
                >
                  <Toggle defaultChecked={true} />
                </SettingRow>
              </div>
              <div className="mt-6 pt-5 border-t border-[#E5E7EB]">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] transition-colors">
                  <Save className="w-4 h-4" /> Save Shipping Settings
                </button>
              </div>
            </div>
          )}

          {/* Tax Settings */}
          {activeTab === 'tax' && (
            <div className="p-6">
              <h2 className="text-sm font-semibold text-[#111827] mb-5">Tax Settings</h2>
              <div className="space-y-0">
                <SettingRow label="Prices Include VAT" description="Show prices inclusive of VAT">
                  <Toggle defaultChecked={true} />
                </SettingRow>
                <SettingRow label="Default VAT Rate" description="Standard EU VAT rate">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      defaultValue="20"
                      className="w-20 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
                    />
                    <span className="text-sm text-[#6B7280]">%</span>
                  </div>
                </SettingRow>
                <SettingRow label="VAT Number (FR)" description="French VAT registration number">
                  <input
                    defaultValue="FR12345678901"
                    className="w-48 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827] font-mono"
                  />
                </SettingRow>
                <SettingRow
                  label="OSS Registration"
                  description="One Stop Shop EU VAT registration"
                >
                  <Toggle defaultChecked={true} />
                </SettingRow>
                <SettingRow
                  label="Auto-calculate VAT"
                  description="Auto-apply VAT based on customer country"
                >
                  <Toggle defaultChecked={true} />
                </SettingRow>
              </div>
              <div className="mt-6">
                <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-3">
                  Country-specific VAT Rates
                </h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB]">
                      {['Country', 'Rate', 'Status'].map((h) => (
                        <th key={h} className="pb-2 text-left text-xs font-semibold text-[#6B7280]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {[
                      { country: 'France (FR)', rate: '20%', active: true },
                      { country: 'Germany (DE)', rate: '19%', active: true },
                      { country: 'UK (GB)', rate: '20%', active: true },
                      { country: 'Italy (IT)', rate: '22%', active: true },
                    ].map((r) => (
                      <tr key={r.country} className="py-2">
                        <td className="py-2 text-xs text-[#374151]">{r.country}</td>
                        <td className="py-2 text-xs font-medium text-[#111827]">{r.rate}</td>
                        <td className="py-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${r.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
                          >
                            {r.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 pt-5 border-t border-[#E5E7EB]">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] transition-colors">
                  <Save className="w-4 h-4" /> Save Tax Settings
                </button>
              </div>
            </div>
          )}

          {/* Currency */}
          {activeTab === 'currency' && (
            <div className="p-6">
              <h2 className="text-sm font-semibold text-[#111827] mb-5">Currency Settings</h2>
              <div className="space-y-0">
                <SettingRow label="Base Currency" description="Your store's primary currency">
                  <select className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none cursor-pointer">
                    <option>EUR (€) — Euro</option>
                    <option>GBP (£) — British Pound</option>
                    <option>USD ($) — US Dollar</option>
                  </select>
                </SettingRow>
                <SettingRow
                  label="Auto-convert Prices"
                  description="Show prices in visitor's currency"
                >
                  <Toggle defaultChecked={false} />
                </SettingRow>
                <SettingRow label="Decimal Separator" description="Format: 38.00 or 38,00">
                  <select className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none cursor-pointer">
                    <option>. (Period)</option>
                    <option>, (Comma)</option>
                  </select>
                </SettingRow>
                <SettingRow
                  label="Currency Position"
                  description="Symbol placement in price display"
                >
                  <select className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none cursor-pointer">
                    <option>Before (€38.00)</option>
                    <option>After (38.00€)</option>
                  </select>
                </SettingRow>
              </div>
              <div className="mt-6 pt-5 border-t border-[#E5E7EB]">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] transition-colors">
                  <Save className="w-4 h-4" /> Save Currency Settings
                </button>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="p-6">
              <h2 className="text-sm font-semibold text-[#111827] mb-5">Notification Settings</h2>
              <div className="space-y-0">
                {[
                  { label: 'New Order', desc: 'Notify when a new order is placed' },
                  { label: 'Payment Failed', desc: 'Notify on payment failure' },
                  { label: 'Low Stock Alert', desc: 'Notify when product stock is low' },
                  { label: 'Wholesale Enquiry', desc: 'Notify on new wholesale application' },
                  { label: 'Refund Request', desc: 'Notify when refund is requested' },
                  { label: 'Order Delivered', desc: 'Notify when order is delivered' },
                  { label: 'Newsletter Unsubscribe', desc: 'Notify on subscriber opt-out' },
                ].map((n) => (
                  <SettingRow key={n.label} label={n.label} description={n.desc}>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#9CA3AF]">Email</span>
                      <Toggle defaultChecked={true} />
                    </div>
                  </SettingRow>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                  Notification Email
                </label>
                <input
                  defaultValue="admin@lunelle.com"
                  className="w-full max-w-sm px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
                />
              </div>
              <div className="mt-6 pt-5 border-t border-[#E5E7EB]">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] transition-colors">
                  <Save className="w-4 h-4" /> Save Notification Settings
                </button>
              </div>
            </div>
          )}

          {/* Auth Providers */}
          {activeTab === 'auth' && (
            <div className="p-6">
              <h2 className="text-sm font-semibold text-[#111827] mb-5">Auth Providers</h2>
              <div className="space-y-3">
                {[
                  { name: 'Google', icon: '🔵', enabled: true, key: 'AIzaSy...' },
                  { name: 'Facebook', icon: '📘', enabled: true, key: '48732987...' },
                  { name: 'Apple', icon: '🍎', enabled: false, key: '' },
                  { name: 'TikTok', icon: '🎵', enabled: false, key: '' },
                ].map((p) => (
                  <div key={p.name} className="p-4 border border-[#E5E7EB] rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{p.icon}</span>
                        <div>
                          <p className="text-sm font-semibold text-[#111827]">{p.name}</p>
                          <p className="text-xs text-[#9CA3AF]">Social login via {p.name}</p>
                        </div>
                      </div>
                      <Toggle defaultChecked={p.enabled} />
                    </div>
                    {p.enabled && (
                      <ApiKeyField label="Client ID / App ID" value={p.key + 'xxxxxxxxxxxxxxxx'} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email Templates */}
          {activeTab === 'email' && (
            <div className="p-6">
              <h2 className="text-sm font-semibold text-[#111827] mb-5">Email Templates</h2>
              <div className="space-y-2">
                {[
                  { name: 'Order Confirmation', status: 'Active', lastEdited: '2026-03-15' },
                  { name: 'Shipping Notification', status: 'Active', lastEdited: '2026-03-15' },
                  { name: 'Order Delivered', status: 'Active', lastEdited: '2026-02-20' },
                  { name: 'Password Reset', status: 'Active', lastEdited: '2026-01-10' },
                  { name: 'Welcome Email', status: 'Active', lastEdited: '2026-01-10' },
                  { name: 'Newsletter Signup', status: 'Active', lastEdited: '2025-12-01' },
                  { name: 'Abandoned Cart Recovery', status: 'Draft', lastEdited: '2026-05-01' },
                  { name: 'Wholesale Approved', status: 'Active', lastEdited: '2026-01-20' },
                  { name: 'Refund Processed', status: 'Active', lastEdited: '2026-02-05' },
                ].map((t) => (
                  <div
                    key={t.name}
                    className="flex items-center justify-between p-3 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#111827]">{t.name}</p>
                      <p className="text-xs text-[#9CA3AF]">Last edited {t.lastEdited}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${t.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                      >
                        {t.status}
                      </span>
                      <button className="text-xs text-[#635BFF] hover:underline">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
