'use client';

import { useState } from 'react';
import { Mail, MessageCircle, MapPin, Clock } from 'lucide-react';
import { useT } from 'next-i18next/client';

type ContactInfoItem = {
  icon: keyof typeof iconMap;
  title: string;
  content: string;
  description: string;
};

const iconMap = {
  Mail,
  MessageCircle,
  MapPin,
  Clock,
};

export default function ContactPage() {
  const { t } = useT('contact');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: send API request here

    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);

      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    }, 3000);
  };

  const contactInfo = t('contactInfo', {
    returnObjects: true,
  }) as ContactInfoItem[];

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
            fontWeight: 400,
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            lineHeight: 1.2,
          }}
        >
          {t('hero.title')}
        </h1>

        <p className="text-[#5A5A5A] text-sm max-w-2xl mx-auto">{t('hero.description')}</p>
      </section>

      {/* Contact Info */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {contactInfo.map((info, idx) => {
            const Icon = iconMap[info.icon];

            return (
              <div key={idx} className="bg-white border border-[#E8E8E8] p-6 text-center">
                <Icon className="size-8 text-[#C0C0C0] mx-auto mb-4" />

                <h3
                  className="text-[#1A1A1A] text-sm uppercase tracking-widest mb-2"
                  style={{ letterSpacing: '0.1em' }}
                >
                  {info.title}
                </h3>

                <p
                  className="text-[#1A1A1A] text-sm mb-1"
                  style={{
                    fontWeight: 500,
                  }}
                >
                  {info.content}
                </p>

                <p className="text-[#9A9A9A] text-xs">{info.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Form */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-[#E8E8E8] p-8 md:p-12">
          <h2
            className="text-[#1A1A1A] mb-8 text-center"
            style={{
              fontWeight: 400,
              fontSize: '1.8rem',
            }}
          >
            {t('form.title')}
          </h2>

          {submitted ? (
            <div className="text-center py-12">
              <div className="size-16 bg-[#F0F8F4] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="size-8 text-[#4A7A5A]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h3
                className="text-[#1A1A1A] text-lg mb-2"
                style={{
                  fontWeight: 500,
                }}
              >
                {t('success.title')}
              </h3>

              <p className="text-[#5A5A5A] text-sm">{t('success.description')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label
                    className="block text-[#6A6A6A] text-xs uppercase tracking-widest mb-2"
                    style={{ letterSpacing: '0.1em' }}
                  >
                    {t('form.name')} <span className="text-[#C0C0C0]">*</span>
                  </label>

                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        name: e.target.value,
                      }))
                    }
                    className="w-full border border-[#E0E0E0] px-4 py-3 text-sm focus:outline-none focus:border-[#9A9A9A]"
                  />
                </div>

                <div>
                  <label
                    className="block text-[#6A6A6A] text-xs uppercase tracking-widest mb-2"
                    style={{ letterSpacing: '0.1em' }}
                  >
                    {t('form.email')} <span className="text-[#C0C0C0]">*</span>
                  </label>

                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        email: e.target.value,
                      }))
                    }
                    className="w-full border border-[#E0E0E0] px-4 py-3 text-sm focus:outline-none focus:border-[#9A9A9A]"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-[#6A6A6A] text-xs uppercase tracking-widest mb-2"
                  style={{ letterSpacing: '0.1em' }}
                >
                  {t('form.subject')} <span className="text-[#C0C0C0]">*</span>
                </label>

                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      subject: e.target.value,
                    }))
                  }
                  placeholder={t('form.subjectPlaceholder')}
                  className="w-full border border-[#E0E0E0] px-4 py-3 text-sm focus:outline-none focus:border-[#9A9A9A]"
                />
              </div>

              <div>
                <label
                  className="block text-[#6A6A6A] text-xs uppercase tracking-widest mb-2"
                  style={{ letterSpacing: '0.1em' }}
                >
                  {t('form.message')} <span className="text-[#C0C0C0]">*</span>
                </label>

                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      message: e.target.value,
                    }))
                  }
                  placeholder={t('form.messagePlaceholder')}
                  className="w-full border border-[#E0E0E0] px-4 py-3 text-sm focus:outline-none focus:border-[#9A9A9A] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1A1A1A] text-white py-4 text-xs uppercase tracking-widest hover:bg-[#333] transition-colors"
                style={{ letterSpacing: '0.15em' }}
              >
                {t('form.submit')}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-[#9A9A9A] text-sm mb-4">{t('faq.text')}</p>

        <a
          href="/faq"
          className="inline-flex items-center text-[#1A1A1A] text-xs uppercase tracking-widest underline hover:opacity-70"
          style={{ letterSpacing: '0.12em' }}
        >
          {t('faq.button')}
        </a>
      </section>
    </div>
  );
}
