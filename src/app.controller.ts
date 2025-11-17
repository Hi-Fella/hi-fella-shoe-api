import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { EmailService } from './email/email.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly emailService: EmailService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('test-email')
  async testEmail(): Promise<string> {
    try {
      await this.emailService.sendTestEmail();
      return 'Test email sent successfully!';
    } catch (error) {
      return `Failed to send test email: ${error.message}`;
    }
  }
}
