import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvConfiguration } from '@/config/configuration';

const RESEND_API_URL = 'https://api.resend.com/emails';
const FROM_ADDRESS = 'Silver14 Nail <noreply@silver14nail.com>';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService<EnvConfiguration>) {}

  async sendPasswordReset(to: string, rawToken: string): Promise<void> {
    const appUrl = this.configService.getOrThrow<string>('appUrl');
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

    await this.send({
      to,
      subject: 'Reset your Silver14 Nail password',
      html: this.passwordResetHtml(resetUrl),
    });
  }

  private async send(payload: { to: string; subject: string; html: string }): Promise<void> {
    const apiKey = this.configService.get<string>('resendApiKey');

    if (!apiKey) {
      this.logger.warn(`[Email skipped — no RESEND_API_KEY] To: ${payload.to} | Subject: ${payload.subject}`);
      return;
    }

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.error(`Resend API error ${response.status}: ${body}`);
      // Non-fatal — forgotPassword always returns the same success message to avoid enumeration
    }
  }

  private passwordResetHtml(resetUrl: string): string {
    return `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#111827">Password Reset</h2>
        <p style="color:#374151">Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}"
           style="display:inline-block;margin:16px 0;padding:12px 24px;background:#111827;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
          Reset Password
        </a>
        <p style="color:#6b7280;font-size:12px">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `;
  }
}
