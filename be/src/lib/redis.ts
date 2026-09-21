import Redis from "ioredis";
import { logger } from "./logger";

const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = Number(process.env.REDIS_PORT) || 6379;
const redisPassword = process.env.REDIS_PASSWORD || undefined;

export const redis = new Redis({
  host: redisHost,
  port: redisPort,
  password: redisPassword,
  maxRetriesPerRequest: 1,
  connectTimeout: 2000,
  lazyConnect: true,
  retryStrategy(times) {
    if (times > 3) return null;
    return Math.min(times * 1000, 3000);
  },
});

redis.on("error", (err) => {
  logger.error({ err }, "Redis connection error");
});

redis.on("connect", () => {
  logger.info("Connected to Redis successfully");
});

redis.connect().catch((err: unknown) => {
  logger.warn({ err }, "Redis initial connection failed; operations will use the configured retry policy");
});
