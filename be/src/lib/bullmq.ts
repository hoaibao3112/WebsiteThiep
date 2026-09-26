import { ConnectionOptions } from "bullmq";

export const redisConnectionOptions: ConnectionOptions = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL, maxRetriesPerRequest: null, enableOfflineQueue: false }
  : {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
      connectTimeout: 3000,
      enableOfflineQueue: false,
    };
