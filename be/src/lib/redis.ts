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
  retryStrategy(times) {
    if (times > 3) return null;
    return Math.min(times * 1000, 3000);
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

redis.connect().catch((err: unknown) => {
  logger.warn({ err }, "Redis initial connection failed; operations will use the configured retry policy");
});
