import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class MailerService {
  constructor(private readonly configService: ConfigService) {
    process.nextTick(() => {
      const config = this.resolveConfig();
      if (!config) {
        return;
      }
      this.transporter = createTransport({
        host: config.smtp,
        auth: {
          user: config.user,
          pass: config.imap,
        },
        port: 465, // ssl 465; no-ssl 587,
        secure: true,
        tls: {
          servername: config.smtp,
        },
      });
    });
  }

  private transporter: Transporter | null = null;

  private resolveConfig() {
    const smtp = this.configService.get<string>('QQ_MAILER_SMTP');
    const imap = this.configService.get<string>('QQ_MAILER_IMAP');
    const user = this.configService.get<string>('QQ_MAILER_USER');
    if (!smtp || !imap || !user) {
      return null;
    }
    return { smtp, imap, user };
  }

  sendMeil(
    subject: string,
    html: string,
    to: string | string[] = '157050890@qq.com',
  ) {
    const transporter = this.transporter;
    const config = this.resolveConfig();
    if (!transporter || !config) {
      return Promise.resolve(false);
    }

    return new Promise<boolean>((resolve, reject) => {
      try {
        transporter.sendMail(
          {
            from: config.user,
            to,
            subject,
            html,
          },
          (err, info) => {
            if (err) {
              return reject(err);
            }
            resolve(true);
          },
        );
      } catch (err) {
        reject(err);
      }
    });
  }
}
