import { ConnectionOptions } from "bullmq";

export const redisConnectionOptions: ConnectionOptions = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  connectTimeout: 2000,
  enableOfflineQueue: false,
};
