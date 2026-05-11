'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCustomerAuth } from '../../features/auth/customer-auth-provider';
import { COLLECTIONS } from '../../MOCK_DATAS/products';
import { HeaderPreferencesDropdown } from '../shared/HeaderPreferencesDropdown';

const navLinks = [
  { label: 'Shop', href: '/products' },
  { label: 'Collections', href: '/products', hasDropdown: true },
  { label: 'Wholesale', href: '/wholesales' },
  { label: 'Track Order', href: '/order/tracking' },
];

const announcements = [
  'Free shipping on orders over $50',
  'Price includes tax. No hidden fees at checkout.',
  'Buy 3 sets and get 1 accessory kit free',
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const { cartCount } = useCart();
  const { status, user } = useCustomerAuth();
  const pathname = usePathname();
  const lng = pathname.split('/').filter(Boolean)[0] || 'en';
  const localizedHref = (href: string) => `/${lng}${href}`;

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const showPreviousAnnouncement = () => {
    setAnnouncementIndex((index) => (index === 0 ? announcements.length - 1 : index - 1));
  };

  const showNextAnnouncement = () => {
    setAnnouncementIndex((index) => (index + 1) % announcements.length);
  };

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (searchQuery.trim()) {
      window.location.href = localizedHref(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#E6E6E6] bg-white text-[#1A1A1A]">
        <div className="flex h-9 items-center justify-center border-b border-[#E6E6E6] bg-[#1A1A1A] px-4 text-white">
          <button
            type="button"
            aria-label="Previous promotion"
            onClick={showPreviousAnnouncement}
            className="absolute left-4 p-1 text-white/75 hover:text-white"
          >
            <ChevronLeft className="size-4" />
          </button>
          <p className="max-w-[70vw] truncate text-center text-[11px] uppercase tracking-[0.16em]">
            {announcements[announcementIndex]}
          </p>
          <button
            type="button"
            aria-label="Next promotion"
            onClick={showNextAnnouncement}
            className="absolute right-4 p-1 text-white/75 hover:text-white"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="p-1 md:hidden"
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-5" />
            </button>
            <button
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[#5A5A5A] hover:text-[#1A1A1A]"
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
            >
              <Search className="size-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>

          <Link
            href={`/${lng}`}
            className="text-center uppercase text-[#1A1A1A]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.25rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
            }}
          >
            Silver14 Nail
          </Link>

          <div className="flex items-center justify-end gap-2 md:gap-4">
            <div className="hidden md:block">
              <HeaderPreferencesDropdown />
            </div>
            <Link
              href={localizedHref('/account')}
              className="hidden items-center gap-1 p-1 text-[#5A5A5A] hover:text-[#1A1A1A] md:inline-flex"
              aria-label="Account"
            >
              <User className="size-4" />
              {status === 'authenticated' && user ? (
                <span className="text-[10px] uppercase tracking-[0.12em]">
                  {user.name.split(' ')[0]}
                </span>
              ) : null}
            </Link>
            <Link
              href={localizedHref('/cart')}
              className="relative p-1 text-[#5A5A5A] hover:text-[#1A1A1A]"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="size-4" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-[#1A1A1A] text-[9px] font-medium text-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <nav className="hidden h-11 items-center justify-center gap-10 border-t border-[#EFEFEF] px-4 md:flex">
          {navLinks.map((link) =>
            link.hasDropdown ? (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => setCollectionsOpen(true)}
                onMouseLeave={() => setCollectionsOpen(false)}
              >
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-[12px] uppercase tracking-[0.16em] text-[#303030] hover:text-[#8A8A8A]"
                >
                  {link.label}
                  <ChevronDown className="size-3" />
                </button>
                <div
                  className={`absolute left-1/2 top-full z-50 min-w-[220px] -translate-x-1/2 pt-3 transition ${
                    collectionsOpen
                      ? 'pointer-events-auto opacity-100'
                      : 'pointer-events-none opacity-0'
                  }`}
                >
                  <div className="border border-[#E5E5E5] bg-white py-2 shadow-lg">
                    {COLLECTIONS.map((collection) => (
                      <Link
                        key={collection.id}
                        href={localizedHref(
                          collection.id === 'all'
                            ? '/products'
                            : `/products?collection=${collection.id}`,
                        )}
                        className="block px-5 py-2.5 text-[12px] uppercase tracking-[0.12em] text-[#1A1A1A] hover:bg-[#F8F8F8]"
                      >
                        {collection.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={link.label}
                href={localizedHref(link.href)}
                className="text-[12px] uppercase tracking-[0.16em] text-[#303030] hover:text-[#8A8A8A]"
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        {searchOpen && (
          <div className="border-t border-[#EFEFEF] bg-white px-4 py-4">
            <form onSubmit={submitSearch} className="mx-auto flex max-w-3xl items-center gap-3">
              <Search className="size-4 text-[#9A9A9A]" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search products..."
                className="flex-1 bg-transparent text-sm text-[#1A1A1A] outline-none placeholder:text-[#9A9A9A]"
              />
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search">
                <X className="size-4 text-[#9A9A9A]" />
              </button>
            </form>
          </div>
        )}
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 flex h-full w-80 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E8E8E8] px-6 py-5">
              <span
                className="uppercase text-[#1A1A1A]"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                }}
              >
                Silver14 Nail
              </span>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="size-5 text-[#1A1A1A]" />
              </button>
            </div>
            <nav className="flex-1 space-y-6 overflow-y-auto px-6 py-8">
              <Link
                href={localizedHref('/products')}
                className="block text-xs uppercase tracking-[0.15em] text-[#1A1A1A]"
              >
                Shop All
              </Link>
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.15em] text-[#9A9A9A]">Collections</p>
                {COLLECTIONS.slice(1).map((collection) => (
                  <Link
                    key={collection.id}
                    href={localizedHref(`/products?collection=${collection.id}`)}
                    className="block pl-3 text-sm text-[#1A1A1A]"
                  >
                    {collection.label}
                  </Link>
                ))}
              </div>
              <Link
                href={localizedHref('/wholesales')}
                className="block text-xs uppercase tracking-[0.15em] text-[#1A1A1A]"
              >
                Wholesale
              </Link>
              <Link
                href={localizedHref('/order/tracking')}
                className="block text-xs uppercase tracking-[0.15em] text-[#1A1A1A]"
              >
                Track Order
              </Link>
              <Link
                href={localizedHref('/cart')}
                className="block text-xs uppercase tracking-[0.15em] text-[#1A1A1A]"
              >
                Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
              <Link
                href={localizedHref('/account')}
                className="block text-xs uppercase tracking-[0.15em] text-[#1A1A1A]"
              >
                {status === 'authenticated' && user ? `Account (${user.name})` : 'Account'}
              </Link>
              <div className="space-y-4 border-t border-[#E8E8E8] pt-5">
                <HeaderPreferencesDropdown align="left" />
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
