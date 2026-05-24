import type { ReactNode } from 'react';
import { initServerI18next } from 'next-i18next/server';
import i18nConfig from '../i18n.config';

// Must be called at root-layout scope so the server i18n module is
// initialised before any page calls getT(). Placing it only in
// [lng]/layout.tsx is not reliable because Next.js App Router treats
// each segment as an independent bundle entry point.
initServerI18next(i18nConfig);

export default function RootLayout({ children }: { children: ReactNode }) {
  return children as React.ReactElement;
}
