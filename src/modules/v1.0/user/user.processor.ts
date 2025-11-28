import {
  InjectQueue,
  OnWorkerEvent,
  Processor,
  WorkerHost,
} from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { UserService } from './user.service';
import { Logger } from '@nestjs/common';

export interface UserSyncJobData {
  userId: string;
  email: string;
}

@Processor('user-sync-gsheet')
export class UserProcessor extends WorkerHost {
  private readonly logger = new Logger(UserProcessor.name);

  constructor(
    private readonly userService: UserService,
    @InjectQueue('user-sync-gsheet') private userSyncQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<UserSyncJobData>): Promise<void> {
    const { userId, email } = job.data;
    const result = await this.userService.syncUserToGoogleSheets(userId);
    this.logger.log(`job ${job.id} (${email}) completed: ${result.message}`);
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job, error: Error) {
    // @ts-ignore
    const isFinalAttempt = job.attemptsMade >= job.opts.attempts;
    const { email } = job.data;

    // if final attempt still failed
    if (isFinalAttempt) {
      this.logger.error(
        `job ${job.id} (${email}) final attempt failed: ${error?.message}`,
        error?.stack,
      );

      // remove current failed job
      await job.remove();

      // requeue the job until 5x
      const requeuedCount = job.data?.requeued ?? 0;
      if (requeuedCount >= 5) return;

      job.data.requeued = job.data.requeued + 1;
      this.logger.log(
        `${job.id} job requeued-${job.data.requeued} for email: ${email}`,
      );
      await this.userSyncQueue.add(job.name, job.data, {
        jobId: job.id,
        delay: 24 * 60 * 60 * 1000, //1 day
      });
    }
  }
}
