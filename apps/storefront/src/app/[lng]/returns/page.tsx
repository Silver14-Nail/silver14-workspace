'use client';

import { XCircle, AlertCircle, MessageCircle } from 'lucide-react';
import { useT } from 'next-i18next/client';

type PolicyItem = {
  icon: keyof typeof iconMap;
  title: string;
  desc: string;
};

const iconMap = {
  XCircle,
  AlertCircle,
  MessageCircle,
};

export default function ReturnsPage() {
  const { t } = useT('returns');

  const policyItems = t('policyItems', {
    returnObjects: true,
  }) as PolicyItem[];

  const notes = t('notes.items', {
    returnObjects: true,
  }) as string[];

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-[#9A9A9A] uppercase tracking-[0.2em] text-xs mb-4">
          {t('hero.subtitle')}
        </p>

        <h1
          className="text-[#1A1A1A] mb-6"
          style={{
            fontWeight: 400,
            fontSize: 'clamp(2rem, 5vw, 3rem)',
          }}
        >
          {t('hero.title')}
        </h1>

        <p className="text-[#5A5A5A] text-sm max-w-2xl mx-auto leading-relaxed">
          {t('hero.description')}
        </p>
      </section>

      {/* Policy Cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {policyItems.map((item, idx) => {
            const Icon = iconMap[item.icon];

            return (
              <div key={idx} className="bg-white border border-[#E8E8E8] p-6 text-center">
                <Icon className="size-8 text-[#C0C0C0] mx-auto mb-3" />

                <h3
                  className="text-[#1A1A1A] text-sm mb-1"
                  style={{
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

      {/* Main Policy */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="border border-[#E8E8E8] bg-white p-8 md:p-12">
          <h2
            className="text-[#1A1A1A] mb-8 text-center"
            style={{
              fontWeight: 400,
              fontSize: '1.8rem',
            }}
          >
            {t('policy.title')}
          </h2>

          <div className="space-y-6 text-sm text-[#5A5A5A] leading-relaxed">
            {[1, 2, 3, 4, 5].map((item) => (
              <p key={item}>{t(`policy.items.${item}`)}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="bg-[#FAFAFA] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-[#1A1A1A] mb-8 text-center"
            style={{
              fontWeight: 400,
              fontSize: '1.8rem',
            }}
          >
            {t('notes.title')}
          </h2>

          <div className="space-y-4">
            {notes.map((note, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#E8E8E8] p-5 text-sm text-[#5A5A5A]"
              >
                {note}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2
          className="text-[#1A1A1A] mb-4"
          style={{
            fontWeight: 400,
            fontSize: '1.8rem',
          }}
        >
          {t('cta.title')}
        </h2>

        <p className="text-[#5A5A5A] text-sm mb-8 max-w-xl mx-auto">{t('cta.description')}</p>

        <a
          href="/contact"
          className="inline-flex items-center justify-center bg-[#1A1A1A] text-white px-8 py-3.5 text-xs uppercase tracking-widest hover:bg-[#333] transition-colors"
          style={{ letterSpacing: '0.15em' }}
        >
          {t('cta.button')}
        </a>
      </section>
    </div>
  );
}
