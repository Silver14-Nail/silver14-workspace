import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';

import { UserEntity } from '@/db/entities/auths/user.entity';
import { UserDto } from '@/common/dtos/auths/user.dto';
import { CookieUtils, TokenUtils } from '@/common/utils';
import { InvalidTokenError, TokenExpiredError } from '@/common/errors/jwt-token.error';
import { EnvConfiguration } from '@/config/configuration';
import { GenerateTokenReturn } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService<EnvConfiguration>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async validateRequest(req: Request): Promise<UserDto> {
    const authHeader = req.headers['authorization'] as string | undefined;
    const accessToken = authHeader
      ? TokenUtils.bearerSchemaToToken(authHeader)
      : CookieUtils.getToken(req);

    if (!accessToken) {
      throw new InvalidTokenError();
    }

    return this.validateToken(accessToken);
  }

  async validateToken(token: string): Promise<UserDto> {
    const payload = TokenUtils.verify<{ userId: string }>(
      token,
      this.configService.getOrThrow<string>('secret'),
    );
    const user = await this.userRepository.findOneBy({ id: payload.userId });
    if (!user || !user.isActive) {
      throw new InvalidTokenError();
    }
    return new UserDto(user);
  }

  async generateToken(user: UserDto): Promise<GenerateTokenReturn> {
    const secret = this.configService.getOrThrow<string>('secret');
    const accessToken = TokenUtils.generate(
      { userId: user.id },
      secret,
      this.configService.getOrThrow<number>('tokenExpires'),
    );
    const refreshToken = TokenUtils.generate(
      { userId: user.id },
      `refresh_${secret}`,
      this.configService.getOrThrow<number>('refreshTokenExpires'),
    );
    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string): Promise<GenerateTokenReturn> {
    try {
      const payload = TokenUtils.verify<{ userId: string }>(
        refreshToken,
        `refresh_${this.configService.getOrThrow<string>('secret')}`,
      );
      const user = await this.userRepository.findOneBy({ id: payload.userId });
      if (!user || !user.isActive) throw new InvalidTokenError();
      return this.generateToken(new UserDto(user));
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') throw new TokenExpiredError();
      throw new InvalidTokenError();
    }
  }
}
