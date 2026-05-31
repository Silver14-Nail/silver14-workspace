'use client';

import { useT } from 'next-i18next/client';

interface SubSection {
  label: string;
  text: string;
}

interface Contact {
  email: string;
  website: string;
}

interface Section {
  number: string;
  title: string;
  paragraphs: string[];
  list: string[];
  subTitle?: string;
  subParagraphs?: string[];
  subSections?: SubSection[];
  contact?: Contact;
}

export default function TermsPage() {
  const { t } = useT('terms');
  const rawSections = t('sections', { returnObjects: true });
  const sections: Section[] = Array.isArray(rawSections) ? rawSections : [];

  return (
    <div className="min-h-screen pt-20 pb-24 bg-[#FAFAFA]">
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
        <p
          className="text-[#9A9A9A] uppercase tracking-[0.2em] text-xs mb-4"
          style={{ letterSpacing: '0.2em' }}
        >
          {t('hero.subtitle')}
        </p>
        <h1
          className="text-[#1A1A1A] mb-6"
          style={{ fontWeight: 400, fontSize: 'clamp(2rem, 5vw, 2.8rem)', lineHeight: 1.2 }}
        >
          {t('hero.title')}
        </h1>
        <p className="text-[#6A6A6A] text-sm max-w-xl mx-auto leading-relaxed">
          {t('hero.description')}
        </p>
      </section>

      {/* Sections */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {sections.map((section) => (
          <div key={section.number} className="bg-white border border-[#E8E8E8] p-8">
            {/* Section header */}
            <div className="flex items-start gap-5 mb-6">
              <span
                className="text-[#C0C0C0] font-mono text-xs mt-1 flex-shrink-0"
                style={{ letterSpacing: '0.1em' }}
              >
                {section.number}
              </span>
              <h2
                className="text-[#1A1A1A] text-sm uppercase"
                style={{ fontWeight: 600, letterSpacing: '0.08em' }}
              >
                {section.title}
              </h2>
            </div>

            <div className="pl-9 space-y-4">
              {/* Main paragraphs */}
              {section.paragraphs.map((p, i) => (
                <p key={i} className="text-[#5A5A5A] text-sm leading-relaxed">
                  {p}
                </p>
              ))}

              {/* Bullet list */}
              {section.list.length > 0 && (
                <ul className="space-y-2">
                  {section.list.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#5A5A5A]">
                      <span className="mt-2 size-1.5 rounded-full bg-[#C0C0C0] flex-shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Sub-section (for section 03) */}
              {section.subTitle && (
                <div className="pt-4 border-t border-[#F0F0F0]">
                  <p
                    className="text-[#1A1A1A] text-xs uppercase mb-3"
                    style={{ fontWeight: 600, letterSpacing: '0.1em' }}
                  >
                    {section.subTitle}
                  </p>
                  {section.subParagraphs?.map((p, i) => (
                    <p key={i} className="text-[#5A5A5A] text-sm leading-relaxed mb-2">
                      {p}
                    </p>
                  ))}
                </div>
              )}

              {/* Sub-sections with labels (for section 04) */}
              {section.subSections && (
                <div className="space-y-5">
                  {section.subSections.map((sub, i) => (
                    <div key={i}>
                      <p
                        className="text-[#1A1A1A] text-xs uppercase mb-2"
                        style={{ fontWeight: 600, letterSpacing: '0.1em' }}
                      >
                        {sub.label}
                      </p>
                      <p className="text-[#5A5A5A] text-sm leading-relaxed">{sub.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Contact (for section 05) */}
              {section.contact && (
                <div className="pt-2 space-y-1">
                  <p className="text-sm text-[#1A1A1A]">
                    Email:{' '}
                    <a
                      href={`mailto:${section.contact.email}`}
                      className="text-[#4A7A5A] hover:underline"
                    >
                      {section.contact.email}
                    </a>
                  </p>
                  <p className="text-sm text-[#1A1A1A]">
                    Website:{' '}
                    <span className="text-[#5A5A5A]">{section.contact.website}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Last updated */}
        <p className="text-center text-[#9A9A9A] text-xs pb-4">{t('lastUpdated')}</p>
      </div>
    </div>
  );
}
