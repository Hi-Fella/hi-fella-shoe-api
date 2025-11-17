import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EmailService } from './email.service';

export interface EmailJobData {
  to: string;
  subject: string;
  templateName: string;
  data: any;
}

@Processor('email')
export class EmailProcessor extends WorkerHost {
  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    const { to, subject, templateName, data } = job.data;

    try {
      await this.emailService.sendEmailDirect(to, subject, templateName, data);
      console.log(`Email job ${job.id} completed successfully`);
    } catch (error) {
      console.error(`Email job ${job.id} failed:`, error);
      throw error;
    }
  }
}
