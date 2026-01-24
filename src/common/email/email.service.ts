import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter | null = null;
  private from: string;
  private enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.enabled =
      this.configService.get<string>('MAIL_ENABLED')?.toLowerCase() === 'true';
    this.from =
      this.configService.get<string>('MAIL_FROM') ?? 'Hayah <noreply@example.com>';

    if (this.enabled) {
      const host = this.configService.get<string>('MAIL_HOST');
      const port = parseInt(
        this.configService.get<string>('MAIL_PORT') ?? '587',
        10,
      );
      const user = this.configService.get<string>('MAIL_USER');
      const pass = this.configService.get<string>('MAIL_PASSWORD');

      if (host && user && pass) {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        });
      } else {
        this.enabled = false;
      }
    }
  }

  isEnabled(): boolean {
    return this.enabled && this.transporter != null;
  }

  /**
   * Send a notification email. No-op if email is disabled or not configured.
   */
  async sendNotificationEmail(
    to: string,
    subject: string,
    text: string,
  ): Promise<void> {
    if (!this.isEnabled()) return;

    try {
      await this.transporter!.sendMail({
        from: this.from,
        to,
        subject: `[Hayah] ${subject}`,
        text,
        html: `<!DOCTYPE html><html><body><p>${escapeHtml(text)}</p><br/><p><em>— Hayah</em></p></body></html>`,
      });
    } catch (err) {
      // Log but do not throw; email failure must not break notification creation
      console.error('[EmailService] Failed to send notification email:', err);
    }
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br/>');
}
