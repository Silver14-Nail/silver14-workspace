import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '@/db/entities/auths/user.entity';
import { UserRole } from '@/common/enums/entity.enum';
import { EncryptUtils, TokenUtils } from '@/common/utils';

const ACCESS_TOKEN_EXPIRES_IN = parseInt(process.env.TOKEN_EXPIRES || '3600');
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES || '7d';

@Injectable()
export class AdminAuthService {
  private get secret() {
    return process.env.SECRET_KEY || 'local-development-secret';
  }

  private get refreshSecret() {
    return `refresh_${this.secret}`;
  }

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userRepo.findOneBy({ email });

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
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['addresses'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private buildAuthResponse(user: UserEntity) {
    const accessToken = TokenUtils.generate(
      { userId: user.id },
      this.secret,
      ACCESS_TOKEN_EXPIRES_IN,
    );
    const refreshToken = TokenUtils.generate(
      { userId: user.id },
      this.refreshSecret,
      REFRESH_TOKEN_EXPIRES_IN,
    );

    return {
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
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
