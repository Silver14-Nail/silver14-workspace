'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  Tag,
  Building2,
  Mail,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Sun,
  Moon,
  Boxes,
  ShoppingBag,
  ChevronRight,
  Store,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Users', icon: Users, path: '/admin/users' },
  { label: 'Products', icon: Package, path: '/admin/products' },
  { label: 'Inventory', icon: Boxes, path: '/admin/inventory' },
  { label: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
  { label: 'Checkout & Carts', icon: ShoppingCart, path: '/admin/checkout' },
  { label: 'Payments', icon: CreditCard, path: '/admin/payments' },
  { label: 'Coupons', icon: Tag, path: '/admin/coupons' },
  { label: 'Wholesale', icon: Building2, path: '/admin/wholesale' },
  { label: 'Newsletter', icon: Mail, path: '/admin/newsletter' },
  { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
];

const notifications = [
  { id: 1, text: '3 new wholesale enquiries', time: '2m ago', unread: true },
  {
    id: 2,
    text: 'Low stock: Champagne Glow (5 left)',
    time: '1h ago',
    unread: true,
  },
  {
    id: 3,
    text: 'Payment failed for order #LUN-2026-0082',
    time: '3h ago',
    unread: true,
  },
  {
    id: 4,
    text: 'Order #LUN-2026-0089 delivered',
    time: '5h ago',
    unread: false,
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) =>
    pathname === path || (path !== '/admin/dashboard' && pathname.startsWith(path));

  const pathSegments = pathname.split('/').filter(Boolean);

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark bg-gray-950' : 'bg-[#F8F8FA]'}`}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300 ease-in-out
          ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-[#E5E7EB]'}
          border-r
          ${collapsed ? 'w-16' : 'w-60'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div
          className={`flex items-center h-14 px-4 border-b ${
            darkMode ? 'border-gray-800' : 'border-[#E5E7EB]'
          } flex-shrink-0`}
        >
          {!collapsed ? (
            <Link href="/" className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 bg-[#1A1A1A] rounded flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-semibold">L</span>
              </div>

              <span
                className={`text-sm font-semibold tracking-widest uppercase ${
                  darkMode ? 'text-white' : 'text-[#1A1A1A]'
                }`}
                style={{ letterSpacing: '0.18em' }}
              >
                Lunelle
              </span>

              <span
                className={`text-xs px-1.5 py-0.5 rounded ml-1 ${
                  darkMode ? 'bg-gray-800 text-gray-400' : 'bg-[#F3F4F6] text-[#6B7280]'
                }`}
              >
                Admin
              </span>
            </Link>
          ) : (
            <div className="w-7 h-7 bg-[#1A1A1A] rounded flex items-center justify-center mx-auto">
              <span className="text-white text-xs font-semibold">L</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navItems.map((item) => {
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={`
                  flex items-center gap-3 px-2.5 py-2 rounded-lg mb-0.5 transition-all duration-150 group relative
                  ${
                    active
                      ? darkMode
                        ? 'bg-gray-800 text-white'
                        : 'bg-[#1A1A1A] text-white'
                      : darkMode
                        ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1A1A1A]'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <item.icon className={`flex-shrink-0 ${collapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />

                {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}

                {collapsed && (
                  <div
                    className={`absolute left-full ml-2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 ${
                      darkMode ? 'bg-gray-800 text-white' : 'bg-[#1A1A1A] text-white'
                    }`}
                  >
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className={`p-2 border-t ${darkMode ? 'border-gray-800' : 'border-[#E5E7EB]'}`}>
          <Link
            href="/"
            className={`flex items-center gap-3 px-2.5 py-2 rounded-lg transition-all mb-1 ${
              darkMode
                ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1A1A1A]'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <Store className="w-4 h-4 flex-shrink-0" />

            {!collapsed && <span className="text-sm font-medium">View Store</span>}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-all ${
              darkMode
                ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1A1A1A]'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}

            {!collapsed && <span className="text-sm font-medium">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          collapsed ? 'lg:ml-16' : 'lg:ml-60'
        }`}
      >
        {/* Topbar */}
        <header
          className={`h-14 flex items-center px-4 gap-3 sticky top-0 z-30 ${
            darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-[#E5E7EB]'
          } border-b`}
        >
          {/* Mobile menu */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden p-1.5 rounded ${
              darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-[#6B7280] hover:bg-[#F3F4F6]'
            }`}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-1.5 text-sm">
            <span className={darkMode ? 'text-gray-500' : 'text-[#9CA3AF]'}>Admin</span>

            {pathSegments.slice(1).map((seg, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight
                  className={`w-3.5 h-3.5 ${darkMode ? 'text-gray-600' : 'text-[#D1D5DB]'}`}
                />

                <span
                  className={`capitalize ${
                    i === pathSegments.length - 2
                      ? darkMode
                        ? 'text-white font-medium'
                        : 'text-[#1A1A1A] font-medium'
                      : darkMode
                        ? 'text-gray-400'
                        : 'text-[#6B7280]'
                  }`}
                >
                  {seg.replace(/-/g, ' ')}
                </span>
              </span>
            ))}
          </div>

          {/* Search */}
          <div
            className={`flex-1 max-w-xs hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
              darkMode ? 'border-gray-700 bg-gray-800' : 'border-[#E5E7EB] bg-[#F9FAFB]'
            }`}
          >
            <Search className={`w-3.5 h-3.5 ${darkMode ? 'text-gray-500' : 'text-[#9CA3AF]'}`} />

            <input
              type="text"
              placeholder="Search..."
              className={`flex-1 bg-transparent text-sm outline-none ${
                darkMode
                  ? 'text-white placeholder:text-gray-600'
                  : 'text-[#1A1A1A] placeholder:text-[#9CA3AF]'
              }`}
            />

            <kbd
              className={`text-xs px-1.5 py-0.5 rounded ${
                darkMode
                  ? 'bg-gray-700 text-gray-500'
                  : 'bg-white border border-[#E5E7EB] text-[#9CA3AF]'
              }`}
            >
              ⌘K
            </kbd>
          </div>

          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Theme */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1A1A1A]'
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfile(false);
                }}
                className={`relative p-2 rounded-lg transition-colors ${
                  darkMode
                    ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1A1A1A]'
                }`}
              >
                <Bell className="w-4 h-4" />

                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {showNotifications && (
                <div
                  className={`absolute right-0 top-full mt-1 w-80 rounded-xl border shadow-xl z-50 overflow-hidden ${
                    darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-[#E5E7EB]'
                  }`}
                >
                  <div
                    className={`px-4 py-3 border-b flex items-center justify-between ${
                      darkMode ? 'border-gray-700' : 'border-[#E5E7EB]'
                    }`}
                  >
                    <span
                      className={`text-sm font-semibold ${
                        darkMode ? 'text-white' : 'text-[#1A1A1A]'
                      }`}
                    >
                      Notifications
                    </span>

                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                      3 new
                    </span>
                  </div>

                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 flex gap-3 items-start border-b last:border-0 ${
                        darkMode
                          ? 'border-gray-800 hover:bg-gray-800'
                          : 'border-[#F3F4F6] hover:bg-[#F9FAFB]'
                      } cursor-pointer transition-colors`}
                    >
                      {n.unread ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      ) : (
                        <div className="w-1.5 h-1.5 mt-1.5 flex-shrink-0" />
                      )}

                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-[#374151]'}`}>
                          {n.text}
                        </p>

                        <p
                          className={`text-xs mt-0.5 ${
                            darkMode ? 'text-gray-500' : 'text-[#9CA3AF]'
                          }`}
                        >
                          {n.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfile(!showProfile);
                  setShowNotifications(false);
                }}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-800' : 'hover:bg-[#F3F4F6]'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-[#1A1A1A] flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">A</span>
                </div>

                <div className="hidden sm:block text-left">
                  <p
                    className={`text-xs font-medium leading-none mb-0.5 ${
                      darkMode ? 'text-white' : 'text-[#1A1A1A]'
                    }`}
                  >
                    Admin
                  </p>

                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-[#9CA3AF]'}`}>
                    admin@lunelle.com
                  </p>
                </div>

                <ChevronDown
                  className={`w-3.5 h-3.5 ${darkMode ? 'text-gray-500' : 'text-[#9CA3AF]'}`}
                />
              </button>

              {showProfile && (
                <div
                  className={`absolute right-0 top-full mt-1 w-52 rounded-xl border shadow-xl z-50 overflow-hidden ${
                    darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-[#E5E7EB]'
                  }`}
                >
                  <div
                    className={`px-4 py-3 border-b ${
                      darkMode ? 'border-gray-700' : 'border-[#E5E7EB]'
                    }`}
                  >
                    <p
                      className={`text-sm font-medium ${
                        darkMode ? 'text-white' : 'text-[#1A1A1A]'
                      }`}
                    >
                      Admin Lunelle
                    </p>

                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-[#9CA3AF]'}`}>
                      admin@lunelle.com
                    </p>
                  </div>

                  <Link
                    href="/admin/settings"
                    className={`flex items-center px-4 py-2.5 text-sm transition-colors ${
                      darkMode
                        ? 'text-gray-300 hover:bg-gray-800'
                        : 'text-[#374151] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    Profile Settings
                  </Link>

                  <Link
                    href="/"
                    className={`flex items-center px-4 py-2.5 text-sm transition-colors ${
                      darkMode
                        ? 'text-gray-300 hover:bg-gray-800'
                        : 'text-[#374151] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    View Store
                  </Link>

                  <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-[#E5E7EB]'}`}>
                    <button
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                        darkMode ? 'text-red-400 hover:bg-gray-800' : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div
            onClick={() => {
              setShowNotifications(false);
              setShowProfile(false);
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
