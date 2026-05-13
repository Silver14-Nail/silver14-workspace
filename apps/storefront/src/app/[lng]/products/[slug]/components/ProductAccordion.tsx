'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useT } from 'next-i18next/client';
import type { AccordionKey } from '../types';

interface ProductAccordionProps {
  productDescription: string;
  processingTime: string;
  openSection: AccordionKey | null;
  onToggle: (key: AccordionKey) => void;
  /** 'desktop' = hidden md:block, 'mobile' = md:hidden */
  variant: 'desktop' | 'mobile';
}

export const ProductAccordion = memo(function ProductAccordion({
  productDescription,
  processingTime,
  openSection,
  onToggle,
  variant,
}: ProductAccordionProps) {
  const { t } = useT('product-details');

  const sections: { key: AccordionKey; title: string; content: React.ReactNode }[] = [
    {
      key: 'description',
      title: t('accordion.description.title'),
      content: (
        <div>
          <p className="text-[#5A5A5A] text-sm leading-relaxed mb-4">{productDescription}</p>
          <p className="text-[#5A5A5A] text-sm mt-1">
            <span className="text-[#1A1A1A]">{t('accordion.description.processingTime')}</span>{' '}
            {processingTime}
          </p>
        </div>
      ),
    },
    {
      key: 'shipping',
      title: t('accordion.shipping.title'),
      content: (
        <div className="text-sm text-[#5A5A5A] space-y-3 leading-relaxed">
          <p dangerouslySetInnerHTML={{ __html: t('accordion.shipping.worldwide') }} />
          <p dangerouslySetInnerHTML={{ __html: t('accordion.shipping.timing') }} />
          <p dangerouslySetInnerHTML={{ __html: t('accordion.shipping.freeThreshold') }} />
          <p dangerouslySetInnerHTML={{ __html: t('accordion.shipping.support') }} />
          <hr className="border-gray-200 my-2" />
          <div
            className="bg-gray-50 p-3 rounded-md italic text-xs border-l-2 border-red-400"
            dangerouslySetInnerHTML={{ __html: t('accordion.shipping.noRefund') }}
          />
        </div>
      ),
    },
  ];

  const wrapperClass =
    variant === 'desktop' ? 'space-y-0 hidden md:block' : 'md:hidden px-4 sm:px-6 mt-8 space-y-0';

  return (
    <div className={wrapperClass}>
      {sections.map((section) => (
        <div key={section.key} className="border-t border-[#F0F0F0]">
          <button
            onClick={() => onToggle(section.key)}
            aria-expanded={openSection === section.key}
            aria-controls={`accordion-${variant}-${section.key}`}
            className="w-full flex items-center justify-between py-4 text-[#1A1A1A] text-xs uppercase tracking-widest hover:opacity-70 transition-opacity"
            style={{ letterSpacing: '0.12em' }}
          >
            {section.title}
            {openSection === section.key ? (
              <ChevronUp className="size-4" aria-hidden />
            ) : (
              <ChevronDown className="size-4" aria-hidden />
            )}
          </button>

          <AnimatePresence initial={false}>
            {openSection === section.key && (
              <motion.div
                id={`accordion-${variant}-${section.key}`}
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pb-5">{section.content}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
      <div className="border-t border-[#F0F0F0]" />
    </div>
  );
});
