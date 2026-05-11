'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BadgePercent,
  Boxes,
  ChartNoAxesColumnIncreasing,
  CircleDollarSign,
  FolderTree,
  LayoutDashboard,
  Menu,
  PackageCheck,
  Settings,
  ShieldUser,
  Truck,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { navItems } from './admin.data';
import { useAdminAuth } from './auth/admin-auth-provider';
import { supportedAdminLocales } from './i18n/messages';
import { useAdminTranslation } from './i18n/admin-i18n-provider';
import type { Metric, TableRow, Tone } from './admin.types';

const toneStyles: Record<Tone, string> = {
  neutral: 'border-neutral-200 bg-neutral-100 text-neutral-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border-rose-200 bg-rose-50 text-rose-700',
  info: 'border-sky-200 bg-sky-50 text-sky-700',
};

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'silver14-admin-sidebar-collapsed';

let cachedSidebarCollapsed: boolean | null = null;

const navIconByHref = {
  '/': LayoutDashboard,
  '/admins': ShieldUser,
  '/collections': FolderTree,
  '/currency': CircleDollarSign,
  '/customers': Users,
  '/discounts': BadgePercent,
  '/orders': PackageCheck,
  '/products': Boxes,
  '/settings': Settings,
  '/shipping': Truck,
  '/wholesale': ChartNoAxesColumnIncreasing,
} as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const { locale, setLocale, t } = useAdminTranslation();
  const { logout, status, user } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => getInitialSidebarCollapsed());
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [router, status]);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  const toggleSidebar = () => {
    setSidebarCollapsed((collapsed) => {
      const nextCollapsed = !collapsed;

      cachedSidebarCollapsed = nextCollapsed;
      window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(nextCollapsed));

      return nextCollapsed;
    });
  };

  if (status !== 'authenticated') {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f6f3] text-sm text-neutral-500">
        {t('auth.checkingSession')}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f6f3] text-neutral-950">
      <div
        className={`grid min-h-screen transition-[grid-template-columns] duration-200 ${
          sidebarCollapsed ? 'lg:grid-cols-[84px_1fr]' : 'lg:grid-cols-[280px_1fr]'
        }`}
      >
        <aside className="hidden border-r border-neutral-200 bg-white lg:block">
          <div className={`border-b border-neutral-200 py-6 ${sidebarCollapsed ? 'px-3' : 'px-6'}`}>
            <div
              className={`flex items-start gap-3 ${
                sidebarCollapsed ? 'justify-center' : 'justify-between'
              }`}
            >
              {!sidebarCollapsed ? (
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                    {t('common.brand')}
                  </p>
                  <h1 className="mt-2 text-xl font-semibold tracking-tight">
                    {t('common.adminConsole')}
                  </h1>
                </div>
              ) : null}
              <button
                aria-label={sidebarCollapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
                className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-sm font-medium text-neutral-600 hover:border-neutral-400 hover:text-neutral-950"
                onClick={toggleSidebar}
                type="button"
              >
                {sidebarCollapsed ? '>' : '<'}
              </button>
            </div>
          </div>
          <nav className="grid gap-1 px-3 py-4">
            {navItems.map((item) => (
              <AdminNavItem
                collapsed={sidebarCollapsed}
                description={t(item.descriptionKey)}
                href={item.href}
                key={item.href}
                label={t(item.labelKey)}
                pathname={pathname}
              />
            ))}
          </nav>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 px-5 py-4 backdrop-blur md:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <button
                  aria-label={t('nav.expandSidebar')}
                  className="grid size-10 place-items-center rounded-md border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 lg:hidden"
                  onClick={() => setMobileSidebarOpen(true)}
                  type="button"
                >
                  <Menu className="size-5" />
                </button>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                    {t('common.cmsAdmin')}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                    {t('common.operationsDashboard')}
                  </h2>
                </div>
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-2 md:justify-end">
                <span className="max-w-full truncate rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600">
                  {user?.email}
                </span>
                <label className="flex items-center gap-2 text-sm font-medium text-neutral-600">
                  {t('common.language')}
                  <select
                    className="rounded-md border border-neutral-300 bg-white px-2 py-2 text-sm font-normal text-neutral-950"
                    onChange={(event) => setLocale(event.target.value as typeof locale)}
                    value={locale}
                  >
                    {supportedAdminLocales.map((option) => (
                      <option key={option} value={option}>
                        {option === 'en' ? t('common.english') : t('common.vietnamese')}
                      </option>
                    ))}
                  </select>
                </label>
                <Link
                  className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:border-neutral-500 max-sm:flex-1 max-sm:text-center"
                  href="/orders"
                >
                  {t('common.reviewOrders')}
                </Link>
                <Link
                  className="rounded-md bg-neutral-950 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 max-sm:flex-1 max-sm:text-center"
                  href="/products"
                >
                  {t('common.newProduct')}
                </Link>
                <button
                  className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:border-neutral-500 max-sm:flex-1"
                  onClick={() => {
                    logout();
                    router.replace('/login');
                  }}
                  type="button"
                >
                  {t('auth.signOut')}
                </button>
              </div>
            </div>
          </header>

          <div className="grid gap-5 px-4 py-5 sm:px-5 md:px-8">{children}</div>
        </section>
      </div>

      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation overlay"
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileSidebarOpen(false)}
            type="button"
          />
          <aside className="absolute left-0 top-0 flex h-full w-80 max-w-[86vw] flex-col border-r border-neutral-200 bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                  {t('common.brand')}
                </p>
                <h1 className="mt-2 text-xl font-semibold tracking-tight">
                  {t('common.adminConsole')}
                </h1>
              </div>
              <button
                aria-label="Close navigation"
                className="grid size-9 place-items-center rounded-md border border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-950"
                onClick={() => setMobileSidebarOpen(false)}
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>
            <nav className="grid gap-1 overflow-y-auto px-3 py-4">
              {navItems.map((item) => (
                <AdminNavItem
                  collapsed={false}
                  description={t(item.descriptionKey)}
                  href={item.href}
                  key={item.href}
                  label={t(item.labelKey)}
                  pathname={pathname}
                />
              ))}
            </nav>
          </aside>
        </div>
      ) : null}
    </main>
  );
}

function getInitialSidebarCollapsed() {
  if (cachedSidebarCollapsed !== null) {
    return cachedSidebarCollapsed;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  cachedSidebarCollapsed = window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === 'true';

  return cachedSidebarCollapsed;
}

function AdminNavItem({
  collapsed,
  description,
  href,
  label,
  pathname,
}: {
  collapsed: boolean;
  description: string;
  href: string;
  label: string;
  pathname: string;
}) {
  const Icon = navIconByHref[href as keyof typeof navIconByHref] ?? LayoutDashboard;
  const active = href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <Link
      aria-label={collapsed ? label : undefined}
      className={`group rounded-md text-sm transition ${
        active
          ? 'bg-neutral-950 text-white hover:bg-neutral-900'
          : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950'
      } ${
        collapsed ? 'grid place-items-center px-2 py-2.5' : 'flex items-start gap-3 px-3 py-2.5'
      }`}
      href={href}
      title={collapsed ? label : undefined}
    >
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-md transition ${
          active
            ? 'bg-white/10 text-white'
            : collapsed
              ? 'bg-neutral-100 text-neutral-600 group-hover:bg-neutral-950 group-hover:text-white'
              : 'bg-neutral-100 text-neutral-500 group-hover:bg-white group-hover:text-neutral-900'
        }`}
      >
        <Icon className="size-4" />
      </span>
      {collapsed ? null : (
        <span className="min-w-0">
          <span className="block font-medium">{label}</span>
          <span
            className={`mt-0.5 block text-xs ${
              active ? 'text-white/65' : 'text-neutral-400 group-hover:text-neutral-500'
            }`}
          >
            {description}
          </span>
        </span>
      )}
    </Link>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actionLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel?: string;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-4 sm:p-5 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.16em] text-neutral-400">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">{description}</p>
      </div>
      {actionLabel ? (
        <button className="w-full rounded-md bg-neutral-950 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 sm:w-fit">
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}

export function MetricCard({ metric }: { metric: Metric }) {
  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-neutral-500">{metric.label}</p>
        <span className="rounded-full border border-neutral-200 px-2 py-1 text-[11px] text-neutral-500">
          {metric.trend}
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{metric.value}</p>
      <p className="mt-2 text-sm text-neutral-500">{metric.detail}</p>
    </article>
  );
}

export function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-lg border border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 p-4 sm:p-5">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-neutral-500">{description}</p>
        ) : null}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function DataTable({ columns, rows }: { columns: string[]; rows: TableRow[] }) {
  return (
    <>
      <div className="grid gap-3 md:hidden">
        {rows.map((row, rowIndex) => (
          <article className="rounded-md border border-neutral-200 bg-white p-3" key={rowIndex}>
            <div className="grid gap-2">
              {row.map((cell, cellIndex) => (
                <div
                  className="grid grid-cols-[minmax(92px,0.42fr)_1fr] gap-3 text-sm"
                  key={`${rowIndex}-${cellIndex}`}
                >
                  <span className="text-xs font-medium uppercase tracking-[0.08em] text-neutral-400">
                    {columns[cellIndex]}
                  </span>
                  <span className="min-w-0 break-words text-right text-neutral-700">{cell}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-xs uppercase tracking-[0.12em] text-neutral-400">
              {columns.map((column) => (
                <th className="pb-3 pr-4 font-medium" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((row, rowIndex) => (
              <tr className="text-neutral-700" key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td className="py-3 pr-4 align-middle" key={`${rowIndex}-${cellIndex}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function StatusBadge({ children, tone }: { children: ReactNode; tone: Tone }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${toneStyles[tone]}`}
    >
      {children}
    </span>
  );
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

export function Field({
  label,
  value,
  type = 'text',
}: {
  label: string;
  value?: string;
  type?: 'text' | 'number' | 'email' | 'password';
}) {
  return (
    <label className="grid min-w-0 gap-1.5 text-sm font-medium text-neutral-700">
      {label}
      <input
        className="min-w-0 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-normal text-neutral-950 outline-none focus:border-neutral-600"
        defaultValue={value}
        type={type}
      />
    </label>
  );
}

export function SelectField({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="grid min-w-0 gap-1.5 text-sm font-medium text-neutral-700">
      {label}
      <select className="min-w-0 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-normal text-neutral-950 outline-none focus:border-neutral-600">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
