import type { ConnectionOptions } from "bullmq";

/**
 * Xây connection options cho BullMQ.
 *
 * LƯU Ý: ioredis KHÔNG nhận `{ url }` trong options object — nó sẽ im lặng
 * rơi về localhost:6379. Vì vậy phải parse REDIS_URL thành host/port/auth/tls.
 */
export function buildRedisConnectionOptions(env: NodeJS.ProcessEnv = process.env): ConnectionOptions {
  const base = {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    connectTimeout: 3000,
  } as const;

  if (env.REDIS_URL) {
    const url = new URL(env.REDIS_URL);
    const dbIndex = url.pathname.length > 1 ? Number(url.pathname.slice(1)) : undefined;
    return {
      ...base,
      host: url.hostname,
      port: Number(url.port) || 6379,
      username: url.username ? decodeURIComponent(url.username) : undefined,
      password: url.password ? decodeURIComponent(url.password) : undefined,
      db: Number.isInteger(dbIndex) ? dbIndex : undefined,
      ...(url.protocol === "rediss:" ? { tls: {} } : {}),
    };
  }

  return {
    ...base,
    host: env.REDIS_HOST || "127.0.0.1",
    port: Number(env.REDIS_PORT) || 6379,
    password: env.REDIS_PASSWORD || undefined,
    ...(env.REDIS_TLS === "true" ? { tls: {} } : {}),
  };
}

export const redisConnectionOptions: ConnectionOptions = buildRedisConnectionOptions();