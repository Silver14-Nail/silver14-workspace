'use client';

import { Truck, Package, Globe, Clock } from 'lucide-react';
import { useT } from 'next-i18next/client';

type ShippingZone = {
  region: string;
  countries: string;
  cost: string;
};

type TrustItem = {
  icon: keyof typeof iconMap;
  title: string;
  desc: string;
};

type FAQItem = {
  q: string;
  a: string;
};

const iconMap = {
  Truck,
  Package,
  Globe,
  Clock,
};

export default function ShippingPage() {
  const { t } = useT('shipping-policy');

  const shippingZones = t('shippingZones', {
    returnObjects: true,
  }) as ShippingZone[];

  const trustItems = t('trustItems', {
    returnObjects: true,
  }) as TrustItem[];

  const faqs = t('faqs', {
    returnObjects: true,
  }) as FAQItem[];

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p
          className="text-[#9A9A9A] uppercase tracking-[0.2em] text-xs mb-4"
          style={{ letterSpacing: '0.2em' }}
        >
          {t('hero.subtitle')}
        </p>

        <h1
          className="text-[#1A1A1A] mb-6"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            lineHeight: 1.2,
          }}
        >
          {t('hero.title')}
        </h1>

        <p className="text-[#5A5A5A] text-sm max-w-2xl mx-auto">{t('hero.description')}</p>
      </section>

      {/* Trust Badges */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustItems.map((item, idx) => {
            const Icon = iconMap[item.icon];

            return (
              <div key={idx} className="bg-white border border-[#E8E8E8] p-6 text-center">
                <Icon className="size-8 text-[#C0C0C0] mx-auto mb-3" />

                <h3
                  className="text-[#1A1A1A] text-sm mb-1"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 500,
                  }}
                >
                  {item.title}
                </h3>

                <p className="text-[#9A9A9A] text-xs">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Shipping Zones */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2
          className="text-[#1A1A1A] mb-8 text-center"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            fontSize: '1.8rem',
          }}
        >
          {t('shippingRates.title')}
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {shippingZones.map((zone, idx) => (
            <div key={idx} className="bg-white border border-[#E8E8E8] p-8">
              <h3
                className="text-[#1A1A1A] text-lg mb-4"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 500,
                }}
              >
                {zone.region}
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-[#9A9A9A] text-xs uppercase tracking-widest mb-1">
                    {t('shippingRates.shippingFee')}
                  </p>

                  <p className="text-[#1A1A1A] text-sm">{zone.cost}</p>
                </div>

                <div>
                  <p className="text-[#9A9A9A] text-xs uppercase tracking-widest mb-2">
                    {t('shippingRates.countries')}
                  </p>

                  <p className="text-[#5A5A5A] text-sm leading-relaxed">{zone.countries}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Notes */}
      <section className="bg-[#FAFAFA] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-[#1A1A1A] mb-8 text-center"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              fontSize: '1.8rem',
            }}
          >
            {t('notes.title')}
          </h2>

          <div className="space-y-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white border border-[#E8E8E8] p-6">
                <h3
                  className="text-[#1A1A1A] text-sm uppercase tracking-widest mb-3"
                  style={{ letterSpacing: '0.1em' }}
                >
                  {t(`notes.items.${item}.title`)}
                </h3>

                <p className="text-[#5A5A5A] text-sm leading-relaxed">
                  {t(`notes.items.${item}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2
          className="text-[#1A1A1A] mb-8 text-center"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            fontSize: '1.8rem',
          }}
        >
          {t('faqSection.title')}
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-[#E8E8E8] p-6">
              <h3
                className="text-[#1A1A1A] text-sm mb-2"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 500,
                }}
              >
                {faq.q}
              </h3>

              <p className="text-[#5A5A5A] text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-[#5A5A5A] text-sm mb-6">{t('cta.description')}</p>

        <a
          href="/contact"
          className="inline-flex items-center justify-center border border-[#E0E0E0] text-[#1A1A1A] px-8 py-3.5 text-xs uppercase tracking-widest hover:bg-[#F5F5F5] transition-colors"
          style={{ letterSpacing: '0.15em' }}
        >
          {t('cta.button')}
        </a>
      </section>
    </div>
  );
}
