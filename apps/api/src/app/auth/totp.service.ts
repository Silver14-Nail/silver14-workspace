import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

const TOTP_STEP_SECONDS = 30;
const TOTP_CODE_DIGITS = 6;

@Injectable()
export class TotpService {
  createSecret() {
    return this.encodeBase32(randomBytes(20));
  }

  createOtpAuthUrl({
    accountName,
    issuer,
    secret,
  }: {
    accountName: string;
    issuer: string;
    secret: string;
  }) {
    const params = new URLSearchParams({
      algorithm: 'SHA1',
      digits: String(TOTP_CODE_DIGITS),
      issuer,
      period: String(TOTP_STEP_SECONDS),
      secret,
    });

    return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(
      accountName,
    )}?${params.toString()}`;
  }

  verifyCode(secret: string, code: string) {
    const normalizedCode = code.replace(/\s/g, '');

    if (!/^\d{6}$/.test(normalizedCode)) {
      throw new UnauthorizedException('Invalid two-factor code');
    }

    const currentStep = Math.floor(Date.now() / 1000 / TOTP_STEP_SECONDS);
    const validCodes = [-1, 0, 1].map((offset) =>
      this.generateCode(secret, currentStep + offset),
    );

    const matched = validCodes.some((validCode) =>
      this.safeCompare(normalizedCode, validCode),
    );

    if (!matched) {
      throw new UnauthorizedException('Invalid two-factor code');
    }
  }

  private generateCode(secret: string, counter: number) {
    const key = this.decodeBase32(secret);
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigUInt64BE(BigInt(counter));

    const digest = createHmac('sha1', key).update(counterBuffer).digest();
    const offset = digest[digest.length - 1] & 0x0f;
    const binary =
      ((digest[offset] & 0x7f) << 24) |
      ((digest[offset + 1] & 0xff) << 16) |
      ((digest[offset + 2] & 0xff) << 8) |
      (digest[offset + 3] & 0xff);

    return String(binary % 10 ** TOTP_CODE_DIGITS).padStart(
      TOTP_CODE_DIGITS,
      '0',
    );
  }

  private decodeBase32(value: string) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const normalized = value.toUpperCase().replace(/=+$/g, '');
    let bits = '';

    for (const character of normalized) {
      const index = alphabet.indexOf(character);

      if (index === -1) {
        throw new UnauthorizedException('Invalid two-factor secret');
      }

      bits += index.toString(2).padStart(5, '0');
    }

    const bytes: number[] = [];

    for (let index = 0; index + 8 <= bits.length; index += 8) {
      bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
    }

    return Buffer.from(bytes);
  }

  private encodeBase32(value: Buffer) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    let output = '';

    for (const byte of value) {
      bits += byte.toString(2).padStart(8, '0');
    }

    for (let index = 0; index < bits.length; index += 5) {
      const chunk = bits.slice(index, index + 5).padEnd(5, '0');
      output += alphabet[Number.parseInt(chunk, 2)];
    }

    return output;
  }

  private safeCompare(left: string, right: string) {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    return (
      leftBuffer.length === rightBuffer.length &&
      timingSafeEqual(leftBuffer, rightBuffer)
    );
  }
}
