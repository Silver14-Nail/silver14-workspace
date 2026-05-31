'use client';

import { useTranslation } from 'react-i18next';
import { ShoppingCart, AlertTriangle, Clock, RefreshCw, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

type CartTab = 'abandoned' | 'active' | 'sessions' | 'guest';

const tabsConfig: { id: CartTab; labelKey: string }[] = [
  { id: 'abandoned', labelKey: 'tabs.abandoned' },
  { id: 'active',   labelKey: 'tabs.active'    },
  { id: 'sessions', labelKey: 'tabs.sessions'  },
  { id: 'guest',    labelKey: 'tabs.guests'    },
];

function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-20 text-center">
      <ShoppingBag className="w-8 h-8 text-[#D1D5DB] mx-auto mb-3" />
      <p className="text-sm text-[#9CA3AF]">{label}</p>
    </div>
  );
}

export default function AdminCheckoutPage() {
  const { t } = useTranslation('checkouts');
  const [activeTab, setActiveTab] = useState<CartTab>('abandoned');

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[#111827]">{t('title')}</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">{t('subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t('stats.activeCarts'),    value: '0', icon: ShoppingCart, color: 'text-blue-600',    bg: 'bg-blue-50'    },
          { label: t('stats.abandonedToday'), value: '0', icon: AlertTriangle, color: 'text-amber-600',   bg: 'bg-amber-50'   },
          { label: t('stats.sessions'),        value: '0', icon: Clock,         color: 'text-purple-600',  bg: 'bg-purple-50'  },
          { label: t('stats.recovery'),        value: '$0', icon: RefreshCw,    color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-xl font-bold text-[#111827]">{stat.value}</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabsConfig.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-[#111827] text-white'
                : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#111827]'
            }`}
          >
            {t(tab.labelKey)} (0)
          </button>
        ))}
      </div>

      {/* Content — all tabs show empty state */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-sm font-semibold text-[#111827]">{t(`tabs.${activeTab === 'guest' ? 'guests' : activeTab}`)}</h3>
        </div>
        <EmptyState label="No data available" />
      </div>
    </div>
  );
}
