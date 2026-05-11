'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, CreditCard, Mail, MapPin, MessageCircle } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const pathname = usePathname();
  const lng = pathname.split('/').filter(Boolean)[0] || 'en';
  const localizedHref = (href: string) => `/${lng}${href}`;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#1A1A1A] text-white">
      {/* Newsletter Banner */}
      <div className="border-b border-white/10 py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p
            className="text-[#C0C0C0] uppercase tracking-[0.2em] text-xs mb-3"
            style={{ letterSpacing: '0.2em' }}
          >
            Exclusive Access
          </p>
          <h3
            className="text-white mb-3"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              fontSize: '1.75rem',
              letterSpacing: '0.05em',
            }}
          >
            Join the Silver14 Nail Circle
          </h3>
          <p className="text-[#8A8A8A] text-sm mb-8 leading-relaxed">
            Subscribe for early access to new collections, exclusive offers, and beauty inspiration.
          </p>
          {subscribed ? (
            <div className="text-[#C0C0C0] text-sm tracking-wide">
              Thank you for joining us. A welcome gift awaits in your inbox.
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 bg-transparent border border-white/20 px-4 py-3 text-white text-sm placeholder:text-[#5A5A5A] outline-none focus:border-white/50 transition-colors"
              />
              <button
                type="submit"
                className="bg-white text-[#1A1A1A] px-8 py-3 text-xs uppercase tracking-widest hover:bg-[#E8E8E8] transition-colors whitespace-nowrap"
                style={{ letterSpacing: '0.15em' }}
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <p
              className="text-white mb-4"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontSize: '1.3rem',
                letterSpacing: '0.25em',
              }}
            >
              Silver14 Nail
            </p>
            <p className="text-[#6A6A6A] text-sm leading-relaxed mb-6">
              Handcrafted luxury press-on nails, shipped worldwide. Made with love, worn with
              confidence.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-[#6A6A6A] hover:text-white transition-colors">
                <Camera className="size-4" />
              </a>
              <a href="#" className="text-[#6A6A6A] hover:text-white transition-colors">
                <MessageCircle className="size-4" />
              </a>
              <a
                href="mailto:hello@silver14nail.com"
                className="text-[#6A6A6A] hover:text-white transition-colors"
              >
                <Mail className="size-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <p
              className="text-white text-xs uppercase tracking-widest mb-5"
              style={{ letterSpacing: '0.15em' }}
            >
              Shop
            </p>
            <ul className="space-y-3">
              {[
                { label: 'All Products', href: localizedHref('/products') },
                {
                  label: 'French & Classic',
                  href: localizedHref('/products?collection=french-classic'),
                },
                {
                  label: 'Glitter & Metallic',
                  href: localizedHref('/products?collection=glitter-metallic'),
                },
                { label: 'Nail Art', href: localizedHref('/products?collection=nail-art') },
                { label: 'Solid Colors', href: localizedHref('/products?collection=solid-colors') },
                { label: 'Wholesale', href: localizedHref('/wholesales') },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[#6A6A6A] hover:text-white text-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <p
              className="text-white text-xs uppercase tracking-widest mb-5"
              style={{ letterSpacing: '0.15em' }}
            >
              Information
            </p>
            <ul className="space-y-3">
              {[
                { label: 'About Silver14 Nail', href: `/${lng}#about` },
                { label: 'How To Apply', href: `/${lng}#how-to` },
                { label: 'Size Guide', href: `/${lng}#size-guide` },
                { label: 'Track Your Order', href: localizedHref('/order/tracking') },
                { label: 'FAQ', href: `/${lng}#faq` },
                { label: 'Contact Us', href: 'mailto:hello@silver14nail.com' },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[#6A6A6A] hover:text-white text-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies + Contact */}
          <div>
            <p
              className="text-white text-xs uppercase tracking-widest mb-5"
              style={{ letterSpacing: '0.15em' }}
            >
              Policies
            </p>
            <ul className="space-y-3 mb-6">
              {['Shipping Policy', 'Returns & Exchanges', 'Privacy Policy', 'Terms of Service'].map(
                (l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-[#6A6A6A] hover:text-white text-sm transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ),
              )}
            </ul>
            <div className="flex items-start gap-2 text-[#6A6A6A] text-xs">
              <MapPin className="size-3 mt-0.5 flex-shrink-0" />
              <span>
                Ships worldwide from Vietnam
                <br />
                EU delivery 7-14 business days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#5A5A5A] text-xs">© 2026 Silver14 Nail. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <CreditCard className="size-4 text-[#5A5A5A]" />
            {/* Payment logos text */}
            <span className="text-[#5A5A5A] text-xs">Visa</span>
            <span className="text-[#5A5A5A] text-xs">Mastercard</span>
            <span className="text-[#5A5A5A] text-xs">PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
