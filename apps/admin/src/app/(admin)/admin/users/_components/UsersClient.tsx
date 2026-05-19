'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Eye,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Users,
} from 'lucide-react';

import { deleteUsersAction } from '../actions';
import { UserDrawer } from './UserDrawer';
import type { User, UsersListResponse } from '@/services/users.service';

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-cyan-500',
];

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-50 text-purple-700 border-purple-200',
  customer: 'bg-blue-50 text-blue-700 border-blue-200',
  wholesale: 'bg-amber-50 text-amber-700 border-amber-200',
};

function getAvatarLetters(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : fullName.slice(0, 2).toUpperCase();
}

function Avatar({ user }: { user: User }) {
  const color = AVATAR_COLORS[user.id.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div
      className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}
    >
      {getAvatarLetters(user.fullName)}
    </div>
  );
}

function getPaginationRange(current: number, total: number): number[] {
  const delta = 2;
  const start = Math.max(1, current - delta);
  const end = Math.min(total, current + delta);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export type UsersClientProps = {
  data: UsersListResponse;
  currentSearch: string;
  currentRole: string;
  currentStatus: string;
  currentPage: number;
};

export function UsersClient({
  data,
  currentSearch,
  currentRole,
  currentStatus,
  currentPage,
}: UsersClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState(currentSearch);
  const [selected, setSelected] = useState<string[]>([]);
  const [drawerUserId, setDrawerUserId] = useState<string | null>(null);
  const [isNavigating, startNavigation] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync search input when URL-driven props change (e.g. browser back/forward)
  useEffect(() => {
    setSearch(currentSearch);
  }, [currentSearch]);

  // Clear selection when page data changes
  useEffect(() => {
    setSelected([]);
  }, [data]);

  const pushUrl = (overrides: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
  }) => {
    const s = overrides.search !== undefined ? overrides.search : search;
    const r = overrides.role !== undefined ? overrides.role : currentRole;
    const st = overrides.status !== undefined ? overrides.status : currentStatus;
    const p = overrides.page !== undefined ? overrides.page : 1;

    const params = new URLSearchParams();
    if (s) params.set('search', s);
    if (r && r !== 'all') params.set('role', r);
    if (st && st !== 'all') params.set('status', st);
    if (p > 1) params.set('page', String(p));

    startNavigation(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushUrl({ search: value }), 400);
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleAll = (checked: boolean) =>
    setSelected(checked ? data.items.map((u) => u.id) : []);

  const handleBatchDelete = () => {
    startDelete(async () => {
      await deleteUsersAction(selected);
    });
  };

  const { items, pagination } = data;
  const allSelected = items.length > 0 && selected.length === items.length;
  const someSelected = selected.length > 0 && !allSelected;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Users</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {pagination.totalItems} registered users
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] transition-colors">
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-48 flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg">
          <Search className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1 text-sm outline-none text-[#111827] placeholder:text-[#9CA3AF]"
          />
          {isNavigating && <Loader2 className="w-3.5 h-3.5 text-[#9CA3AF] animate-spin flex-shrink-0" />}
        </div>

        <select
          value={currentRole}
          onChange={(e) => pushUrl({ role: e.target.value })}
          className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#374151] outline-none cursor-pointer bg-white"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="customer">Customer</option>
          <option value="wholesale">Wholesale</option>
        </select>

        <select
          value={currentStatus}
          onChange={(e) => pushUrl({ status: e.target.value })}
          className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#374151] outline-none cursor-pointer bg-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {selected.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-[#6B7280]">{selected.length} selected</span>
            <button
              onClick={handleBatchDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {isDeleting && <Loader2 className="w-3 h-3 animate-spin" />}
              Delete Selected
            </button>
            <button
              onClick={() => setSelected([])}
              className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-[#374151] text-xs font-medium hover:bg-[#F3F4F6] transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden lg:table-cell">
                  Last Login
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden lg:table-cell">
                  Joined
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {items.map((user) => (
                <tr key={user.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selected.includes(user.id)}
                      onChange={() => toggleSelect(user.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar user={user} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#111827] truncate">{user.fullName}</p>
                        <p className="text-xs text-[#9CA3AF] truncate">{user.email}</p>
                      </div>
                      {!user.emailVerified && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 flex-shrink-0">
                          unverified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${ROLE_COLORS[user.role]}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${
                        user.isActive ? 'text-emerald-600' : 'text-[#9CA3AF]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          user.isActive ? 'bg-emerald-400' : 'bg-[#D1D5DB]'
                        }`}
                      />
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-[#6B7280]">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-[#6B7280]">
                    {new Date(user.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setDrawerUserId(user.id)}
                        className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827] transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827] transition-colors"
                        title="More actions"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {items.length === 0 && (
          <div className="py-16 text-center">
            <Users className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
            <p className="text-sm text-[#9CA3AF]">No users found</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-5 py-3 border-t border-[#E5E7EB] flex items-center justify-between">
            <p className="text-xs text-[#6B7280]">
              {pagination.totalItems === 0
                ? 'No users'
                : `Showing ${(currentPage - 1) * pagination.itemsPerPage + 1}–${Math.min(
                    currentPage * pagination.itemsPerPage,
                    pagination.totalItems,
                  )} of ${pagination.totalItems} users`}
            </p>
            <div className="flex items-center gap-1">
              {getPaginationRange(currentPage, pagination.totalPages).map((p) => (
                <button
                  key={p}
                  onClick={() => pushUrl({ page: p })}
                  disabled={isNavigating}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                    p === currentPage
                      ? 'bg-[#111827] text-white'
                      : 'text-[#6B7280] hover:bg-[#F3F4F6]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {drawerUserId && (
        <UserDrawer userId={drawerUserId} onClose={() => setDrawerUserId(null)} />
      )}
    </div>
  );
}
