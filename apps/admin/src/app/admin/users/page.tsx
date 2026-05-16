'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  ShieldCheck,
  ShieldOff,
  Trash2,
  KeyRound,
  X,
  Eye,
  Users,
} from 'lucide-react';
import { mockUsers, type AdminUser } from '../../../MOCK_DATAS/mockData';

const roleColors: Record<string, string> = {
  admin: 'bg-purple-50 text-purple-700 border-purple-200',
  customer: 'bg-blue-50 text-blue-700 border-blue-200',
  wholesale: 'bg-amber-50 text-amber-700 border-amber-200',
};

function Avatar({ user }: { user: AdminUser }) {
  const initials = `${user.firstName[0]}${user.lastName[0]}`;
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-amber-500',
    'bg-emerald-500',
    'bg-cyan-500',
  ];
  const color = colors[user.id.charCodeAt(1) % colors.length];
  return (
    <div
      className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-semibold`}
    >
      {initials}
    </div>
  );
}

function UserDrawer({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const orders = [
    { id: 'o1', num: 'LUN-2026-0089', total: 76.0, status: 'delivered', date: '2026-05-10' },
    { id: 'o2', num: 'LUN-2026-0083', total: 42.0, status: 'refunded', date: '2026-04-28' },
    { id: 'o3', num: 'LUN-2026-0079', total: 35.0, status: 'delivered', date: '2026-04-10' },
  ];
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-sm font-semibold text-[#111827]">User Details</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F3F4F6]">
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* Profile */}
          <div className="px-6 py-5 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-4 mb-4">
              <Avatar user={user} />
              <div>
                <p className="text-sm font-semibold text-[#111827]">
                  {user.firstName} {user.lastName}
                </p>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${roleColors[user.role]}`}
                >
                  {user.role}
                </span>
              </div>
              <div className="ml-auto">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${user.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                >
                  {user.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                <Mail className="w-3.5 h-3.5" /> {user.email}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                <Phone className="w-3.5 h-3.5" /> {user.phone}
              </div>
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 divide-x divide-[#E5E7EB] border-b border-[#E5E7EB]">
            {[
              { label: 'Orders', value: user.orders },
              { label: 'Total Spent', value: `€${user.totalSpent.toFixed(0)}` },
              { label: 'Country', value: user.country },
            ].map((s) => (
              <div key={s.label} className="px-4 py-3 text-center">
                <p className="text-sm font-semibold text-[#111827]">{s.value}</p>
                <p className="text-xs text-[#9CA3AF]">{s.label}</p>
              </div>
            ))}
          </div>
          {/* Details */}
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-3">
              Account Info
            </h3>
            <div className="space-y-2">
              {[
                {
                  label: 'Email Verified',
                  value: user.emailVerified ? '✓ Verified' : '✗ Unverified',
                  class: user.emailVerified ? 'text-emerald-600' : 'text-red-500',
                },
                {
                  label: 'Member Since',
                  value: new Date(user.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  }),
                  class: 'text-[#374151]',
                },
                {
                  label: 'Last Login',
                  value: new Date(user.lastLogin).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  class: 'text-[#374151]',
                },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-xs text-[#6B7280]">{row.label}</span>
                  <span className={`text-xs font-medium ${row.class}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Order History */}
          <div className="px-6 py-4">
            <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-3">
              Order History
            </h3>
            <div className="space-y-2">
              {orders.slice(0, user.orders).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0"
                >
                  <div>
                    <p className="text-xs font-medium text-[#111827]">{order.num}</p>
                    <p className="text-xs text-[#9CA3AF]">{order.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#111827]">
                      €{order.total.toFixed(2)}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
              {user.orders === 0 && <p className="text-xs text-[#9CA3AF] py-2">No orders yet</p>}
            </div>
          </div>
        </div>
        {/* Actions */}
        <div className="px-6 py-4 border-t border-[#E5E7EB] flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] transition-colors">
            <KeyRound className="w-4 h-4" /> Reset Password
          </button>
          <button
            className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${user.active ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}
          >
            {user.active ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          </button>
          <button className="px-4 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = mockUsers.filter((u) => {
    const matchSearch =
      search === '' ||
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus =
      statusFilter === 'all' || (statusFilter === 'active' ? u.active : !u.active);
    return matchSearch && matchRole && matchStatus;
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Users</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">{mockUsers.length} registered users</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] transition-colors">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-48 flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg">
          <Search className="w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none text-[#111827] placeholder:text-[#9CA3AF]"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#374151] outline-none cursor-pointer"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="customer">Customer</option>
          <option value="wholesale">Wholesale</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#374151] outline-none cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {selected.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-[#6B7280]">{selected.length} selected</span>
            <button className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50">
              Delete Selected
            </button>
            <button
              className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-[#374151] text-xs font-medium hover:bg-[#F3F4F6]"
              onClick={() => setSelected([])}
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
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    className="rounded"
                    onChange={(e) => setSelected(e.target.checked ? filtered.map((u) => u.id) : [])}
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden md:table-cell">
                  Orders
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
              {filtered.map((user) => (
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
                      <div>
                        <p className="text-sm font-medium text-[#111827]">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-[#9CA3AF]">{user.email}</p>
                      </div>
                      {!user.emailVerified && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200">
                          unverified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleColors[user.role]}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${user.active ? 'text-emerald-600' : 'text-[#9CA3AF]'}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-emerald-400' : 'bg-[#D1D5DB]'}`}
                      />
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm text-[#374151]">
                    {user.orders}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-[#6B7280]">
                    {new Date(user.lastLogin).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
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
                        onClick={() => setSelectedUser(user)}
                        className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827] transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827] transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
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
            <Users className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
            <p className="text-sm text-[#9CA3AF]">No users found</p>
          </div>
        )}
        {/* Pagination */}
        <div className="px-5 py-3 border-t border-[#E5E7EB] flex items-center justify-between">
          <p className="text-xs text-[#6B7280]">
            Showing {filtered.length} of {mockUsers.length} users
          </p>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${p === 1 ? 'bg-[#111827] text-white' : 'text-[#6B7280] hover:bg-[#F3F4F6]'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedUser && <UserDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
}
