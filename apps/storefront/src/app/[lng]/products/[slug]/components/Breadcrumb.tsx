'use client';

import { ArrowLeft } from 'lucide-react';
import { useT } from 'next-i18next/client';
import { LinkBase } from '@/components/shared/LinkBase';

interface BreadcrumbProps {
  productName: string;
  onBack: () => void;
}

export function Breadcrumb({ productName, onBack }: BreadcrumbProps) {
  const { t } = useT('product-details');

  return (
    <nav
      aria-label={t('breadcrumb.ariaLabel')}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-5 flex items-center gap-2 text-xs text-[#9A9A9A]"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 hover:text-[#1A1A1A] transition-colors"
        aria-label={t('breadcrumb.back')}
      >
        <ArrowLeft className="size-3" aria-hidden />
        {t('breadcrumb.back')}
      </button>
      <span aria-hidden>/</span>
      <LinkBase href="/products" className="hover:text-[#1A1A1A] transition-colors">
        {t('breadcrumb.shop')}
      </LinkBase>
      <span aria-hidden>/</span>
      <span className="text-[#1A1A1A]" aria-current="page">
        {productName}
      </span>
    </nav>
  );
}
