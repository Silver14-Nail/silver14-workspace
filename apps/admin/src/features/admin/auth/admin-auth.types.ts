export type AdminUser = {
  email: string;
  id: string;
  name: string;
  role: 'super_admin' | 'admin';
};

export type AdminAuthTokens = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  tokenType: 'Bearer';
};

export type LoginResponse = {
  tokens: AdminAuthTokens;
  user: AdminUser;
};

export type AdminTwoFactorChallenge = {
  challengeId: string;
  expiresIn: number;
  twoFactorRequired: true;
};

export type AdminLoginResponse = LoginResponse | AdminTwoFactorChallenge;

export type AdminTwoFactorSetup =
  | {
      enabled: true;
    }
  | {
      enabled: false;
      otpAuthUrl: string;
      setupKey: string;
    };
