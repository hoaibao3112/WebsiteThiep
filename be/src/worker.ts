import "dotenv/config";
import { mailWorker } from "./queues/workers/mail.worker";
import { rsvpWorker, rsvpDlq } from "./queues/workers/rsvp-notification.worker";
import { mailQueue } from "./queues/mail.queue";
import { rsvpNotificationQueue } from "./queues/rsvp-notification.queue";
import { prisma } from "./lib/prisma";
import { redis } from "./lib/redis";
import { logger } from "./lib/logger";

let shuttingDown = false;
export async function shutdownWorker(signal: string, exitProcess = true) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, "Worker shutdown started");
  await Promise.allSettled([
    mailWorker.close(),
    rsvpWorker.close(),
    mailQueue.close(),
    rsvpNotificationQueue.close(),
    rsvpDlq.close(),
  ]);
  await Promise.allSettled([prisma.$disconnect(), redis.quit()]);
  logger.info("Worker shutdown complete");
  if (exitProcess) {
    process.exit(0);
  }
}

process.on("SIGTERM", () => void shutdownWorker("SIGTERM"));
process.on("SIGINT", () => void shutdownWorker("SIGINT"));

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "[Worker] Uncaught exception during worker execution");
  void shutdownWorker("uncaughtException").finally(() => process.exit(1));
});

process.on("unhandledRejection", (reason) => {
  logger.error({ reason: String(reason) }, "[Worker] Unhandled rejection during worker execution");
});

logger.info("Mail and RSVP workers started");
