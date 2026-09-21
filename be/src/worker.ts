import "dotenv/config";
import { mailWorker } from "./queues/workers/mail.worker";
import { rsvpWorker } from "./queues/workers/rsvp-notification.worker";
import { mailQueue } from "./queues/mail.queue";
import { rsvpNotificationQueue } from "./queues/rsvp-notification.queue";
import { prisma } from "./lib/prisma";
import { redis } from "./lib/redis";
import { logger } from "./lib/logger";

let shuttingDown = false;
async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, "Worker shutdown started");
  await Promise.allSettled([
    mailWorker.close(),
    rsvpWorker.close(),
    mailQueue.close(),
    rsvpNotificationQueue.close(),
  ]);
  await Promise.allSettled([prisma.$disconnect(), redis.quit()]);
  logger.info("Worker shutdown complete");
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
logger.info("Mail and RSVP workers started");
