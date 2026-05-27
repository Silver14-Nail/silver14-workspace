import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash, randomBytes } from 'crypto';
import type { Request, Response } from 'express';

import { UserEntity } from '@/db/entities/auths/user.entity';
import { PasswordResetEntity } from '@/db/entities/auths/password-resets.entity';
import { UserRole } from '@/common/enums/entity.enum';
import { EncryptUtils, TokenUtils } from '@/common/utils';
import type { EnvConfiguration } from '@/config/configuration';
import { EmailService } from '@/shared/email/email.service';

const REFRESH_COOKIE = 'customer_rt';
const AUTH_HINT_COOKIE = 'customer_auth';
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

@Injectable()
export class ClientAuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(PasswordResetEntity)
    private readonly resetRepo: Repository<PasswordResetEntity>,
    private readonly configService: ConfigService<EnvConfiguration>,
    private readonly emailService: EmailService,
  ) {}

  async register(email: string, password: string, name: string, res: Response) {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await this.userRepo.findOneBy({ email: normalizedEmail });

    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await EncryptUtils.hash(password);
    const user = this.userRepo.create({
      email: normalizedEmail,
      fullName: name,
      passwordHash,
      role: UserRole.CUSTOMER,
    });

    await this.userRepo.save(user);
    return this.buildResponseAndSetCookies(user, res);
  }

  async login(email: string, password: string, res: Response) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepo.findOneBy({ email: normalizedEmail });

    if (!user || user.role !== UserRole.CUSTOMER) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    if (!user.passwordHash || !(await EncryptUtils.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.userRepo.update(user.id, { lastLoginAt: new Date() });
    return this.buildResponseAndSetCookies(user, res);
  }

  logout(res: Response) {
    this.clearAuthCookies(res);
    return { message: 'Logged out successfully' };
  }

  async refresh(req: Request, res: Response) {
    const refreshToken: string | undefined = req.cookies?.[REFRESH_COOKIE];

    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    let payload: { userId: string };
    try {
      payload = TokenUtils.verify<{ userId: string }>(refreshToken, this.refreshSecret);
    } catch {
      this.clearAuthCookies(res);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userRepo.findOneBy({ id: payload.userId });

    if (!user || user.role !== UserRole.CUSTOMER || !user.isActive) {
      this.clearAuthCookies(res);
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.buildResponseAndSetCookies(user, res);
  }

  async getMe(userId: string) {
    const user = await this.userRepo.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toUserDto(user);
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findOneBy({ email: email.toLowerCase().trim() });

    if (!user || user.role !== UserRole.CUSTOMER) {
      // Prevent email enumeration — always return the same response
      return { message: 'If that email is registered, a reset link has been sent' };
    }

    // Invalidate all existing active tokens for this user
    await this.resetRepo.update({ user: { id: user.id }, isUsed: false }, { isUsed: true });

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const reset = this.resetRepo.create({
      user,
      tokenHash,
      isUsed: false,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });

    await this.resetRepo.save(reset);

    await this.emailService.sendPasswordReset(user.email, rawToken);

    return { message: 'If that email is registered, a reset link has been sent' };
  }

  async resetPassword(rawToken: string, newPassword: string) {
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const reset = await this.resetRepo.findOne({
      where: { tokenHash, isUsed: false },
      relations: { user: true },
    });

    if (!reset || reset.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const passwordHash = await EncryptUtils.hash(newPassword);
    await this.userRepo.update(reset.user.id, { passwordHash });
    await this.resetRepo.update(reset.id, { isUsed: true });

    return { message: 'Password reset successfully' };
  }

  private buildResponseAndSetCookies(user: UserEntity, res: Response) {
    const accessToken = TokenUtils.generate(
      { userId: user.id },
      this.secret,
      this.accessTokenExpiresIn,
    );
    const refreshToken = TokenUtils.generate(
      { userId: user.id },
      this.refreshSecret,
      this.refreshTokenExpiresIn,
    );

    this.setAuthCookies(res, refreshToken);

    return {
      tokens: {
        accessToken,
        expiresIn: this.accessTokenExpiresIn,
        tokenType: 'Bearer' as const,
      },
      user: this.toUserDto(user),
    };
  }

  private setAuthCookies(res: Response, refreshToken: string) {
    const isProduction = this.configService.get('nodeEnv') === 'production';
    const maxAge = this.refreshTokenExpiresIn * 1000;

    res.cookie(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge,
      path: '/api/client-api/auth',
    });

    // Readable by Next.js middleware to gate protected routes (no actual token value)
    res.cookie(AUTH_HINT_COOKIE, '1', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge,
      path: '/',
    });
  }

  private clearAuthCookies(res: Response) {
    res.clearCookie(REFRESH_COOKIE, { path: '/api/client-api/auth' });
    res.clearCookie(AUTH_HINT_COOKIE, { path: '/' });
  }

  private toUserDto(user: UserEntity) {
    return {
      id: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role,
    };
  }

  private get secret(): string {
    return this.configService.getOrThrow<string>('secret');
  }

  private get refreshSecret(): string {
    return `refresh_${this.secret}`;
  }

  private get accessTokenExpiresIn(): number {
    return this.configService.getOrThrow<number>('tokenExpires');
  }

  private get refreshTokenExpiresIn(): number {
    return this.configService.getOrThrow<number>('refreshTokenExpires');
  }
}
