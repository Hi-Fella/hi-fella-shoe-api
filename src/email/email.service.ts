import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(@InjectQueue('email') private emailQueue: Queue) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private compileTemplate(templateName: string, data: any): string {
    const templatePath = path.join(
      __dirname,
      'templates',
      `${templateName}.hbs`,
    );
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateSource);
    return template(data);
  }

  async sendTestEmail(): Promise<void> {
    const data = {
      name: 'Test User',
      message: 'This is a test email from our Hi-Fella Shoe!',
      date: new Date().toLocaleDateString(),
    };

    try {
      await this.emailQueue.add('sendEmail', {
        to: 'test@hi-fella.com',
        subject: 'Test Email from Hi-Fella Shoe',
        templateName: 'test',
        data,
      });
      console.log('Test email job added to queue');
    } catch (error) {
      console.error('Error adding test email job to queue:', error);
      throw error;
    }
  }

  // Direct email sending method
  async sendEmailDirect(
    to: string,
    subject: string,
    templateName: string,
    data: any,
  ): Promise<void> {
    const html = this.compileTemplate(templateName, data);

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Hi-Fella Shoe" <noreply@hi-fella.com>',
      to,
      subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${to}`);
    } catch (error) {
      console.error(`Error sending email to ${to}:`, error);
      throw error;
    }
  }

  // Queue-based email sending method
  async sendEmail(
    to: string,
    subject: string,
    templateName: string,
    data: any,
  ): Promise<void> {
    try {
      await this.emailQueue.add('sendEmail', {
        to,
        subject,
        templateName,
        data,
      });
      console.log(`Email job added to queue for ${to}`);
    } catch (error) {
      console.error(`Error adding email job to queue for ${to}:`, error);
      throw error;
    }
  }
}
