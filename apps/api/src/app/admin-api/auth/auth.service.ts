import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';

import { UserEntity } from '@/db/entities/auths/user.entity';
import { UserRole } from '@/common/enums/entity.enum';
import { EncryptUtils, TokenUtils } from '@/common/utils';
import type { EnvConfiguration } from '@/config/configuration';

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly configService: ConfigService<EnvConfiguration>,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userRepo.findOneBy({ email: email.toLowerCase().trim() });

    if (!user || user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    if (!user.passwordHash || !(await EncryptUtils.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.userRepo.update(user.id, { lastLoginAt: new Date() });

    return this.buildAuthResponse(user);
  }

  async refresh(refreshToken: string) {
    let payload: { userId: string };

    try {
      payload = TokenUtils.verify<{ userId: string }>(refreshToken, this.refreshSecret);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepo.findOneBy({ id: payload.userId });

    if (!user || user.role !== UserRole.ADMIN || !user.isActive) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.buildAuthResponse(user);
  }

  async getMe(userId: string) {
    const user = await this.userRepo.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepo.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.passwordHash || !(await EncryptUtils.compare(currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException('New password must be different from the current password');
    }

    await this.userRepo.update(user.id, { passwordHash: await EncryptUtils.hash(newPassword) });

    return { success: true };
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

  private buildAuthResponse(user: UserEntity) {
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

    return {
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: this.accessTokenExpiresIn,
        tokenType: 'Bearer' as const,
      },
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}
