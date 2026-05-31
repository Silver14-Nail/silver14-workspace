import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvConfiguration } from '@/config/configuration';

const RESEND_API_URL = 'https://api.resend.com/emails';
const FROM_ADDRESS = 'Silver14 Nail <noreply@silver14nail.com>';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService<EnvConfiguration>) {}

  async sendNewsletterWelcome(to: string): Promise<void> {
    await this.send({
      to,
      subject: 'Welcome to Silver14 Nail ✨',
      html: this.newsletterWelcomeHtml(),
    });
  }

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

  private newsletterWelcomeHtml(): string {
    const appUrl = this.configService.get<string>('appUrl') ?? 'https://silver14nail.com';
    return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border:1px solid #E8E8E8">

        <!-- Header -->
        <tr>
          <td align="center" style="padding:40px 40px 32px;border-bottom:1px solid #F0F0F0">
            <p style="margin:0;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#9A9A9A">Handcrafted Press-On Nails</p>
            <h1 style="margin:8px 0 0;font-size:28px;font-weight:300;letter-spacing:0.06em;color:#1A1A1A">Silver14 Nail</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px">
            <p style="margin:0 0 16px;font-size:15px;color:#1A1A1A;font-weight:500">Thank you for subscribing.</p>
            <p style="margin:0 0 24px;font-size:14px;color:#5A5A5A;line-height:1.7">
              You're now part of the Silver14 Nail circle. We'll keep you in the loop on new collections,
              limited drops, and exclusive offers — delivered straight to your inbox.
            </p>
            <p style="margin:0 0 32px;font-size:14px;color:#5A5A5A;line-height:1.7">
              In the meantime, feel free to browse our latest press-on nail sets — each one handcrafted
              and made to order just for you.
            </p>
            <table cellpadding="0" cellspacing="0"><tr><td>
              <a href="${appUrl}/products"
                 style="display:inline-block;padding:13px 28px;background:#1A1A1A;color:#FFFFFF;text-decoration:none;font-size:11px;letter-spacing:0.18em;text-transform:uppercase">
                Explore Collection
              </a>
            </td></tr></table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #F0F0F0;background:#FAFAFA">
            <p style="margin:0;font-size:11px;color:#ADADAD;line-height:1.6">
              You're receiving this because you subscribed at silver14nail.com.<br>
              If this wasn't you, you can safely ignore this email.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
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
