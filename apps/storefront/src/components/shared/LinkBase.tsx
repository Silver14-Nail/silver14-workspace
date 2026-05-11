import Link, { LinkProps } from 'next/link';
import { ReactNode } from 'react';
import i18nConfig from '@/i18n.config';

const fallbackLng = i18nConfig.fallbackLng;

type Props = LinkProps & {
  lng?: string;
  children: ReactNode;
  className?: string;
};

export const LinkBase = ({ lng = fallbackLng, href, children, ...props }: Props) => {
  const normalizedHref =
    typeof href === 'string' ? `/${lng}${href.startsWith('/') ? href : `/${href}`}` : href;

  return (
    <Link href={normalizedHref} {...props}>
      {children}
    </Link>
  );
};
