'use client';

import { useT } from 'next-i18next/client';

interface Group {
  label: string;
  items: string[];
}

interface Notice {
  label: string;
  text: string;
}

interface Partner {
  label: string;
  text: string;
}

interface Contact {
  email: string;
  phone: string;
  phoneLabel: string;
}

interface Section {
  number: string;
  title: string;
  intro?: string;
  paragraphs?: string[];
  items?: string[];
  groups?: Group[];
  notice?: Notice;
  partners?: Partner[];
  contact?: Contact;
}

export default function PrivacyPage() {
  const { t } = useT('privacy');
  const sections = t('sections', { returnObjects: true }) as Section[];

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
            {/* Header */}
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
              {/* Intro sentence */}
              {section.intro && (
                <p className="text-[#5A5A5A] text-sm leading-relaxed">{section.intro}</p>
              )}

              {/* Plain paragraphs */}
              {section.paragraphs?.map((p, i) => (
                <p key={i} className="text-[#5A5A5A] text-sm leading-relaxed">
                  {p}
                </p>
              ))}

              {/* Simple bullet list (section 02) */}
              {section.items && section.items.length > 0 && (
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#5A5A5A]">
                      <span className="mt-2 size-1.5 rounded-full bg-[#C0C0C0] flex-shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Grouped lists (section 01) */}
              {section.groups && (
                <div className="space-y-5">
                  {section.groups.map((group, gi) => (
                    <div key={gi}>
                      <p
                        className="text-[#1A1A1A] text-xs uppercase mb-2"
                        style={{ fontWeight: 600, letterSpacing: '0.1em' }}
                      >
                        {group.label}
                      </p>
                      <ul className="space-y-1.5">
                        {group.items.map((item, ii) => (
                          <li key={ii} className="flex items-start gap-3 text-sm text-[#5A5A5A]">
                            <span className="mt-2 size-1.5 rounded-full bg-[#C0C0C0] flex-shrink-0" />
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Important notice (section 01) */}
              {section.notice && (
                <div className="mt-2 border-l-2 border-[#4A7A5A] pl-4 py-1">
                  <p
                    className="text-[#4A7A5A] text-xs uppercase mb-1"
                    style={{ fontWeight: 600, letterSpacing: '0.1em' }}
                  >
                    {section.notice.label}
                  </p>
                  <p className="text-[#5A5A5A] text-sm leading-relaxed">{section.notice.text}</p>
                </div>
              )}

              {/* Partners (section 03) */}
              {section.partners && (
                <div className="space-y-4">
                  {section.partners.map((p, i) => (
                    <div key={i}>
                      <p
                        className="text-[#1A1A1A] text-xs uppercase mb-1"
                        style={{ fontWeight: 600, letterSpacing: '0.1em' }}
                      >
                        {p.label}
                      </p>
                      <p className="text-[#5A5A5A] text-sm leading-relaxed">{p.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Contact (section 06) */}
              {section.contact && (
                <div className="space-y-1.5">
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
                    {section.contact.phoneLabel}:{' '}
                    <a
                      href={`tel:${section.contact.phone.replace(/\s/g, '')}`}
                      className="text-[#4A7A5A] hover:underline"
                    >
                      {section.contact.phone}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        <p className="text-center text-[#9A9A9A] text-xs pb-4">{t('lastUpdated')}</p>
      </div>
    </div>
  );
}
