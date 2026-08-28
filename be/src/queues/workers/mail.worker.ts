import { Worker, Job } from "bullmq";
import { redisConnectionOptions } from "../../lib/bullmq";
import { MAIL_QUEUE_NAME, MailJobData } from "../mail.queue";
import { MailService } from "../../services/mail.service";

export const mailWorker = new Worker<MailJobData>(
  MAIL_QUEUE_NAME,
  async (job: Job<MailJobData>) => {
    console.log(`[BullMQ Mail Worker] Processing email job #${job.id} to ${job.data.email}`);
    await MailService.sendOtpEmail(job.data.email, job.data.otp);
  },
  {
    connection: redisConnectionOptions,
    concurrency: 5,
  }
);

mailWorker.on("completed", (job) => {
  console.log(`[BullMQ Mail Worker] Job #${job.id} completed successfully`);
});

mailWorker.on("failed", (job, err) => {
  console.error(`[BullMQ Mail Worker] Job #${job?.id} failed:`, err);
});
