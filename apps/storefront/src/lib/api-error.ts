export interface ApiErrorShape {
  success: false;
  message: string;
  errorCode: string;
  statusCode: number;
}

export interface NetworkErrorShape {
  type: 'network';
  message: string;
}

export type NormalizedError = ApiErrorShape | NetworkErrorShape;

export function isApiError(err: unknown): err is ApiErrorShape {
  return (
    typeof err === 'object' &&
    err !== null &&
    'success' in err &&
    (err as any).success === false &&
    'errorCode' in err
  );
}

export function isNetworkError(err: unknown): err is NetworkErrorShape {
  return typeof err === 'object' && err !== null && (err as any).type === 'network';
}

export function normalizeApiError(error: unknown): NormalizedError {
  // Already a normalized API error
  if (isApiError(error)) return error;

  // Fetch TypeError (network failure, CORS, DNS)
  if (
    error instanceof TypeError &&
    (error.message.includes('fetch') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError'))
  ) {
    return { type: 'network', message: 'Network error. Please check your connection.' };
  }

  // Response-like object (e.g. thrown fetch Response)
  if (error && typeof error === 'object' && 'status' in error) {
    const r = error as { status: number; message?: string; errorCode?: string };
    return {
      success: false,
      message: r.message ?? 'An error occurred. Please try again.',
      errorCode: r.errorCode ?? `HTTP_${r.status}`,
      statusCode: r.status,
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      message: error.message || 'An unexpected error occurred.',
      errorCode: 'CLIENT_ERROR',
      statusCode: 0,
    };
  }

  return {
    success: false,
    message: 'An unexpected error occurred.',
    errorCode: 'UNKNOWN',
    statusCode: 0,
  };
}

export function getErrorMessage(error: unknown): string {
  const normalized = normalizeApiError(error);
  return normalized.message;
}
