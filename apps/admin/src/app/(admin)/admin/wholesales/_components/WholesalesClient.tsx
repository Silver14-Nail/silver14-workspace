'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Building2,
  Users,
  Mail,
  Award,
  Plus,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import type {
  AccountListQuery,
  AccountListResponse,
  EnquiryListQuery,
  EnquiryListResponse,
  WholesaleAccount,
  WholesaleEnquiry,
  WholesaleTier,
  WholesaleTierName,
  WholesaleStats,
  NewsletterListResponse,
} from '../types';
import { AccountDrawer } from './AccountDrawer';
import { EnquiryDrawer } from './EnquiryDrawer';
import { TierFormDrawer } from './TierFormDrawer';
import {
  listAccountsAction,
  listEnquiriesAction,
  listNewsletterAction,
  updateNewsletterAction,
} from '../actions';

// ─── Constants ────────────────────────────────────────────────────────────────

const TIER_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Bronze: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Silver: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
  Gold: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  reviewing: 'bg-blue-50 text-blue-700 border-blue-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  initialAccounts: AccountListResponse;
  initialEnquiries: EnquiryListResponse;
  initialTiers: WholesaleTier[];
  initialStats: WholesaleStats | null;
  currentTab: string;
  currentAccountQuery: AccountListQuery;
  currentEnquiryQuery: EnquiryListQuery;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WholesalesClient({
  initialAccounts,
  initialEnquiries,
  initialTiers,
  initialStats,
  currentTab,
  currentAccountQuery,
  currentEnquiryQuery,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Tab state
  const tab = currentTab as 'accounts' | 'enquiries' | 'tiers' | 'newsletter';

  // Accounts state
  const [accounts, setAccounts] = useState(initialAccounts);
  const [selectedAccount, setSelectedAccount] = useState<WholesaleAccount | null>(null);

  // Enquiries state
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [selectedEnquiry, setSelectedEnquiry] = useState<WholesaleEnquiry | null>(null);

  // Tiers state
  const [tiers, setTiers] = useState(initialTiers);
  const [selectedTier, setSelectedTier] = useState<WholesaleTier | null>(null);
  const [showCreateTier, setShowCreateTier] = useState(false);

  // Newsletter state
  const [newsletter, setNewsletter] = useState<NewsletterListResponse | null>(null);
  const [newsletterLoaded, setNewsletterLoaded] = useState(false);
  const [newsletterPage, setNewsletterPage] = useState(1);
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [newsletterPending, setNewsletterPending] = useState(false);

  // ─── URL helpers ─────────────────────────────────────────────────────────────

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === undefined || v === '') {
          next.delete(k);
        } else {
          next.set(k, v);
        }
      }
      startTransition(async () => {
        router.push(`/admin/wholesales?${next.toString()}`);
      });
    },
    [router, searchParams],
  );

  const setTab = (t: string) => updateParams({ tab: t, page: undefined });

  // ─── Account handlers ─────────────────────────────────────────────────────────

  const handleAccountSearch = (search: string) => {
    updateParams({ search: search || undefined, page: undefined });
  };

  const handleAccountFilter = (isActive: string) => {
    updateParams({ isActive: isActive || undefined, page: undefined });
  };

  const handleAccountPage = (page: number) => {
    updateParams({ page: String(page) });
  };

  const handleAccountUpdated = useCallback(async () => {
    const result = await listAccountsAction(currentAccountQuery);
    if (result.success) setAccounts(result.data);
    setSelectedAccount(null);
  }, [currentAccountQuery]);

  // ─── Enquiry handlers ─────────────────────────────────────────────────────────

  const handleEnquiryFilter = (status: string) => {
    updateParams({ status: status || undefined, page: undefined });
  };

  const handleEnquiryPage = (page: number) => {
    updateParams({ page: String(page) });
  };

  const handleEnquiryUpdated = useCallback(async () => {
    const [enqResult, accResult] = await Promise.all([
      listEnquiriesAction(currentEnquiryQuery),
      listAccountsAction(currentAccountQuery),
    ]);
    if (enqResult.success) setEnquiries(enqResult.data);
    if (accResult.success) setAccounts(accResult.data);
    setSelectedEnquiry(null);
  }, [currentEnquiryQuery, currentAccountQuery]);

  // ─── Newsletter handlers ──────────────────────────────────────────────────────

  const loadNewsletter = useCallback(async (page: number, status: string) => {
    setNewsletterPending(true);
    const result = await listNewsletterAction({
      page,
      limit: 20,
      status: status || undefined,
    });
    setNewsletterPending(false);
    if (result.success) setNewsletter(result.data);
    setNewsletterLoaded(true);
  }, []);

  const handleNewsletterTabClick = () => {
    setTab('newsletter');
    if (!newsletterLoaded) loadNewsletter(newsletterPage, newsletterStatus);
  };

  const handleNewsletterStatus = async (id: string, status: string) => {
    await updateNewsletterAction(id, { status });
    loadNewsletter(newsletterPage, newsletterStatus);
  };

  const handleNewsletterPageChange = (page: number) => {
    setNewsletterPage(page);
    loadNewsletter(page, newsletterStatus);
  };

  const handleNewsletterStatusFilter = (status: string) => {
    setNewsletterStatus(status);
    setNewsletterPage(1);
    loadNewsletter(1, status);
  };

  const stats = initialStats;

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#111827]">Wholesale Management</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          {stats
            ? `${stats.activeAccounts} active accounts · ${stats.pendingEnquiries + stats.reviewingEnquiries} pending review`
            : 'B2B wholesale customer management'}
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Total Accounts', value: stats.totalAccounts },
            { label: 'Active Accounts', value: stats.activeAccounts },
            { label: 'Pending Enquiries', value: stats.pendingEnquiries },
            { label: 'Under Review', value: stats.reviewingEnquiries },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-[#E5E7EB] px-4 py-3">
              <p className="text-xl font-bold text-[#111827]">{s.value}</p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { key: 'accounts', label: 'Accounts', icon: Building2 },
          { key: 'enquiries', label: 'Enquiries', icon: Users },
          { key: 'tiers', label: 'Tiers', icon: Award },
          { key: 'newsletter', label: 'Newsletter', icon: Mail },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              if (key === 'newsletter') {
                handleNewsletterTabClick();
              } else {
                setTab(key);
              }
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              tab === key
                ? 'bg-[#111827] text-white'
                : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#111827]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            {key === 'enquiries' &&
              stats &&
              stats.pendingEnquiries + stats.reviewingEnquiries > 0 && (
                <span className="ml-1 bg-amber-500 text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">
                  {stats.pendingEnquiries + stats.reviewingEnquiries}
                </span>
              )}
          </button>
        ))}
      </div>

      {/* Tab: Accounts */}
      {tab === 'accounts' && (
        <AccountsTab
          accounts={accounts}
          currentQuery={currentAccountQuery}
          onSearch={handleAccountSearch}
          onFilter={handleAccountFilter}
          onPageChange={handleAccountPage}
          onSelect={setSelectedAccount}
        />
      )}

      {/* Tab: Enquiries */}
      {tab === 'enquiries' && (
        <EnquiriesTab
          enquiries={enquiries}
          currentQuery={currentEnquiryQuery}
          onFilter={handleEnquiryFilter}
          onPageChange={handleEnquiryPage}
          onSelect={setSelectedEnquiry}
        />
      )}

      {/* Tab: Tiers */}
      {tab === 'tiers' && (
        <TiersTab tiers={tiers} onSelect={setSelectedTier} onAdd={() => setShowCreateTier(true)} />
      )}

      {/* Tab: Newsletter */}
      {tab === 'newsletter' && (
        <NewsletterTab
          newsletter={newsletter}
          loaded={newsletterLoaded}
          pending={newsletterPending}
          currentStatus={newsletterStatus}
          onStatusFilter={handleNewsletterStatusFilter}
          onStatusChange={handleNewsletterStatus}
          onPageChange={handleNewsletterPageChange}
        />
      )}

      {/* Drawers */}
      {selectedAccount && (
        <AccountDrawer
          account={selectedAccount}
          tiers={tiers}
          onClose={() => setSelectedAccount(null)}
          onUpdated={handleAccountUpdated}
        />
      )}

      {selectedEnquiry && (
        <EnquiryDrawer
          enquiry={selectedEnquiry}
          tiers={tiers}
          onClose={() => setSelectedEnquiry(null)}
          onUpdated={handleEnquiryUpdated}
        />
      )}

      {selectedTier && (
        <TierFormDrawer
          tier={selectedTier}
          onClose={() => setSelectedTier(null)}
          onSaved={(updated) => {
            setTiers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            setSelectedTier(null);
          }}
        />
      )}

      {showCreateTier && (
        <TierFormDrawer
          existingNames={tiers.map((t) => t.name as WholesaleTierName)}
          onClose={() => setShowCreateTier(false)}
          onSaved={(created) => {
            setTiers((prev) => [...prev, created]);
            setShowCreateTier(false);
          }}
        />
      )}
    </div>
  );
}

// ─── AccountsTab ──────────────────────────────────────────────────────────────

function AccountsTab({
  accounts,
  currentQuery,
  onSearch,
  onFilter,
  onPageChange,
  onSelect,
}: {
  accounts: AccountListResponse;
  currentQuery: AccountListQuery;
  onSearch: (s: string) => void;
  onFilter: (v: string) => void;
  onPageChange: (p: number) => void;
  onSelect: (a: WholesaleAccount) => void;
}) {
  const [searchVal, setSearchVal] = useState(currentQuery.search ?? '');

  return (
    <div>
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg">
          <Search className="w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search by business or email..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch(searchVal)}
            className="flex-1 text-sm outline-none placeholder:text-[#9CA3AF]"
          />
        </div>
        <select
          value={
            currentQuery.isActive === true ? 'true' : currentQuery.isActive === false ? 'false' : ''
          }
          onChange={(e) => onFilter(e.target.value)}
          className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button
          onClick={() => onSearch(searchVal)}
          className="px-4 py-2 bg-[#111827] text-white text-xs rounded-lg hover:bg-[#374151] transition-colors"
        >
          Search
        </button>
      </div>

      {accounts.items.length === 0 ? (
        <EmptyState icon={Building2} text="No wholesale accounts found" />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Business
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Country
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Credit
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Since
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {accounts.items.map((account) => {
                  const ts = TIER_STYLES[account.tier?.name] ?? TIER_STYLES['Bronze'];
                  return (
                    <tr
                      key={account.id}
                      className="hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                      onClick={() => onSelect(account)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#111827]">
                          {account.businessName || account.user?.fullName || '—'}
                        </p>
                        <p className="text-xs text-[#9CA3AF]">{account.user?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ts.bg} ${ts.text} ${ts.border}`}
                        >
                          {account.tier?.name ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#374151]">{account.country}</td>
                      <td className="px-4 py-3 text-[#374151]">
                        ${Number(account.creditLimit).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${account.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]'}`}
                        >
                          {account.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#9CA3AF]">
                        {account.approvedAt
                          ? new Date(account.approvedAt).toLocaleDateString()
                          : new Date(account.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination pagination={accounts.pagination} onPageChange={onPageChange} />
        </>
      )}
    </div>
  );
}

// ─── EnquiriesTab ─────────────────────────────────────────────────────────────

function EnquiriesTab({
  enquiries,
  currentQuery,
  onFilter,
  onPageChange,
  onSelect,
}: {
  enquiries: EnquiryListResponse;
  currentQuery: EnquiryListQuery;
  onFilter: (s: string) => void;
  onPageChange: (p: number) => void;
  onSelect: (e: WholesaleEnquiry) => void;
}) {
  return (
    <div>
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4 flex gap-3">
        <select
          value={currentQuery.status ?? ''}
          onChange={(e) => onFilter(e.target.value)}
          className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="reviewing">Reviewing</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {enquiries.items.length === 0 ? (
        <EmptyState icon={Users} text="No enquiries found" />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Business
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Country
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {enquiries.items.map((enq) => (
                  <tr
                    key={enq.id}
                    className="hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                    onClick={() => onSelect(enq)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#111827]">
                        {enq.firstName} {enq.lastName}
                      </p>
                      <p className="text-xs text-[#9CA3AF]">{enq.email}</p>
                    </td>
                    <td className="px-4 py-3 text-[#374151]">{enq.businessName || '—'}</td>
                    <td className="px-4 py-3 text-[#374151]">{enq.country}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[enq.status] ?? ''}`}
                      >
                        {enq.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#9CA3AF]">
                      {new Date(enq.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={enquiries.pagination} onPageChange={onPageChange} />
        </>
      )}
    </div>
  );
}

// ─── TiersTab ─────────────────────────────────────────────────────────────────

const ALL_TIER_NAMES = ['Bronze', 'Silver', 'Gold'];

function TiersTab({
  tiers,
  onSelect,
  onAdd,
}: {
  tiers: WholesaleTier[];
  onSelect: (t: WholesaleTier) => void;
  onAdd: () => void;
}) {
  const missingNames = ALL_TIER_NAMES.filter((n) => !tiers.some((t) => t.name === n));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-xs text-[#6B7280]">{tiers.length} of 3 tiers configured</p>
        {missingNames.length > 0 && (
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#111827] text-white text-xs rounded-lg hover:bg-[#374151] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Tier
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((tier) => {
          const ts = TIER_STYLES[tier.name] ?? TIER_STYLES['Bronze'];
          return (
            <div
              key={tier.id}
              className="bg-white rounded-xl border border-[#E5E7EB] p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelect(tier)}
            >
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border mb-4 ${ts.bg} ${ts.text} ${ts.border}`}
              >
                {tier.name}
              </div>
              <div className="space-y-3">
                <TierRow label="Discount" value={`${tier.discountPercent}%`} />
                {tier.maxDiscountAmount && (
                  <TierRow label="Max Discount" value={`$${tier.maxDiscountAmount}`} />
                )}
                <TierRow label="Min Monthly Qty" value={`${tier.minMonthlyQty} sets`} />
                <TierRow label="Min Order" value={`$${tier.minOrderAmount}`} />
                <TierRow label="Free Shipping" value={tier.freeShipping ? 'Yes' : 'No'} />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(tier);
                }}
                className="mt-4 w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#374151] hover:border-[#111827] transition-colors"
              >
                Edit Settings
              </button>
            </div>
          );
        })}
        {tiers.length === 0 && (
          <div className="col-span-3">
            <EmptyState icon={Award} text="No tiers configured — click Add Tier to get started" />
          </div>
        )}
      </div>
    </div>
  );
}

function TierRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-[#6B7280]">{label}</span>
      <span className="font-medium text-[#111827]">{value}</span>
    </div>
  );
}

// ─── NewsletterTab ────────────────────────────────────────────────────────────

function NewsletterTab({
  newsletter,
  loaded,
  pending,
  currentStatus,
  onStatusFilter,
  onStatusChange,
  onPageChange,
}: {
  newsletter: NewsletterListResponse | null;
  loaded: boolean;
  pending: boolean;
  currentStatus: string;
  onStatusFilter: (s: string) => void;
  onStatusChange: (id: string, status: string) => void;
  onPageChange: (p: number) => void;
}) {
  if (!loaded && pending) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] py-16 text-center">
        <p className="text-sm text-[#9CA3AF]">Loading subscribers...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4 flex gap-3">
        <select
          value={currentStatus}
          onChange={(e) => onStatusFilter(e.target.value)}
          className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
      </div>

      {!newsletter || newsletter.items.length === 0 ? (
        <EmptyState icon={Mail} text="No newsletter subscribers found" />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Source
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Subscribed
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {newsletter.items.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#F9FAFB]">
                    <td className="px-4 py-3 text-[#111827]">{sub.email}</td>
                    <td className="px-4 py-3 text-xs text-[#6B7280] capitalize">
                      {sub.source.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${sub.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]'}`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#9CA3AF]">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          onStatusChange(
                            sub.id,
                            sub.status === 'active' ? 'unsubscribed' : 'active',
                          )
                        }
                        className="text-xs px-2 py-1 border border-[#E5E7EB] rounded-lg text-[#374151] hover:border-[#111827] transition-colors"
                      >
                        {sub.status === 'active' ? 'Unsubscribe' : 'Resubscribe'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={newsletter.pagination} onPageChange={onPageChange} />
        </>
      )}
    </div>
  );
}

// ─── Shared components ────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] py-16 text-center">
      <Icon className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
      <p className="text-sm text-[#9CA3AF]">{text}</p>
    </div>
  );
}

function Pagination({
  pagination,
  onPageChange,
}: {
  pagination: { currentPage: number; totalPages: number; totalItems: number };
  onPageChange: (p: number) => void;
}) {
  if (pagination.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between text-sm">
      <p className="text-[#6B7280] text-xs">{pagination.totalItems} total</p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage <= 1}
          className="p-1.5 rounded-lg border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-3 py-1.5 text-xs text-[#374151]">
          {pagination.currentPage} / {pagination.totalPages}
        </span>
        <button
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage >= pagination.totalPages}
          className="p-1.5 rounded-lg border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
