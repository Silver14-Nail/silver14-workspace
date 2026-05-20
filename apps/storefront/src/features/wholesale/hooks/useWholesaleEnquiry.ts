'use client';

import { useMutation } from '@tanstack/react-query';
import { wholesaleApi } from '../wholesale.api';
import type { SubmitEnquiryInput } from '../wholesale.types';

export function useWholesaleEnquiry() {
  const mutation = useMutation({
    mutationFn: (data: SubmitEnquiryInput) => wholesaleApi.submitEnquiry(data),
  });

  return {
    submit: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
    reset: mutation.reset,
  };
}
