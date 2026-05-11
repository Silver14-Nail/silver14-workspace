export type CustomerUser = {
  email: string;
  id: string;
  name: string;
  role: 'customer';
};

export type CustomerAuthTokens = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  tokenType: 'Bearer';
};

export type CustomerAuthResponse = {
  tokens: CustomerAuthTokens;
  user: CustomerUser;
};
