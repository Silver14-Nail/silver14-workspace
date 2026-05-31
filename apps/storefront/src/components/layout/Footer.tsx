'use client';

import { useState } from 'react';
import { useT } from 'next-i18next/client';
import { CreditCard, MapPin } from 'lucide-react';

import { LinkBase } from '@/components/shared/LinkBase';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export function Footer() {
  const { t } = useT('footer');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/client-api/wholesales/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'footer' }),
      });
      if (!res.ok && res.status !== 409) throw new Error('Failed to subscribe');
      setSubscribed(true);
      setEmail('');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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
            {t('newsletter.eyebrow')}
          </p>
          <h3
            className="text-white mb-3"
            style={{
              fontWeight: 400,
              fontSize: '1.75rem',
              letterSpacing: '0.05em',
            }}
          >
            {t('newsletter.title')}
          </h3>
          <p className="text-[#8A8A8A] text-sm mb-8 leading-relaxed">
            {t('newsletter.description')}
          </p>
          {subscribed ? (
            <div className="text-[#C0C0C0] text-sm tracking-wide">{t('newsletter.success')}</div>
          ) : (
            <>
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('newsletter.placeholder')}
                  required
                  disabled={loading}
                  className="flex-1 bg-transparent border border-white/20 px-4 py-3 text-white text-sm placeholder:text-[#5A5A5A] outline-none focus:border-white/50 transition-colors disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-white text-[#1A1A1A] px-8 py-3 text-xs uppercase tracking-widest hover:bg-[#E8E8E8] transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ letterSpacing: '0.15em' }}
                >
                  {loading ? '...' : t('newsletter.submit')}
                </button>
              </form>
              {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            </>
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
                fontWeight: 400,
                fontSize: '1.65rem',
                letterSpacing: '0.02em',
                lineHeight: 1,
              }}
            >
              Silver14 Nail
            </p>
            <p className="text-[#6A6A6A] text-sm leading-relaxed mb-6">{t('brandDescription')}</p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/silver14.nail?igsh=MWI2OHYxaXN6aXFmaQ%3D%3D&utm_source=qr"
                className="text-[#6A6A6A] hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/images/icons/instagram.png" alt="Instagram" className="size-4" />
              </a>
              <a
                href="https://www.tiktok.com/@silver14nails"
                className="text-[#6A6A6A] hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/images/icons/tiktok.png" alt="TikTok" className="size-4" />
              </a>
              <a
                href="https://pin.it/67LetbRkT"
                className="text-[#6A6A6A] hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/images/icons/pinterest.png" alt="Pinterest" className="size-4" />
              </a>
              <a
                href="https://wa.me/84344399881"
                className="text-[#6A6A6A] hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/images/icons/whatsapp.png" alt="WhatsApp" className="size-4" />
              </a>
              <a
                href="mailto:silver14nail@gmail.com"
                className="text-[#6A6A6A] hover:text-white transition-colors"
              >
                <img src="/images/icons/gmail.png" alt="Email" className="size-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <p
              className="text-white text-xs uppercase tracking-widest mb-5"
              style={{ letterSpacing: '0.15em' }}
            >
              {t('shop.title')}
            </p>
            <ul className="space-y-3">
              {[
                { label: t('shop.allProducts'), href: '/products' },

                {
                  label: 'Summer',
                  href: '/products?collection=summer',
                },

                {
                  label: 'Cat Eye',
                  href: '/products?collection=cat-eye',
                },

                {
                  label: 'Cute Nails',
                  href: '/products?collection=cute-nails',
                },

                {
                  label: 'Valentines',
                  href: '/products?collection=valentines',
                },

                {
                  label: 'Christmas Eve',
                  href: '/products?collection=christmas-eve',
                },

                {
                  label: 'Cyber & Y2K & Chrome Nails',
                  href: '/products?collection=cyber-y2k-chrome',
                },

                {
                  label: t('shop.wholesale'),
                  href: '/wholesales',
                },
              ].map((l) => (
                <li key={l.label}>
                  <LinkBase
                    href={l.href}
                    className="text-[#6A6A6A] hover:text-white text-sm transition-colors"
                  >
                    {l.label}
                  </LinkBase>
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
              {t('info.title')}
            </p>
            <ul className="space-y-3">
              {[
                { label: t('info.about'), href: 'about-us' },
                { label: t('info.sizeGuide'), href: 'size-guide' },
                { label: t('info.trackOrder'), href: '/order/tracking' },
                { label: t('info.faq'), href: '/faq' },
                { label: t('info.contact'), href: '/contact' },
              ].map((l) => (
                <li key={l.label}>
                  <LinkBase
                    href={l.href}
                    className="text-[#6A6A6A] hover:text-white text-sm transition-colors"
                  >
                    {l.label}
                  </LinkBase>
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
              {t('policies.title')}
            </p>
            <ul className="space-y-3 mb-6">
              {[
                { label: t('policies.shipping'), href: '/shipping-policy' },
                { label: t('policies.returns'), href: '/returns' },
                { label: t('policies.privacy'), href: '/privacy' },
                { label: t('policies.terms'), href: '/terms' },
              ].map((l) => (
                <li key={l.label}>
                  <LinkBase
                    href={l.href}
                    className="text-[#6A6A6A] hover:text-white text-sm transition-colors"
                  >
                    {l.label}
                  </LinkBase>
                </li>
              ))}
            </ul>
            <div className="flex items-start gap-2 text-[#6A6A6A] text-xs">
              <MapPin className="size-3 mt-0.5 flex-shrink-0" />
              <span>
                {t('shippingFrom')}
                <br />
                {t('delivery')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p
            className="text-[#5A5A5A] text-xs"
          >
            {t('copyright')}
          </p>
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
