'use client';

import React, { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { PaymentProviderName, ProviderRendererProps } from '../types';

const AirwallexRenderer = lazy(() =>
  import('./renderers/AirwallexRenderer').then((m) => ({ default: m.AirwallexRenderer })),
);
const NgLuongRenderer = lazy(() =>
  import('./renderers/NgLuongRenderer').then((m) => ({ default: m.NgLuongRenderer })),
);

const RENDERER_MAP: Record<PaymentProviderName, React.ComponentType<ProviderRendererProps>> = {
  airwallex: AirwallexRenderer as React.ComponentType<ProviderRendererProps>,
  ngan_luong: NgLuongRenderer as React.ComponentType<ProviderRendererProps>,
};

function RendererSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <Loader2 className="size-6 text-[#4A7A5A] animate-spin" aria-hidden />
      <p className="text-[#9A9A9A] dark:text-[#6A6A6A] text-sm">Loading payment form…</p>
    </div>
  );
}

export function ProviderRenderer(props: ProviderRendererProps) {
  const { provider } = props.session;
  const Renderer = RENDERER_MAP[provider];

  if (!Renderer) {
    return (
      <div className="py-8 text-center text-[#9A9A9A] dark:text-[#6A6A6A] text-sm">
        Payment provider &ldquo;{provider}&rdquo; is not configured.
      </div>
    );
  }

  return (
    <Suspense fallback={<RendererSkeleton />}>
      <Renderer {...props} />
    </Suspense>
  );
}
