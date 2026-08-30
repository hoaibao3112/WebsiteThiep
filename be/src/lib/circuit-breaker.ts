import { logger } from "./logger";

// -----------------------------------------------------------------------
// Circuit Breaker — Bảo vệ third-party API calls (Telegram, SMTP, SePay)
// States: CLOSED (bình thường) → OPEN (lỗi) → HALF_OPEN (thử lại)
// -----------------------------------------------------------------------

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

interface CircuitBreakerOptions {
  name: string;
  failureThreshold?: number;  // Số lần fail để OPEN (default: 5)
  successThreshold?: number;  // Số lần success để CLOSE từ HALF_OPEN (default: 2)
  timeout?: number;           // Thời gian OPEN → HALF_OPEN (ms, default: 30s)
}

export class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime?: number;
  private readonly options: Required<CircuitBreakerOptions>;

  constructor(options: CircuitBreakerOptions) {
    this.options = {
      name: options.name,
      failureThreshold: options.failureThreshold ?? 5,
      successThreshold: options.successThreshold ?? 2,
      timeout: options.timeout ?? 30_000,
    };
  }


  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      const now = Date.now();
      if (now - (this.lastFailureTime ?? 0) > this.options.timeout) {
        this.state = "HALF_OPEN";
        logger.info(`[CircuitBreaker:${this.options.name}] → HALF_OPEN, attempting recovery`);
      } else {
        const retryAfter = Math.ceil(
          (this.options.timeout - (now - (this.lastFailureTime ?? 0))) / 1000
        );
        logger.warn(
          `[CircuitBreaker:${this.options.name}] OPEN — skipping call. Retry after ${retryAfter}s`
        );
        throw new Error(`Circuit OPEN for ${this.options.name}. Service unavailable.`);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure(err);
      throw err;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.state === "HALF_OPEN") {
      this.successCount++;
      if (this.successCount >= this.options.successThreshold) {
        this.state = "CLOSED";
        this.successCount = 0;
        logger.info(`[CircuitBreaker:${this.options.name}] → CLOSED (recovered)`);
      }
    }
  }

  private onFailure(err: unknown): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    logger.error(
      { err },
      `[CircuitBreaker:${this.options.name}] Failure ${this.failureCount}/${this.options.failureThreshold}`
    );

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = "OPEN";
      this.successCount = 0;
      logger.error(
        `[CircuitBreaker:${this.options.name}] → OPEN (${this.failureCount} failures). Will retry after ${this.options.timeout / 1000}s`
      );
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  reset(): void {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = undefined;
    logger.info(`[CircuitBreaker:${this.options.name}] Manually reset to CLOSED`);
  }
}

// -----------------------------------------------------------------------
// Singleton instances cho từng third-party service
// -----------------------------------------------------------------------
export const telegramCircuit = new CircuitBreaker({
  name: "Telegram",
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60_000, // 1 phút
});

export const mailCircuit = new CircuitBreaker({
  name: "SMTP-Mail",
  failureThreshold: 3,
  successThreshold: 2,
  timeout: 120_000, // 2 phút
});

export const sePayCircuit = new CircuitBreaker({
  name: "SePay",
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 30_000, // 30 giây
});
