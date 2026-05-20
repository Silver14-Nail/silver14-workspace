const KEYS = { ACCESS: 'admin_access_token', REFRESH: 'admin_refresh_token' } as const;

export const TokenStorage = {
  getAccessToken: (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem(KEYS.ACCESS) : null,

  getRefreshToken: (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem(KEYS.REFRESH) : null,

  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(KEYS.ACCESS, accessToken);
    localStorage.setItem(KEYS.REFRESH, refreshToken);
  },

  clear: (): void => {
    localStorage.removeItem(KEYS.ACCESS);
    localStorage.removeItem(KEYS.REFRESH);
  },
};
