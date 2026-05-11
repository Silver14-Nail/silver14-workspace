import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedUser, AuthTokens } from './auth.types';
import { accessTokenTtlSeconds, TokenService } from './token.service';
import { TotpService } from './totp.service';
import {
  addMockCustomerUser,
  mockAuthUsers,
  mockCustomerUsers,
  type MockAuthUser,
} from './mock-users';

const TWO_FACTOR_CHALLENGE_TTL_MS = 5 * 60 * 1000;

type TwoFactorChallenge = {
  expiresAt: number;
  userId: string;
};

@Injectable()
export class AuthService {
  private readonly twoFactorChallenges = new Map<string, TwoFactorChallenge>();

  constructor(
    private readonly tokenService: TokenService,
    private readonly totpService: TotpService,
  ) {}

  login(email: string, password: string) {
    // TODO(database): replace this file lookup with a users/admin_accounts table query.
    // The password check should also move to a hashed-password comparison there.
    const user = mockAuthUsers.find(
      (item) => item.email.toLowerCase() === email.toLowerCase(),
    );

    if (!user || user.password !== password || user.status !== 'active') {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.twoFactorEnabled && user.twoFactorSecret) {
      return this.createTwoFactorChallenge(user);
    }

    return this.createAuthResponse(user);
  }

  verifyAdminTwoFactor(challengeId: string, code: string) {
    const challenge = this.twoFactorChallenges.get(challengeId);

    if (!challenge || challenge.expiresAt < Date.now()) {
      this.twoFactorChallenges.delete(challengeId);
      throw new UnauthorizedException('Two-factor challenge has expired');
    }

    const user = mockAuthUsers.find((item) => item.id === challenge.userId);

    if (!user || !user.twoFactorSecret || user.status !== 'active') {
      throw new UnauthorizedException('Invalid two-factor challenge');
    }

    this.totpService.verifyCode(user.twoFactorSecret, code);
    this.twoFactorChallenges.delete(challengeId);

    return this.createAuthResponse(user);
  }

  createAdminTwoFactorSetup(userId: string) {
    const user = this.findActiveAdminUser(userId);

    if (user.twoFactorEnabled) {
      return {
        enabled: true,
      };
    }

    user.pendingTwoFactorSecret =
      user.pendingTwoFactorSecret ?? this.totpService.createSecret();

    return {
      enabled: false,
      otpAuthUrl: this.totpService.createOtpAuthUrl({
        accountName: user.email,
        issuer: 'Silver14 Nail Admin',
        secret: user.pendingTwoFactorSecret,
      }),
      setupKey: user.pendingTwoFactorSecret,
    };
  }

  enableAdminTwoFactor(userId: string, code: string) {
    const user = this.findActiveAdminUser(userId);

    if (!user.pendingTwoFactorSecret) {
      throw new UnauthorizedException('Two-factor setup has not started');
    }

    this.totpService.verifyCode(user.pendingTwoFactorSecret, code);

    // TODO(database): encrypt this secret before saving it in the admin_accounts table.
    user.twoFactorSecret = user.pendingTwoFactorSecret;
    user.pendingTwoFactorSecret = undefined;
    user.twoFactorEnabled = true;

    return {
      enabled: true,
    };
  }

  registerCustomer(email: string, password: string, name: string) {
    // TODO(database): replace this duplicate check and insert with a customers/users table.
    const normalizedEmail = email.toLowerCase();
    const existingUser = mockCustomerUsers.find(
      (item) => item.email.toLowerCase() === normalizedEmail,
    );

    if (existingUser) {
      throw new ConflictException('Customer email already exists');
    }

    const user = addMockCustomerUser({
      email: normalizedEmail,
      name,
      password,
    });

    return this.createAuthResponse(user);
  }

  loginCustomer(email: string, password: string) {
    // TODO(database): replace this file lookup with a customers/users table query.
    // The password check should move to a hashed-password comparison there.
    const user = mockCustomerUsers.find(
      (item) => item.email.toLowerCase() === email.toLowerCase(),
    );

    if (!user || user.password !== password || user.status !== 'active') {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.createAuthResponse(user);
  }

  refreshCustomer(refreshToken: string) {
    const payload = this.tokenService.verify(refreshToken, 'refresh');
    // TODO(database): replace this file lookup with a customer lookup by token subject.
    const user = mockCustomerUsers.find((item) => item.id === payload.sub);

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.createAuthResponse(user);
  }

  refresh(refreshToken: string) {
    const payload = this.tokenService.verify(refreshToken, 'refresh');
    // TODO(database): replace this file lookup with a user lookup by token subject.
    // If refresh tokens are persisted later, validate the token id/session here too.
    const user = mockAuthUsers.find((item) => item.id === payload.sub);

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.createAuthResponse(user);
  }

  getUserByTokenSubject(userId: string): AuthenticatedUser {
    // TODO(database): replace this file lookup with a user lookup by access-token subject.
    const user = [...mockAuthUsers, ...mockCustomerUsers].find(
      (item) => item.id === userId,
    );

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('Invalid access token');
    }

    return this.toAuthenticatedUser(user);
  }

  getAdminByTokenSubject(userId: string): AuthenticatedUser {
    return this.toAuthenticatedUser(this.findActiveAdminUser(userId));
  }

  getCustomerByTokenSubject(userId: string): AuthenticatedUser {
    const user = mockCustomerUsers.find((item) => item.id === userId);

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('Invalid customer access token');
    }

    return this.toAuthenticatedUser(user);
  }

  private createAuthResponse(user: MockAuthUser) {
    return {
      tokens: {
        accessToken: this.tokenService.createAccessToken(user),
        expiresIn: accessTokenTtlSeconds,
        refreshToken: this.tokenService.createRefreshToken(user),
        tokenType: 'Bearer',
      } satisfies AuthTokens,
      user: this.toAuthenticatedUser(user),
    };
  }

  private createTwoFactorChallenge(user: MockAuthUser) {
    const challengeId = `2fa-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;

    this.twoFactorChallenges.set(challengeId, {
      expiresAt: Date.now() + TWO_FACTOR_CHALLENGE_TTL_MS,
      userId: user.id,
    });

    return {
      challengeId,
      expiresIn: Math.floor(TWO_FACTOR_CHALLENGE_TTL_MS / 1000),
      twoFactorRequired: true,
    };
  }

  private findActiveAdminUser(userId: string) {
    const user = mockAuthUsers.find((item) => item.id === userId);

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('Invalid admin access token');
    }

    return user;
  }

  private toAuthenticatedUser(user: MockAuthUser): AuthenticatedUser {
    return {
      email: user.email,
      id: user.id,
      name: user.name,
      role: user.role,
    };
  }
}
