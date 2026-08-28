import { Worker, Job } from "bullmq";
import { redisConnectionOptions } from "../../lib/bullmq";
import {
  RSVP_NOTIFICATION_QUEUE_NAME,
} from "../rsvp-notification.queue";
import {
  dispatchTelegramNotification,
  RsvpNotificationData,
} from "../../services/notification.service";

export const rsvpWorker = new Worker<RsvpNotificationData>(
  RSVP_NOTIFICATION_QUEUE_NAME,
  async (job: Job<RsvpNotificationData>) => {
    console.log(`[BullMQ Worker] Processing RSVP notification job #${job.id}`);
    await dispatchTelegramNotification(job.data);
  },
  {
    connection: redisConnectionOptions,
    concurrency: 5,
  }
);

rsvpWorker.on("completed", (job) => {
  console.log(`[BullMQ Worker] Job #${job.id} completed successfully`);
});

rsvpWorker.on("failed", (job, err) => {
  console.error(`[BullMQ Worker] Job #${job?.id} failed:`, err);
});
