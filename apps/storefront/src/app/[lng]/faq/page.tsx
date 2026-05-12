'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useT } from 'next-i18next/client';

type FAQCategory = {
  id: string;
  category: string;
  questions: {
    q: string;
    a: string;
  }[];
};

export default function FAQPage() {
  const [openId, setOpenId] = useState<string | null>();

  const { t } = useT('faq');

  const faqs = t('categories', {
    returnObjects: true,
  }) as FAQCategory[];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-[#9A9A9A] uppercase tracking-[0.2em] text-xs mb-4">
          {t('header.subtitle')}
        </p>

        <h1
          className="text-[#1A1A1A] mb-6"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            fontSize: 'clamp(2rem, 5vw, 3rem)',
          }}
        >
          {t('header.title')}
        </h1>

        <p className="text-[#5A5A5A] text-sm max-w-2xl mx-auto">{t('header.description')}</p>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {faqs.map((category: any) => (
          <div key={category.id} className="mb-8">
            <h2
              className="text-[#1A1A1A] mb-4 pb-2 border-b border-[#E8E8E8]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
                fontSize: '1.5rem',
              }}
            >
              {category.category}
            </h2>

            <div className="space-y-2">
              {category.questions.map((faq: any, idx: number) => {
                const faqId = `${category.id}-${idx}`;
                const isOpen = openId === faqId;

                return (
                  <div key={idx} className="border border-[#E8E8E8]">
                    <button
                      onClick={() => setOpenId(isOpen ? null : faqId)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-[#FAFAFA] transition-colors"
                    >
                      <span className="text-[#1A1A1A] text-sm pr-4">{faq.q}</span>

                      <ChevronDown
                        className={`size-4 text-[#9A9A9A] flex-shrink-0 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-2 text-sm text-[#5A5A5A] leading-relaxed border-t border-[#F0F0F0]">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <section className="bg-[#FAFAFA] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-[#1A1A1A] mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              fontSize: '1.8rem',
            }}
          >
            {t('contactSection.title')}
          </h2>

          <p className="text-[#5A5A5A] text-sm mb-8 max-w-xl mx-auto">
            {t('contactSection.description')}
          </p>

          <a
            href="/contact"
            className="inline-flex items-center justify-center bg-[#1A1A1A] text-white px-8 py-3.5 text-xs uppercase tracking-widest hover:bg-[#333] transition-colors"
            style={{ letterSpacing: '0.15em' }}
          >
            {t('contactSection.button')}
          </a>
        </div>
      </section>
    </div>
  );
}
