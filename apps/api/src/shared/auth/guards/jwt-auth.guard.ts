import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '@/db/entities/auths/user.entity';
import { UserRole } from '@/common/enums/entity.enum';
import { TokenUtils } from '@/common/utils';
import type { EnvConfiguration } from '@/config/configuration';
import type { AuthenticatedRequest } from '../auth.types';
import { AuthService } from '../auth.service';
import { TokenService } from '../token.service';

type RequestWithHeaders = AuthenticatedRequest & {
  headers?: Record<string, string | string[] | undefined>;
};

// Admin-only guard — still uses the legacy TokenService (custom HMAC) + mock AuthService
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestWithHeaders>();
    const token = extractBearerToken(request.headers?.authorization);
    const payload = this.tokenService.verify(token, 'access');

    request.user = this.authService.getAdminByTokenSubject(payload.sub);

    return true;
  }
}

// Customer guard — DB-backed, uses the same jsonwebtoken format as ClientAuthService
@Injectable()
export class CustomerJwtAuthGuard implements CanActivate {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly configService: ConfigService<EnvConfiguration>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithHeaders>();
    const token = extractBearerToken(request.headers?.authorization);

    let payload: { userId: string };
    try {
      payload = TokenUtils.verify<{ userId: string }>(token, this.secret);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.userRepo.findOneBy({ id: payload.userId });

    if (!user || !user.isActive || user.role !== UserRole.CUSTOMER) {
      throw new UnauthorizedException('Invalid token');
    }

    request.user = { id: user.id, email: user.email, name: user.fullName, role: user.role };
    return true;
  }

  private get secret(): string {
    return this.configService.getOrThrow<string>('secret');
  }
}

// Optional customer guard — treats missing/invalid token as guest (no error thrown)
@Injectable()
export class OptionalCustomerJwtAuthGuard implements CanActivate {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly configService: ConfigService<EnvConfiguration>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithHeaders>();
    const authHeader = request.headers?.authorization;

    if (!authHeader) return true;

    try {
      const token = extractBearerToken(authHeader);
      const payload = TokenUtils.verify<{ userId: string }>(token, this.secret);
      const user = await this.userRepo.findOneBy({ id: payload.userId });

      if (user && user.isActive && user.role === UserRole.CUSTOMER) {
        request.user = { id: user.id, email: user.email, name: user.fullName, role: user.role };
      }
    } catch {
      // Invalid/expired token — treat as unauthenticated guest
    }

    return true;
  }

  private get secret(): string {
    return this.configService.getOrThrow<string>('secret');
  }
}

function extractBearerToken(authorizationHeader: string | string[] | undefined) {
  const header = Array.isArray(authorizationHeader) ? authorizationHeader[0] : authorizationHeader;
  const [scheme, token] = header?.split(' ') ?? [];

  if (scheme !== 'Bearer' || !token) {
    throw new UnauthorizedException('Missing bearer token');
  }

  return token;
}
