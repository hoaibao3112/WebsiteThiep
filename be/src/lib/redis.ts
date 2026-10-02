import Redis, { RedisOptions } from "ioredis";
import { logger } from "./logger";

const redisUrl = process.env.REDIS_URL;
const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = Number(process.env.REDIS_PORT) || 6379;
const redisPassword = process.env.REDIS_PASSWORD || undefined;

const commonOpts: RedisOptions = {
  maxRetriesPerRequest: 1,
  connectTimeout: 3000,
  lazyConnect: true,
  keepAlive: 10000,
  enableReadyCheck: true,
  retryStrategy(times) {
    // Luôn trả delay số milli-giây để ioredis tự động reconnect vĩnh viễn, không bao giờ return null
    return Math.min(times * 200, 5000);
  },
  reconnectOnError(err) {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      return true; // Reconnect khi Redis cluster chuyển node master
    }
    return false;
  },
};

export const redis = redisUrl
  ? new Redis(redisUrl, commonOpts)
  : new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      ...commonOpts,
    });

redis.on("error", (err) => {
  logger.error({ err }, "Redis connection error");
});

redis.on("connect", () => {
  logger.info("Connected to Redis successfully");
});

redis.on("reconnecting", (time: number) => {
  logger.info({ retryInMs: time }, "Redis reconnecting...");
});

redis.connect().catch((err: unknown) => {
  logger.warn({ err }, "Redis initial connection failed; operations will use the configured retry policy");
});
