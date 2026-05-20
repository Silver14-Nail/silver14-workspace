import type { ReactNode } from 'react';

/**
 * Next.js App Router requires a root layout at app/layout.tsx.
 * All locale-specific structure (html, body, providers, fonts) lives in
 * app/[lng]/layout.tsx, which renders the full document shell for every
 * locale segment. This root layout is a required passthrough entry point.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children as React.ReactElement;
}
