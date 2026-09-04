import { Worker, Job } from "bullmq";
import { redisConnectionOptions } from "../../lib/bullmq";
import { MAIL_QUEUE_NAME, MailJobData } from "../mail.queue";
import { MailService } from "../../services/mail.service";
import { logger } from "../../lib/logger";

export const mailWorker = new Worker<MailJobData>(
  MAIL_QUEUE_NAME,
  async (job: Job<MailJobData>) => {
    logger.info({ jobId: job.id, email: job.data.email }, "[BullMQ Mail Worker] Processing email job");
    await MailService.sendOtpEmail(job.data.email, job.data.otp);
  },
  {
    connection: redisConnectionOptions,
    concurrency: 5,
  }
);

mailWorker.on("completed", (job) => {
  logger.info({ jobId: job.id }, "[BullMQ Mail Worker] Job completed successfully");
});

mailWorker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, err }, "[BullMQ Mail Worker] Job failed");
});
