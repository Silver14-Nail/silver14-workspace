'use client';

import Link from 'next/link';
import { Heart, Sparkles, Users, Award } from 'lucide-react';
import { useT } from 'next-i18next/client';

type ValueItem = {
  icon: keyof typeof iconMap;
  title: string;
  description: string;
};

const iconMap = {
  Heart,
  Sparkles,
  Users,
  Award,
};

export default function AboutPage() {
  const { t } = useT('about-us');

  const values = t('values.items', {
    returnObjects: true,
  }) as ValueItem[];

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero Section */}
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
            fontWeight: 400,
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            lineHeight: 1.2,
          }}
        >
          {t('hero.title')}
        </h1>

        <p className="text-[#5A5A5A] text-base leading-relaxed max-w-2xl mx-auto">
          {t('hero.description')}
        </p>
      </section>

      {/* Story Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#F0F0F0]">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2
              className="text-[#1A1A1A] mb-6"
              style={{
                fontWeight: 400,
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              }}
            >
              {t('story.title')}
            </h2>

            <div className="space-y-4 text-[#5A5A5A] text-sm leading-relaxed">
              {[1, 2, 3, 4, 5].map((item) => (
                <p key={item}>{t(`story.paragraphs.${item}`)}</p>
              ))}
            </div>
          </div>

          <div className="relative aspect-square bg-[#F5F5F5] p-6 md:p-8">
            <div className="relative w-full h-full bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] rotate-[-3deg] transition-transform duration-500 hover:rotate-0">
              <div className="absolute inset-0 border border-[#E8E8E8]" />

              <img
                src="/images/about-us/banner.jfif"
                alt="Silver14 Nail Handmade Press-On Nails"
                className="w-full h-full object-cover p-3"
              />

              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm border border-[#E8E8E8] px-4 py-3">
                <p
                  className="text-[#1A1A1A] text-lg"
                  style={{
                    fontWeight: 500,
                  }}
                >
                  Silver14 Nail
                </p>

                <p className="text-[#7A7A7A] text-[10px] uppercase tracking-[0.25em] mt-1">
                  Handmade Press-On Nails
                </p>
              </div>
            </div>

            {/* Decorative album layers */}
            <div className="absolute inset-0 -z-10 rotate-[4deg] border border-[#ECECEC] bg-[#FAFAFA]" />
            <div className="absolute inset-0 -z-20 rotate-[-6deg] border border-[#F0F0F0] bg-white" />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-[#FAFAFA] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p
              className="text-[#9A9A9A] uppercase tracking-[0.2em] text-xs mb-3"
              style={{ letterSpacing: '0.2em' }}
            >
              {t('values.subtitle')}
            </p>

            <h2
              className="text-[#1A1A1A]"
              style={{
                fontWeight: 400,
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              }}
            >
              {t('values.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, idx) => {
              const Icon = iconMap[value.icon];

              return (
                <div key={idx} className="bg-white p-8 border border-[#E8E8E8]">
                  <Icon className="size-8 text-[#C0C0C0] mb-4" />

                  <h3
                    className="text-[#1A1A1A] text-lg mb-3"
                    style={{
                      fontWeight: 500,
                    }}
                  >
                    {value.title}
                  </h3>

                  <p className="text-[#5A5A5A] text-sm leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2
          className="text-[#1A1A1A] mb-6"
          style={{
            fontWeight: 400,
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          }}
        >
          {t('contact.title')}
        </h2>

        <p className="text-[#5A5A5A] text-sm mb-8 max-w-2xl mx-auto leading-relaxed">
          {t('contact.description')}
        </p>

        <div className="space-y-3 mb-10 text-sm text-[#5A5A5A]">
          <p>
            Instagram:{' '}
            <a
              href="https://instagram.com/silver14nail"
              target="_blank"
              className="text-[#1A1A1A] hover:opacity-70 transition-opacity"
            >
              @silver14nail
            </a>
          </p>

          <p>
            Email:{' '}
            <a
              href="mailto:silver14nail@gmail.com"
              className="text-[#1A1A1A] hover:opacity-70 transition-opacity"
            >
              silver14nail@gmail.com
            </a>
          </p>

          <p>{t('contact.responseTime')}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center bg-[#1A1A1A] text-white px-8 py-3.5 text-xs uppercase tracking-widest hover:bg-[#333] transition-colors"
            style={{ letterSpacing: '0.15em' }}
          >
            {t('contact.shopButton')}
          </Link>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center border border-[#E0E0E0] text-[#1A1A1A] px-8 py-3.5 text-xs uppercase tracking-widest hover:bg-[#F5F5F5] transition-colors"
            style={{ letterSpacing: '0.15em' }}
          >
            {t('contact.contactButton')}
          </Link>
        </div>
      </section>
    </div>
  );
}
