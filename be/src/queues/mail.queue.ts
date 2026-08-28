import { Queue } from "bullmq";
import { redisConnectionOptions } from "../lib/bullmq";

export interface MailJobData {
  email: string;
  otp: string;
}

export const MAIL_QUEUE_NAME = "mail-notification-queue";

export const mailQueue = new Queue<MailJobData>(MAIL_QUEUE_NAME, {
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
});
