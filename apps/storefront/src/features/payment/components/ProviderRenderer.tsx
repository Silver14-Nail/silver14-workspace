'use client';

import React, { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { PaymentProviderName, ProviderRendererProps } from '../types';

// ── Lazy-load renderers so each provider's SDK only loads when needed ──────────

const AirwallexRenderer = lazy(() =>
  import('./renderers/AirwallexRenderer').then((m) => ({ default: m.AirwallexRenderer })),
);

/**
 * Registry of provider → renderer component.
 *
 * Adding a new provider requires adding ONE entry here.
 * PaymentStep, useCheckoutPayment, and page.tsx are never touched.
 */
const RENDERER_MAP: Record<PaymentProviderName, React.ComponentType<ProviderRendererProps>> = {
  airwallex: AirwallexRenderer as React.ComponentType<ProviderRendererProps>,
};

// ── Loading fallback ──────────────────────────────────────────────────────────

function RendererSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <Loader2 className="size-6 text-[#4A7A5A] animate-spin" aria-hidden />
      <p className="text-[#9A9A9A] dark:text-[#6A6A6A] text-sm">Loading payment form…</p>
    </div>
  );
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

/**
 * Looks up the correct renderer for session.provider and renders it.
 *
 * Renderers are code-split — the provider's SDK only loads when the user
 * actually selects that payment method.
 *
 * All renderers receive the same ProviderRendererProps interface, so the
 * dispatcher never contains any provider-specific logic.
 */
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
