import { Queue } from "bullmq";
import { redisConnectionOptions } from "../lib/bullmq";
import { RsvpNotificationData } from "../services/notification.service";

export const RSVP_NOTIFICATION_QUEUE_NAME = "rsvp-notification-queue";

export const rsvpNotificationQueue = new Queue<RsvpNotificationData>(
  RSVP_NOTIFICATION_QUEUE_NAME,
  {
    connection: redisConnectionOptions,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: 1000,
    },
  }
);
