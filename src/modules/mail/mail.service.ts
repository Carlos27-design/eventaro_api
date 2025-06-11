import { Injectable } from '@nestjs/common';
import * as mailer from 'nodemailer';
import { Subject } from 'rxjs';

@Injectable()
export class MailService {
  private transport: mailer.Transporter;

  constructor() {
    this.transport = mailer.createTransport({
      host: process.env.HOST_SMTP,
      port: +process.env.PORT_SMTP,
      secure: false,
      auth: {
        user: process.env.USER_SMTP,
        pass: process.env.PASSWORD_SMTP,
      },
    });
  }

  public async sendMail(options: {
    to: string;
    text?: string;
    subject: string;
    html: string;
  }) {
    const mailOptions = {
      from: `Eventaro: ${process.env.USER_SMTP}`,
      to: options.to,
      Subject: options.subject,
      text: options.text,
      html: options.html,
    };

    return await this.transport.sendMail(mailOptions);
  }
}
