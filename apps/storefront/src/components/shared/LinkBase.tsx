'use client';

import Link, { LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import i18nConfig from '@/i18n.config';

const fallbackLng = i18nConfig.fallbackLng;
const supportedLngs = i18nConfig.supportedLngs ?? [];

type Props = LinkProps & {
  lng?: string;
  children: ReactNode;
  className?: string;
};

export const LinkBase = ({ lng, href, children, ...props }: Props) => {
  const pathname = usePathname();
  const currentLng = pathname.split('/').filter(Boolean)[0];
  const activeLng = lng ?? (supportedLngs.includes(currentLng) ? currentLng : fallbackLng);
  const normalizedHref =
    typeof href === 'string' ? `/${activeLng}${href.startsWith('/') ? href : `/${href}`}` : href;

  return (
    <Link href={normalizedHref} {...props}>
      {children}
    </Link>
  );
};
