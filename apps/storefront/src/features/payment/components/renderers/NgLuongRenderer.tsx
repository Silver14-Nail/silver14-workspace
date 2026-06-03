'use client';

import { useEffect } from 'react';
import { ExternalLink, Shield } from 'lucide-react';
import type { ProviderRendererProps } from '../../types';

export function NgLuongRenderer({ session, onError, onCancel }: ProviderRendererProps) {
  const { sessionData } = session;

  if (sessionData.mode !== 'redirect') {
    onError('NgLuong renderer received unexpected mode: ' + sessionData.mode);
    return null;
  }

  return <NgLuongRedirect url={sessionData.redirectUrl} onError={onError} onCancel={onCancel} />;
}

function NgLuongRedirect({
  url,
  onError,
  onCancel,
}: {
  url: string;
  onError: (err: string) => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.href = url;
    } else {
      onError('Cannot redirect in server environment');
    }
  }, [url, onError]);

  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <div
        className="size-10 border-2 border-[#E0E0E0] border-t-[#4A7A5A] rounded-full animate-spin"
        aria-hidden
      />
      <div>
        <p className="text-[#1A1A1A] dark:text-white text-sm font-medium mb-1">
          Redirecting to NgLuong...
        </p>
        <p className="text-[#9A9A9A] dark:text-[#6A6A6A] text-xs max-w-xs">
          You will be redirected to complete your payment via NgLuong.
        </p>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <a
          href={url}
          className="inline-flex items-center gap-1.5 text-[#4A7A5A] text-sm hover:underline"
        >
          Click here if you are not redirected
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
        <button
          type="button"
          onClick={onCancel}
          className="text-[#9A9A9A] dark:text-[#6A6A6A] text-xs hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
        >
          Cancel and choose another method
        </button>
      </div>
      <div className="flex items-center justify-center gap-2 text-[#9A9A9A] dark:text-[#6A6A6A] text-[11px] mt-4">
        <Shield className="size-3.5 text-[#4A7A5A] flex-shrink-0" aria-hidden />
        <span>Secured by NgLuong</span>
      </div>
    </div>
  );
}
