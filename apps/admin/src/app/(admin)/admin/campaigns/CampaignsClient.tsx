'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Megaphone, Edit, Trash2, X } from 'lucide-react';
import { useAdminTheme } from '@/app/context/AdminThemeContext';
import Pagination from '../shared/Pagination';
import type { Campaign, CampaignListResponse, CampaignStatus, CreateCampaignPayload } from './types';
import {
  CAMPAIGN_PLACEMENT_LABELS as PLACEMENT_LABELS,
  CAMPAIGN_STATUS_LABELS as STATUS_LABELS,
  CAMPAIGN_TYPE_LABELS as TYPE_LABELS,
} from './types';
import { createCampaignAction, updateCampaignAction, deleteCampaignAction } from './actions';
import CampaignFormDrawer from './CampaignFormDrawer';
import ConfirmDialog from '../shared/ConfirmDialog';
import { useConfirmDialog } from '../shared/useConfirmDialog';

const STATUS_BADGE: Record<CampaignStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-green-100 text-green-700',
  scheduled: 'bg-blue-100 text-blue-700',
  expired: 'bg-amber-100 text-amber-700',
  archived: 'bg-red-100 text-red-600',
};

const STATUS_BADGE_DARK: Record<CampaignStatus, string> = {
  draft: 'bg-gray-700 text-gray-300',
  active: 'bg-green-900 text-green-300',
  scheduled: 'bg-blue-900 text-blue-300',
  expired: 'bg-amber-900 text-amber-300',
  archived: 'bg-red-900 text-red-300',
};

interface CampaignsClientProps {
  initialCampaigns: CampaignListResponse;
  currentPage: number;
  currentSearch: string;
  currentLimit: number;
  currentPlacement: string;
  currentStatus: string;
}

export function CampaignsClient({
  initialCampaigns,
  currentPage,
  currentSearch,
  currentLimit,
  currentPlacement,
  currentStatus,
}: CampaignsClientProps) {
  const router = useRouter();
  const { theme } = useAdminTheme();
  const { t } = useTranslation('campaigns');
  const [search, setSearch] = useState(currentSearch);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isPending] = useTransition();
  const { dialogProps, openDialog } = useConfirmDialog();

  const isDark = theme === 'dark';

  const buildParams = useCallback(
    (overrides: Record<string, string | number>) => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (currentPlacement) params.set('placement', currentPlacement);
      if (currentStatus) params.set('status', currentStatus);
      params.set('page', String(currentPage));
      params.set('limit', String(currentLimit));
      Object.entries(overrides).forEach(([k, v]) => {
        if (v) params.set(k, String(v));
        else params.delete(k);
      });
      return params.toString();
    },
    [search, currentPlacement, currentStatus, currentPage, currentLimit],
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      router.push(`/admin/campaigns?${buildParams({ page: 1 })}`);
    },
    [router, buildParams],
  );

  const handleDelete = useCallback(
    (id: string) => {
      openDialog({
        title: t('deleteConfirm'),
        description: 'This campaign will be permanently deleted and cannot be undone.',
        confirmLabel: 'Delete',
        onConfirm: async () => {
          const result = await deleteCampaignAction(id);
          if (!result.success) throw new Error((result as { error: string }).error);
          router.refresh();
        },
      });
    },
    [router, openDialog, t],
  );

  const { items: campaigns, pagination } = initialCampaigns;

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-[#111827]'}`}>
            {t('title')}
          </h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-[#6B7280]'}`}>
            {t('subtitle', { count: pagination.totalItems })}
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-[#111827] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#1F2937] transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('addCampaign')}
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <div
          className={`flex items-center gap-2 flex-1 max-w-xs px-3 py-2 rounded-lg border text-sm ${
            isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-[#E5E7EB]'
          }`}
        >
          <Search className="w-4 h-4 text-[#9CA3AF]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search')}
            className="bg-transparent outline-none flex-1 text-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                router.push('/admin/campaigns');
              }}
            >
              <X className="w-4 h-4 text-[#9CA3AF]" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-3 py-2 bg-[#111827] text-white rounded-lg text-sm font-medium hover:bg-[#1F2937] transition-colors"
        >
          {t('searchBtn')}
        </button>
      </form>

      {/* Table */}
      <div
        className={`rounded-xl border overflow-hidden ${
          isDark ? 'border-gray-800 bg-gray-900' : 'border-[#E5E7EB] bg-white'
        }`}
      >
        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={(page) => {
              router.push(`/admin/campaigns?${buildParams({ page })}`);
            }}
            onItemsPerPageChange={(value) => {
              router.push(`/admin/campaigns?${buildParams({ page: 1, limit: value })}`);
            }}
          />
        )}
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className={isDark ? 'bg-gray-800' : 'bg-[#F9FAFB]'}>
              {[t('table.campaign'), t('table.placement'), t('table.type'), t('table.priority'), t('table.status'), t('table.schedule'), ''].map((h) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-[#6B7280]'
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-gray-800' : 'divide-[#F3F4F6]'}`}>
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <Megaphone className="w-8 h-8 mx-auto mb-2 text-[#D1D5DB]" />
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-[#9CA3AF]'}`}>
                    {t('empty')}
                  </p>
                </td>
              </tr>
            ) : (
              campaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  className={`transition-colors ${
                    isDark ? 'hover:bg-gray-800' : 'hover:bg-[#F9FAFB]'
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] flex items-center justify-center overflow-hidden flex-shrink-0">
                        {campaign.desktopImageUrl ? (
                          <img
                            src={campaign.desktopImageUrl}
                            alt={campaign.name}
                            className="w-10 h-10 object-cover"
                          />
                        ) : (
                          <Megaphone className="w-5 h-5 text-[#9CA3AF]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-medium truncate max-w-[200px] ${
                            isDark ? 'text-white' : 'text-[#111827]'
                          }`}
                        >
                          {campaign.name}
                        </p>
                        {campaign.ctaUrl && (
                          <p className="text-xs text-[#9CA3AF] truncate max-w-[200px]">
                            {campaign.ctaUrl}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-[#374151]'}`}>
                    {PLACEMENT_LABELS[campaign.placement]}
                  </td>
                  <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-[#374151]'}`}>
                    {TYPE_LABELS[campaign.type]}
                  </td>
                  <td className={`px-4 py-3 text-sm font-medium ${isDark ? 'text-white' : 'text-[#111827]'}`}>
                    {campaign.priority}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        isDark
                          ? STATUS_BADGE_DARK[campaign.status]
                          : STATUS_BADGE[campaign.status]
                      }`}
                    >
                      {STATUS_LABELS[campaign.status]}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-xs ${isDark ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                    {campaign.startsAt || campaign.endsAt ? (
                      <div className="space-y-0.5">
                        {campaign.startsAt && (
                          <p>{t('schedule.from', { date: new Date(campaign.startsAt).toLocaleDateString() })}</p>
                        )}
                        {campaign.endsAt && (
                          <p>{t('schedule.to', { date: new Date(campaign.endsAt).toLocaleDateString() })}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-[#9CA3AF]">{t('schedule.always')}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => setEditingCampaign(campaign)}
                        className={`p-1.5 rounded hover:bg-[#F3F4F6] transition-colors ${
                          isDark
                            ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            : 'text-[#9CA3AF] hover:text-[#374151]'
                        }`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(campaign.id)}
                        disabled={isPending}
                        className={`p-1.5 rounded transition-colors disabled:opacity-40 ${
                          isDark
                            ? 'text-gray-400 hover:bg-red-900 hover:text-red-300'
                            : 'text-[#9CA3AF] hover:bg-red-50 hover:text-red-500'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Create Drawer */}
      <CampaignFormDrawer
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={async (payload) => {
          const result = await createCampaignAction(payload as CreateCampaignPayload);
          if (result.success) {
            setIsCreateOpen(false);
            router.refresh();
          }
          return result;
        }}
      />

      {/* Edit Drawer */}
      {editingCampaign && (
        <CampaignFormDrawer
          open={!!editingCampaign}
          onClose={() => setEditingCampaign(null)}
          campaign={editingCampaign}
          onSubmit={async (payload) => {
            const result = await updateCampaignAction(editingCampaign.id, payload);
            if (result.success) {
              setEditingCampaign(null);
              router.refresh();
            }
            return result;
          }}
        />
      )}

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
