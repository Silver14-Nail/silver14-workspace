'use client';

import { useEffect, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyRound, Loader2, Mail, Phone, ShieldCheck, ShieldOff, Trash2, X } from 'lucide-react';

import { deleteUserAction, getUserAction, toggleUserActiveAction } from '../actions';
import type { User } from '@/services/users.service';

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

type Props = {
  userId: string;
  onClose: () => void;
};

export function UserDrawer({ userId, onClose }: Props) {
  const { t } = useTranslation('users');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getUserAction(userId)
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load user details.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleToggleActive = () => {
    if (!user) return;
    startTransition(async () => {
      const updated = await toggleUserActiveAction(user.id, !user.isActive);
      setUser(updated);
    });
  };

  const handleDelete = () => {
    if (!user) return;
    startTransition(async () => {
      await deleteUserAction(user.id);
      onClose();
    });
  };

  const avatarColor = user
    ? AVATAR_COLORS[user.id.charCodeAt(0) % AVATAR_COLORS.length]
    : 'bg-gray-400';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-stretch justify-center sm:justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />

      <div className="relative w-full sm:max-w-md bg-white h-[90vh] sm:h-full shadow-2xl flex flex-col overflow-hidden rounded-t-2xl sm:rounded-none">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-sm font-semibold text-[#111827]">{t('drawer.title')}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#F3F4F6] transition-colors"
          >
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#9CA3AF] animate-spin" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex-1 flex items-center justify-center px-6">
            <p className="text-sm text-red-500 text-center">{error}</p>
          </div>
        )}

        {/* Content */}
        {!loading && user && (
          <>
            <div className="flex-1 overflow-y-auto">
              {/* Profile */}
              <div className="px-6 py-5 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white text-sm font-semibold flex-shrink-0`}
                  >
                    {getAvatarLetters(user.fullName)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#111827] truncate">{user.fullName}</p>
                    <span
                      className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium border ${ROLE_COLORS[user.role]}`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <div className="ml-auto flex-shrink-0">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        user.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      {user.isActive ? t('badge.active') : t('badge.inactive')}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Info */}
              <div className="px-6 py-4">
                <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-3">
                  {t('drawer.accountInfo')}
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6B7280]">{t('drawer.emailVerified')}</span>
                    <span
                      className={`text-xs font-medium ${
                        user.emailVerified ? 'text-emerald-600' : 'text-red-500'
                      }`}
                    >
                      {user.emailVerified ? t('drawer.verified') : t('drawer.unverified')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6B7280]">{t('drawer.memberSince')}</span>
                    <span className="text-xs font-medium text-[#374151]">
                      {new Date(user.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6B7280]">{t('drawer.lastLogin')}</span>
                    <span className="text-xs font-medium text-[#374151]">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6B7280]">{t('drawer.userId')}</span>
                    <span className="text-xs font-mono text-[#9CA3AF] truncate max-w-[180px]">
                      {user.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-[#E5E7EB] flex gap-2">
              <button
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] disabled:opacity-50 transition-colors"
              >
                <KeyRound className="w-4 h-4" />
                {t('drawer.resetPassword')}
              </button>

              <button
                onClick={handleToggleActive}
                disabled={isPending}
                title={user.isActive ? t('drawer.deactivate') : t('drawer.activate')}
                className={`px-3.5 py-2.5 rounded-lg border text-sm font-medium disabled:opacity-50 transition-colors ${
                  user.isActive
                    ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                    : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : user.isActive ? (
                  <ShieldOff className="w-4 h-4" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={handleDelete}
                disabled={isPending}
                title="Delete user"
                className="px-3.5 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 text-sm font-medium transition-colors"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
