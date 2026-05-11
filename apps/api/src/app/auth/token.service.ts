import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import type { AuthTokenPayload, TokenType } from './auth.types';
import type { MockAuthUser } from './mock-users';

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

@Injectable()
export class TokenService {
  createAccessToken(user: MockAuthUser) {
    return this.sign(user, 'access', ACCESS_TOKEN_TTL_SECONDS);
  }

  createRefreshToken(user: MockAuthUser) {
    return this.sign(user, 'refresh', REFRESH_TOKEN_TTL_SECONDS);
  }

  verify(token: string, expectedType: TokenType): AuthTokenPayload {
    const [encodedHeader, encodedPayload, signature] = token.split('.');

    if (!encodedHeader || !encodedPayload || !signature) {
      throw new UnauthorizedException('Invalid token format');
    }

    const expectedSignature = this.createSignature(
      `${encodedHeader}.${encodedPayload}`,
    );

    if (!this.safeCompare(signature, expectedSignature)) {
      throw new UnauthorizedException('Invalid token signature');
    }

    const payload = this.parsePayload(encodedPayload);

    if (payload.type !== expectedType) {
      throw new UnauthorizedException('Invalid token type');
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Token has expired');
    }

    return payload;
  }

  private sign(user: MockAuthUser, type: TokenType, ttlSeconds: number) {
    const issuedAt = Math.floor(Date.now() / 1000);
    const payload: AuthTokenPayload = {
      email: user.email,
      exp: issuedAt + ttlSeconds,
      iat: issuedAt,
      role: user.role,
      sub: user.id,
      type,
    };
    const encodedHeader = this.base64UrlEncode(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
    );
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const signature = this.createSignature(`${encodedHeader}.${encodedPayload}`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private createSignature(value: string) {
    return createHmac('sha256', this.getSecret())
      .update(value)
      .digest('base64url');
  }

  private safeCompare(left: string, right: string) {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    return (
      leftBuffer.length === rightBuffer.length &&
      timingSafeEqual(leftBuffer, rightBuffer)
    );
  }

  private base64UrlEncode(value: string) {
    return Buffer.from(value).toString('base64url');
  }

  private base64UrlDecode(value: string) {
    return Buffer.from(value, 'base64url').toString('utf8');
  }

  private parsePayload(encodedPayload: string): AuthTokenPayload {
    try {
      const payload = JSON.parse(
        this.base64UrlDecode(encodedPayload),
      ) as Partial<AuthTokenPayload>;

      if (
        typeof payload.email !== 'string' ||
        typeof payload.exp !== 'number' ||
        typeof payload.iat !== 'number' ||
        typeof payload.role !== 'string' ||
        typeof payload.sub !== 'string' ||
        (payload.type !== 'access' && payload.type !== 'refresh')
      ) {
        throw new Error('Invalid token payload shape');
      }

      return payload as AuthTokenPayload;
    } catch {
      throw new UnauthorizedException('Invalid token payload');
    }
  }

  private getSecret() {
    return process.env.JWT_SECRET || 'local-development-jwt-secret';
  }
}

export const accessTokenTtlSeconds = ACCESS_TOKEN_TTL_SECONDS;
