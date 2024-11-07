import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface MailerOptions {
  transporter: nodemailer.Transporter;
}

@Injectable()
export class MailConfig {
  constructor(private configService: ConfigService) {}

  createMailerOptions(): MailerOptions {
    return {
      transporter: nodemailer.createTransport({
        host: this.configService.get<string>('SMTP_HOST'),
        port: parseInt(this.configService.get<string>('SMTP_PORT')),
        secure: this.configService.get<string>('SMTP_SECURE') === 'true',
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      }),
    };
  }
}
