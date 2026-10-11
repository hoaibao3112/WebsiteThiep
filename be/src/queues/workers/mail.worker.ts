import { Worker, Job, Queue } from "bullmq";
import { redisConnectionOptions } from "../../lib/bullmq";
import { MAIL_QUEUE_NAME, MAIL_DLQ_NAME, MailJobData } from "../mail.queue";
import { MailService } from "../../services/mail.service";
import { logger } from "../../lib/logger";

// Dead Letter Queue — nhận email job bị fail sau tất cả các lần thử lại
export const mailDlq = new Queue<MailJobData>(MAIL_DLQ_NAME, {
  connection: redisConnectionOptions,
  defaultJobOptions: {
    removeOnComplete: false, // Giữ lại để xem và replay thủ công
    removeOnFail: false,
  },
});

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

// Sau khi hết tất cả lần retry → chuyển sang DLQ
mailWorker.on("failed", async (job, err) => {
  logger.error({ jobId: job?.id, err, attempts: job?.attemptsMade }, "[BullMQ Mail Worker] Job failed");

  const maxAttempts = (job?.opts?.attempts ?? 3);
  if (job && job.attemptsMade >= maxAttempts) {
    logger.warn({ jobId: job.id }, "[BullMQ Mail Worker] Max attempts reached. Moving to DLQ.");
    await mailDlq.add("dlq-mail", job.data, {
      jobId: `dlq-${job.id}`,
    });
  }
});
