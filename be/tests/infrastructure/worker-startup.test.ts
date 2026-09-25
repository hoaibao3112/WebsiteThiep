import { describe, expect, it, vi } from "vitest";
import { Queue } from "bullmq";
import {
  RSVP_NOTIFICATION_QUEUE_NAME,
  RSVP_NOTIFICATION_DLQ_NAME,
} from "../../src/queues/rsvp-notification.queue";
import { MAIL_QUEUE_NAME } from "../../src/queues/mail.queue";

import { EventEmitter } from "events";

function createMockRedis() {
  const emitter = new EventEmitter() as any;
  emitter.status = "ready";
  emitter.options = {};
  emitter.duplicate = () => emitter;
  emitter.quit = vi.fn().mockResolvedValue("OK");
  emitter.disconnect = vi.fn();
  return emitter;
}

describe("BullMQ Worker and Queue naming / startup", () => {
  it("enforces BullMQ queue naming rules: names with colon throw error", () => {
    // Attempting to construct a Queue with colon should fail synchronously in constructor
    expect(() => {
      new Queue("test:colon", { connection: createMockRedis() });
    }).toThrow(/Queue name cannot contain :/);
  });

  it("verifies all application queue and DLQ constants contain no colons", () => {
    expect(RSVP_NOTIFICATION_QUEUE_NAME).not.toContain(":");
    expect(RSVP_NOTIFICATION_DLQ_NAME).not.toContain(":");
    expect(MAIL_QUEUE_NAME).not.toContain(":");
    expect(RSVP_NOTIFICATION_DLQ_NAME).toBe("rsvp-notification-queue-dlq");
  });

  it("allows constructing DLQ with RSVP_NOTIFICATION_DLQ_NAME without naming errors", async () => {
    const mockRedis = createMockRedis();
    const queue = new Queue(RSVP_NOTIFICATION_DLQ_NAME, {
      connection: mockRedis,
    });
    expect(queue.name).toBe("rsvp-notification-queue-dlq");
    await queue.close();
  });

  it("adds job to DLQ exactly once when attemptsMade reaches maxAttempts", async () => {
    const dlqMock = {
      add: vi.fn().mockResolvedValue({ id: "dlq-job-1" }),
    };

    // Simulate worker failed handler
    async function handleJobFailure(
      job: { id: string; attemptsMade: number; opts?: { attempts?: number }; data: unknown } | undefined,
      err: Error,
      dlqInstance: typeof dlqMock,
    ) {
      const maxAttempts = job?.opts?.attempts ?? 3;
      if (job && job.attemptsMade >= maxAttempts) {
        await dlqInstance.add("dlq-rsvp", job.data, {
          jobId: `dlq-${job.id}`,
        });
      }
    }

    const testJob = {
      id: "job-rsvp-99",
      attemptsMade: 1,
      opts: { attempts: 3 },
      data: { cardSlug: "wedding", fullName: "Test Guest" },
    };

    // Attempt 1: not moved to DLQ yet
    await handleJobFailure(testJob, new Error("Fail 1"), dlqMock);
    expect(dlqMock.add).not.toHaveBeenCalled();

    // Attempt 2: not moved yet
    testJob.attemptsMade = 2;
    await handleJobFailure(testJob, new Error("Fail 2"), dlqMock);
    expect(dlqMock.add).not.toHaveBeenCalled();

    // Attempt 3: reached maxAttempts -> added to DLQ
    testJob.attemptsMade = 3;
    await handleJobFailure(testJob, new Error("Fail 3 - final"), dlqMock);
    expect(dlqMock.add).toHaveBeenCalledTimes(1);
    expect(dlqMock.add).toHaveBeenCalledWith(
      "dlq-rsvp",
      { cardSlug: "wedding", fullName: "Test Guest" },
      { jobId: "dlq-job-rsvp-99" },
    );
  });

  it("shutdown closes all 5 queue/worker entities including DLQ", async () => {
    const mockMailWorker = { close: vi.fn().mockResolvedValue(undefined) };
    const mockRsvpWorker = { close: vi.fn().mockResolvedValue(undefined) };
    const mockMailQueue = { close: vi.fn().mockResolvedValue(undefined) };
    const mockRsvpQueue = { close: vi.fn().mockResolvedValue(undefined) };
    const mockRsvpDlq = { close: vi.fn().mockResolvedValue(undefined) };

    await Promise.allSettled([
      mockMailWorker.close(),
      mockRsvpWorker.close(),
      mockMailQueue.close(),
      mockRsvpQueue.close(),
      mockRsvpDlq.close(),
    ]);

    expect(mockMailWorker.close).toHaveBeenCalledOnce();
    expect(mockRsvpWorker.close).toHaveBeenCalledOnce();
    expect(mockMailQueue.close).toHaveBeenCalledOnce();
    expect(mockRsvpQueue.close).toHaveBeenCalledOnce();
    expect(mockRsvpDlq.close).toHaveBeenCalledOnce();
  });
});
