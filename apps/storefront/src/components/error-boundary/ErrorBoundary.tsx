'use client';

import React, { Component, type ReactNode } from 'react';
import { logger } from '../../lib/logger';

interface FallbackProps {
  error: Error;
  reset: () => void;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((props: FallbackProps) => ReactNode);
  context?: string;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    const ctx = this.props.context ?? 'ErrorBoundary';
    logger.error(
      `React error in ${ctx}: ${error.message}`,
      { componentStack: info.componentStack },
      ctx,
    );
    this.props.onError?.(error, info);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    if (this.state.error) {
      const { fallback } = this.props;
      if (typeof fallback === 'function') {
        return fallback({ error: this.state.error, reset: this.reset });
      }
      if (fallback) return fallback;
      return <DefaultFallback reset={this.reset} />;
    }
    return this.props.children;
  }
}

function DefaultFallback({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[160px] p-6 text-center">
      <p className="text-sm text-gray-500 mb-4">Something went wrong loading this section.</p>
      <button
        onClick={reset}
        className="text-sm underline text-gray-700 hover:text-gray-900 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

// ── Convenience wrappers ───────────────────────────────────────────────────────

export function FeatureBoundary({
  children,
  context,
}: {
  children: ReactNode;
  context?: string;
}) {
  return <ErrorBoundary context={context ?? 'FeatureBoundary'}>{children}</ErrorBoundary>;
}

export function PageBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      context="PageBoundary"
      fallback={({ reset }) => (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-500 mb-6">
            An unexpected error occurred. Your session is intact.
          </p>
          <button
            onClick={reset}
            className="px-5 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors"
          >
            Try again
          </button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
