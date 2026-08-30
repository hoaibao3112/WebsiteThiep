import { Worker, Job, Queue } from "bullmq";
import { redisConnectionOptions } from "../../lib/bullmq";
import {
  RSVP_NOTIFICATION_QUEUE_NAME,
} from "../rsvp-notification.queue";
import {
  dispatchTelegramNotification,
  RsvpNotificationData,
} from "../../services/notification.service";
import { logger } from "../../lib/logger";

// Dead Letter Queue — nhận job bị fail sau tất cả các lần thử lại
const DLQ_NAME = `${RSVP_NOTIFICATION_QUEUE_NAME}:dlq`;
const dlq = new Queue<RsvpNotificationData>(DLQ_NAME, {
  connection: redisConnectionOptions,
  defaultJobOptions: {
    removeOnComplete: false, // Giữ lại để xem và replay thủ công
    removeOnFail: false,
  },
});

export const rsvpWorker = new Worker<RsvpNotificationData>(
  RSVP_NOTIFICATION_QUEUE_NAME,
  async (job: Job<RsvpNotificationData>) => {
    logger.info({ jobId: job.id, attempt: job.attemptsMade + 1 }, "[BullMQ] Processing RSVP notification");
    const sent = await dispatchTelegramNotification(job.data);
    if (!sent) {
      throw new Error("Telegram notification returned false");
    }
  },
  {
    connection: redisConnectionOptions,
    concurrency: 5,
  }
);

rsvpWorker.on("completed", (job) => {
  logger.info({ jobId: job.id }, "[BullMQ] RSVP notification job completed");
});

// Sau khi hết tất cả lần retry → chuyển sang DLQ
rsvpWorker.on("failed", async (job, err) => {
  logger.error({ jobId: job?.id, err, attempts: job?.attemptsMade }, "[BullMQ] RSVP notification job failed");

  const maxAttempts = (job?.opts?.attempts ?? 3);
  if (job && job.attemptsMade >= maxAttempts) {
    logger.warn({ jobId: job.id }, "[BullMQ] Max attempts reached. Moving to DLQ.");
    await dlq.add("dlq-rsvp", job.data, {
      jobId: `dlq-${job.id}`,
    });
  }
});
