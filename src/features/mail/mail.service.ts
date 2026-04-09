import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private etherealTransporter: nodemailer.Transporter | null = null;
  private etherealInitPromise: Promise<void> | null = null;

  constructor(private readonly configService: ConfigService) {
    this.transporter = this.createTransporter();
  }

  private createTransporter(): nodemailer.Transporter {
    const service = this.configService.get<string>('SMTP_SERVICE');
    const host = this.configService.get<string>('SMTP_HOST');
    const portRaw = this.configService.get<string>('SMTP_PORT');
    const port = portRaw ? parseInt(portRaw, 10) : 587;
    const secure = port === 465;

    const options = service
      ? { service, auth: { user: this.configService.get('SMTP_USER'), pass: this.configService.get('SMTP_PASSWORD') } }
      : {
          host: host ?? 'localhost',
          port,
          secure,
          auth: {
            user: this.configService.get<string>('SMTP_USER'),
            pass: this.configService.get<string>('SMTP_PASSWORD'),
          },
        };

    return nodemailer.createTransport(options as nodemailer.TransportOptions);
  }

  /**
   * When MAIL_USE_ETHEREAL=true (e.g. in dev when Gmail DNS fails with EDNS),
   * use Ethereal test inbox so no real SMTP is needed. Preview URL is logged.
   */
  private async getTransporter(): Promise<nodemailer.Transporter> {
    const useEthereal = this.configService.get<string>('MAIL_USE_ETHEREAL') === 'true';
    if (!useEthereal) return this.transporter;

    if (this.etherealTransporter) return this.etherealTransporter;
    if (!this.etherealInitPromise) {
      this.etherealInitPromise = (async () => {
        const account = await nodemailer.createTestAccount();
        this.etherealTransporter = nodemailer.createTransport({
          host: account.smtp.host,
          port: account.smtp.port,
          secure: account.smtp.secure,
          auth: { user: account.user, pass: account.pass },
        });
        this.logger.log(
          `Ethereal test account ready: ${account.user} (preview at ${account.web})`,
        );
      })();
    }
    await this.etherealInitPromise;
    return this.etherealTransporter!;
  }

  /**
   * Send password reset email. Uses both text and html per Nodemailer message docs.
   */
  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? '';
    const fromEmail =
      this.configService.get<string>('SMTP_FROM_EMAIL') ??
      this.configService.get<string>('SMTP_USER');
    if (!fromEmail) {
      throw new Error(
        'Mail from address is missing: set SMTP_FROM_EMAIL or SMTP_USER',
      );
    }
    const resetUrl = `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${resetToken}`;

    const text =
      'You requested a password reset.\n\n' +
      `Open this link to set a new password: ${resetUrl}\n\n` +
      'This link expires in 1 hour.\n' +
      "If you didn't request this, please ignore this email.";

    const html = [
      '<p>You requested a password reset.</p>',
      '<p>Click the link below to set a new password:</p>',
      `<p><a href="${resetUrl}" target="_blank">Reset Password</a></p>`,
      '<p>This link expires in 1 hour.</p>',
      "<p>If you didn't request this, please ignore this email.</p>",
    ].join('\n');

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Hayah Support" <${fromEmail}>`,
      to,
      subject: 'Reset Your Password',
      text,
      html,
    };

    try {
      const transport = await this.getTransporter();
      const info = await transport.sendMail(mailOptions);
      if (this.configService.get<string>('MAIL_USE_ETHEREAL') === 'true') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          this.logger.log(`Preview password reset email: ${previewUrl}`);
        }
      }
    } catch (err: any) {
      const code = err?.code as string | undefined;
      const message = err?.message ?? String(err);
      this.logger.warn(`Send mail failed: ${message}`, { code, to: mailOptions.to });
      throw err;
    }
  }
}
