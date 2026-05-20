'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import { Check, ArrowRight, Globe, Package, Star } from 'lucide-react';
import Link from 'next/link';
import { useWholesaleEnquiry } from '@/features/wholesale/hooks/useWholesaleEnquiry';
import { useWholesaleTiers } from '@/features/wholesale/hooks/useWholesaleTiers';

const PRODUCT_INTERESTS = [
  'French & Classic',
  'Glitter & Metallic',
  'Nail Art',
  'Solid Colors',
  'Custom / Private Label',
  'All Collections',
];

const COUNTRIES = [
  'Austria',
  'Belgium',
  'Czech Republic',
  'Denmark',
  'Finland',
  'France',
  'Germany',
  'Italy',
  'Netherlands',
  'Norway',
  'Poland',
  'Portugal',
  'Spain',
  'Sweden',
  'Switzerland',
  'United Kingdom',
  'Other EU',
  'United States',
  'Canada',
  'Australia',
  'Singapore',
  'Japan',
  'Other',
];

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Bronze: { bg: '#FDF6EC', text: '#92400E', border: '#D97706' },
  Silver: { bg: '#F8F8F8', text: '#374151', border: '#9CA3AF' },
  Gold: { bg: '#FFFBEB', text: '#78350F', border: '#F59E0B' },
};

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder = '',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        className="block text-[#6A6A6A] text-xs uppercase tracking-widest mb-1.5"
        style={{ letterSpacing: '0.1em' }}
      >
        {label} {required && <span className="text-[#C0C0C0]">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full border border-[#E0E0E0] px-4 py-3 text-sm text-[#1A1A1A] bg-white placeholder:text-[#C0C0C0] outline-none focus:border-[#9A9A9A] transition-colors"
      />
    </div>
  );
}

export default function WholesalePage() {
  const params = useParams<{ lng?: string }>();
  const lng = params.lng ?? 'en';

  const { submit, isSubmitting, error } = useWholesaleEnquiry();
  const { data: tiers = [] } = useWholesaleTiers();

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    businessName: '',
    businessType: '',
    expectedQty: '',
    interests: [] as string[],
    message: '',
  });

  const update = (key: keyof typeof form, value: string | string[]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const toggleInterest = (item: string) => {
    const has = form.interests.includes(item);
    update('interests', has ? form.interests.filter((i) => i !== item) : [...form.interests, item]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      country: form.country,
      businessName: form.businessName || undefined,
      businessType: form.businessType || undefined,
      monthlyOrderQtyRange: form.expectedQty || undefined,
      collectionsOfInterest: form.interests.length > 0 ? form.interests : undefined,
      additionalMessage: form.message || undefined,
    });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen pt-16 md:pt-20">
      {/* Hero */}
      <div className="bg-[#1A1A1A] py-20 px-4 text-center">
        <p
          className="text-white/40 uppercase tracking-[0.25em] text-xs mb-5"
          style={{ letterSpacing: '0.25em' }}
        >
          B2B Partnership
        </p>
        <h1
          className="text-white mb-5"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            letterSpacing: '0.05em',
          }}
        >
          Wholesale &amp; Partner Programme
        </h1>
        <p className="text-white/50 text-sm max-w-2xl mx-auto leading-relaxed">
          Bring Silver14 Nail's handcrafted luxury nail collections to your salon, boutique, or
          retail space. We partner with salons, nail studios, beauty retailers, and e-commerce
          stores worldwide.
        </p>
      </div>

      {/* Benefits */}
      <div className="bg-[#F8F8F8] border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[
              {
                icon: Package,
                title: 'Competitive Pricing',
                desc: 'Tiered wholesale pricing with volume discounts based on your monthly order quantity.',
              },
              {
                icon: Globe,
                title: 'Global Shipping',
                desc: 'Reliable bulk shipping to EU, USA, UK and 60+ countries with full tracking and customs support.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center gap-3">
                <div className="size-12 bg-[#1A1A1A] flex items-center justify-center">
                  <Icon className="size-5 text-white" />
                </div>
                <h3
                  className="text-[#1A1A1A]"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 500,
                    fontSize: '1.1rem',
                  }}
                >
                  {title}
                </h3>
                <p className="text-[#6A6A6A] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tier comparison — shown when backend data is available */}
      {tiers.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <p
              className="text-[#9A9A9A] uppercase tracking-[0.2em] text-xs mb-3"
              style={{ letterSpacing: '0.2em' }}
            >
              Partnership Tiers
            </p>
            <h2
              className="text-[#1A1A1A]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
                fontSize: 'clamp(1.4rem, 3vw, 2rem)',
              }}
            >
              Wholesale Pricing Tiers
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {tiers.map((tier) => {
              const colors = TIER_COLORS[tier.name] ?? TIER_COLORS['Bronze'];
              return (
                <div
                  key={tier.id}
                  className="border p-6 flex flex-col gap-4"
                  style={{ borderColor: colors.border, backgroundColor: colors.bg }}
                >
                  <div className="flex items-center gap-2">
                    <Star className="size-4" style={{ color: colors.border }} aria-hidden />
                    <span
                      className="text-xs uppercase tracking-widest font-medium"
                      style={{ color: colors.text, letterSpacing: '0.12em' }}
                    >
                      {tier.name}
                    </span>
                  </div>

                  <p
                    className="text-[#1A1A1A]"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 500,
                      fontSize: '2rem',
                    }}
                  >
                    {Number(tier.discountPercent)}%
                    <span className="text-sm font-normal text-[#6A6A6A] ml-1">off retail</span>
                  </p>

                  <ul className="space-y-2 text-[#6A6A6A] text-xs">
                    {tier.minMonthlyQty > 0 && (
                      <li className="flex items-center gap-2">
                        <Check className="size-3.5 text-[#4A7A5A] flex-shrink-0" aria-hidden />
                        Min. {tier.minMonthlyQty} sets / month
                      </li>
                    )}
                    {Number(tier.minOrderAmount) > 0 && (
                      <li className="flex items-center gap-2">
                        <Check className="size-3.5 text-[#4A7A5A] flex-shrink-0" aria-hidden />
                        Min. order €{Number(tier.minOrderAmount).toFixed(0)}
                      </li>
                    )}
                    {tier.freeShipping && (
                      <li className="flex items-center gap-2">
                        <Check className="size-3.5 text-[#4A7A5A] flex-shrink-0" aria-hidden />
                        Free shipping included
                      </li>
                    )}
                    {tier.maxDiscountAmount && (
                      <li className="flex items-center gap-2">
                        <Check className="size-3.5 text-[#4A7A5A] flex-shrink-0" aria-hidden />
                        Up to €{Number(tier.maxDiscountAmount).toFixed(0)} savings/order
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="size-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="size-7 text-[#4A7A5A]" />
            </div>
            <p
              className="text-[#9A9A9A] uppercase tracking-[0.2em] text-xs mb-4"
              style={{ letterSpacing: '0.2em' }}
            >
              Enquiry Received
            </p>
            <h2
              className="text-[#1A1A1A] mb-4"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
                fontSize: '1.8rem',
              }}
            >
              Thank you, {form.firstName}!
            </h2>
            <p className="text-[#6A6A6A] text-sm leading-relaxed max-w-sm mx-auto mb-8">
              We've received your wholesale enquiry and will review your request within 2–3 business
              days. Our partnership team will contact you at <strong>{form.email}</strong>.
            </p>
            <Link
              href={`/${lng}/products`}
              className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-8 py-4 text-xs uppercase tracking-widest hover:bg-[#333] transition-colors"
              style={{ letterSpacing: '0.15em' }}
            >
              Browse Our Collections <ArrowRight className="size-3.5" />
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="text-center mb-10">
              <p
                className="text-[#9A9A9A] uppercase tracking-[0.2em] text-xs mb-3"
                style={{ letterSpacing: '0.2em' }}
              >
                Get Started
              </p>
              <h2
                className="text-[#1A1A1A]"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 400,
                  fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                }}
              >
                Wholesale Enquiry Form
              </h2>
            </div>

            {/* Section: Personal Info */}
            <div>
              <p
                className="text-[#1A1A1A] text-xs uppercase tracking-widest mb-5 pb-2 border-b border-[#F0F0F0]"
                style={{ letterSpacing: '0.12em' }}
              >
                Contact Details
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="First Name"
                    value={form.firstName}
                    onChange={(v) => update('firstName', v)}
                    required
                  />
                  <InputField
                    label="Last Name"
                    value={form.lastName}
                    onChange={(v) => update('lastName', v)}
                    required
                  />
                </div>
                <InputField
                  label="Email Address"
                  value={form.email}
                  onChange={(v) => update('email', v)}
                  type="email"
                  required
                />
                <InputField
                  label="Phone Number"
                  value={form.phone}
                  onChange={(v) => update('phone', v)}
                  type="tel"
                  required
                  placeholder="+49 123 456 7890"
                />
                <div>
                  <label
                    className="block text-[#6A6A6A] text-xs uppercase tracking-widest mb-1.5"
                    style={{ letterSpacing: '0.1em' }}
                  >
                    Country <span className="text-[#C0C0C0]">*</span>
                  </label>
                  <select
                    value={form.country}
                    onChange={(e) => update('country', e.target.value)}
                    required
                    className="w-full border border-[#E0E0E0] px-4 py-3 text-sm text-[#1A1A1A] bg-white outline-none focus:border-[#9A9A9A] transition-colors"
                  >
                    <option value="">Select your country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section: Business Info */}
            <div>
              <p
                className="text-[#1A1A1A] text-xs uppercase tracking-widest mb-5 pb-2 border-b border-[#F0F0F0]"
                style={{ letterSpacing: '0.12em' }}
              >
                Business Information
              </p>
              <div className="space-y-4">
                <InputField
                  label="Business / Salon Name (optional)"
                  value={form.businessName}
                  onChange={(v) => update('businessName', v)}
                  placeholder="e.g. Glam Nails Studio"
                />
                <div>
                  <label
                    className="block text-[#6A6A6A] text-xs uppercase tracking-widest mb-1.5"
                    style={{ letterSpacing: '0.1em' }}
                  >
                    Business Type
                  </label>
                  <select
                    value={form.businessType}
                    onChange={(e) => update('businessType', e.target.value)}
                    className="w-full border border-[#E0E0E0] px-4 py-3 text-sm text-[#1A1A1A] bg-white outline-none focus:border-[#9A9A9A] transition-colors"
                  >
                    <option value="">Select type</option>
                    {[
                      'Nail Salon',
                      'Beauty Salon / Spa',
                      'Retail Store',
                      'Online Shop / E-commerce',
                      'Distributor',
                      'Influencer / Content Creator',
                      'Other',
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-[#6A6A6A] text-xs uppercase tracking-widest mb-1.5"
                    style={{ letterSpacing: '0.1em' }}
                  >
                    Expected Monthly Order Quantity
                  </label>
                  <select
                    value={form.expectedQty}
                    onChange={(e) => update('expectedQty', e.target.value)}
                    className="w-full border border-[#E0E0E0] px-4 py-3 text-sm text-[#1A1A1A] bg-white outline-none focus:border-[#9A9A9A] transition-colors"
                  >
                    <option value="">Select range</option>
                    {['1-10 sets', '11-30 sets', '31-100 sets', '101-500 sets', '500+ sets'].map(
                      (q) => (
                        <option key={q} value={q}>
                          {q}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Product Interest */}
            <div>
              <p
                className="text-[#1A1A1A] text-xs uppercase tracking-widest mb-5 pb-2 border-b border-[#F0F0F0]"
                style={{ letterSpacing: '0.12em' }}
              >
                Collections of Interest
              </p>
              <div className="flex flex-wrap gap-2">
                {PRODUCT_INTERESTS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInterest(item)}
                    className={`px-4 py-2 text-xs border transition-all ${
                      form.interests.includes(item)
                        ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                        : 'border-[#E0E0E0] text-[#6A6A6A] hover:border-[#9A9A9A]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label
                className="block text-[#6A6A6A] text-xs uppercase tracking-widest mb-1.5"
                style={{ letterSpacing: '0.1em' }}
              >
                Additional Message / Requirements
              </label>
              <textarea
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
                placeholder="Tell us more about your business, specific requirements, custom design needs..."
                rows={5}
                className="w-full border border-[#E0E0E0] px-4 py-3 text-sm text-[#1A1A1A] bg-white placeholder:text-[#C0C0C0] outline-none focus:border-[#9A9A9A] transition-colors resize-none"
              />
            </div>

            {error && <p className="text-red-600 text-xs px-1">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] text-white py-4 text-xs uppercase tracking-widest hover:bg-[#333] transition-colors disabled:bg-[#6A6A6A]"
              style={{ letterSpacing: '0.15em' }}
            >
              {isSubmitting ? (
                <>
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{' '}
                  Submitting...
                </>
              ) : (
                <>
                  Submit Enquiry <ArrowRight className="size-3.5" />
                </>
              )}
            </button>
            <p className="text-[#9A9A9A] text-xs text-center">
              We typically respond within 2–3 business days. For urgent enquiries, email us at{' '}
              wholesale@silver14nail.com
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
