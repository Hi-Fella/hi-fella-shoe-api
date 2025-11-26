import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UserService } from './user.service';

export interface UserSyncJobData {
  email: string;
}

@Processor('user-sync-gsheet')
export class UserProcessor extends WorkerHost {
  constructor(private readonly userService: UserService) {
    super();
  }

  async process(job: Job<UserSyncJobData>): Promise<void> {
    const { email } = job.data;

    try {
      const result = await this.userService.syncUserToGoogleSheets(email);
      console.log(
        `syncUserToGoogleSheetsQueue job ${job.id} completed: ${result.message}`,
      );
    } catch (error) {
      console.error(`syncUserToGoogleSheetsQueue job ${job.id} failed:`, error);
      throw error;
    }
  }
}
