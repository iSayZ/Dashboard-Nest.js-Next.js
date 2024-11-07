import { Injectable } from '@nestjs/common';
import { MailConfig } from './mail.config';
import { MailData } from './mail.types';
import { AdminAccount } from 'src/admin/schema/admin-account.schema';
import { AdminProfile } from 'src/admin/schema/admin-profile.schema';
import { render } from '@react-email/components';
import PasswordChangedEmail from './emails/PasswordChangedEmail';

@Injectable()
export class MailService {
  constructor(private readonly mailConfig: MailConfig) {}

  async sendMail(mailData: MailData) {
    const html = await render(mailData.template);

    const { transporter } = this.mailConfig.createMailerOptions();

    await transporter
      .sendMail({
        from: `${process.env.APP_NAME} <${process.env.SMTP_USER}>`,
        to: mailData.to,
        subject: mailData.subject,
        html: html,
      })
      .then((info) => {
        console.log('Message sent: %s', info.messageId);
      })
      .catch((error) => {
        console.error('Error sending email:', error);
      });
  }

  async sendConfirmPasswordChangeMail(
    account: AdminAccount,
    profile: AdminProfile,
    token: string
  ) {    
    try {
      const name = profile.firstname;
      const appName = process.env.APP_NAME;
      const appUrl = process.env.CLIENT_URL;
    
      const mailData: MailData = {
        to: account.email,
        subject: 'Changement de Mot de Passe',
        template: PasswordChangedEmail({ name, appName, appUrl, token })
      };
    
      await this.sendMail(mailData);
    } catch (error) {
      console.log(error);
    }
  }
}
