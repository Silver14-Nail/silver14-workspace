export type CustomerUser = {
  email: string;
  id: string;
  name: string;
  role: string;
};

// Refresh token is stored in an httpOnly cookie by the API — not persisted client-side
export type CustomerAuthTokens = {
  accessToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
};

export type CustomerAuthResponse = {
  tokens: CustomerAuthTokens;
  user: CustomerUser;
};

export type ForgotPasswordResponse = {
  message: string;
};

export type ResetPasswordResponse = {
  message: string;
};
