import Redis from "ioredis";
import { logger } from "./logger";

const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = Number(process.env.REDIS_PORT) || 6379;
const redisPassword = process.env.REDIS_PASSWORD || undefined;

// In-memory fallback map cho môi trường local dev nếu chưa bật Redis
const memoryStore = new Map<string, { value: string; expireAt?: number }>();

export const redis = new Redis({
  host: redisHost,
  port: redisPort,
  password: redisPassword,
  maxRetriesPerRequest: 1,
  connectTimeout: 2000,
  lazyConnect: true,
  retryStrategy(times) {
    if (times > 3) return null; // Dừng retry sau 3 lần để không log spam
    return Math.min(times * 1000, 3000);
  },
});

let isRedisConnected = false;

redis.on("error", (err) => {
  if (isRedisConnected) {
    logger.warn("Redis disconnected, using memory fallback");
  }
  isRedisConnected = false;
});

redis.on("connect", () => {
  isRedisConnected = true;
  logger.info("Connected to Redis successfully");
});

// Thử kết nối ban đầu
redis.connect().catch(() => {
  logger.warn("[Redis] Không thể kết nối Redis local, tự động chuyển sang Memory Fallback cho OTP & RateLimit.");
});

// Polyfill an toàn cho các hàm cơ bản nếu Redis offline trong Dev
const originalGet = redis.get.bind(redis);
const originalSet = redis.set.bind(redis);
const originalDel = redis.del.bind(redis);
const originalIncr = redis.incr.bind(redis);
const originalExpire = redis.expire.bind(redis);
const originalTtl = redis.ttl.bind(redis);

(redis as any).get = async (key: string): Promise<string | null> => {
  if (isRedisConnected) {
    try { return await (originalGet as any)(key); } catch (e) {}
  }
  const item = memoryStore.get(key);
  if (!item) return null;
  if (item.expireAt && Date.now() > item.expireAt) {
    memoryStore.delete(key);
    return null;
  }
  return item.value;
};

(redis as any).set = async (key: string, value: string | number, ...args: any[]): Promise<any> => {
  if (isRedisConnected) {
    try { return await (originalSet as any)(key, value, ...args); } catch (e) {}
  }
  let expireAt: number | undefined = undefined;
  if (args[0] === "EX" && typeof args[1] === "number") {
    expireAt = Date.now() + args[1] * 1000;
  }
  memoryStore.set(key, { value: String(value), expireAt });
  return "OK";
};

(redis as any).del = async (...keys: string[]): Promise<number> => {
  if (isRedisConnected) {
    try { return await (originalDel as any)(...keys); } catch (e) {}
  }
  let count = 0;
  for (const k of keys) {
    if (memoryStore.delete(k)) count++;
  }
  return count;
};

(redis as any).incr = async (key: string): Promise<number> => {
  if (isRedisConnected) {
    try { return await (originalIncr as any)(key); } catch (e) {}
  }
  const item = memoryStore.get(key);
  let current = item ? parseInt(item.value, 10) || 0 : 0;
  current += 1;
  memoryStore.set(key, { value: String(current), expireAt: item?.expireAt });
  return current;
};

(redis as any).expire = async (key: string, seconds: number): Promise<number> => {
  if (isRedisConnected) {
    try { return await (originalExpire as any)(key, seconds); } catch (e) {}
  }
  const item = memoryStore.get(key);
  if (!item) return 0;
  item.expireAt = Date.now() + seconds * 1000;
  memoryStore.set(key, item);
  return 1;
};

(redis as any).ttl = async (key: string): Promise<number> => {
  if (isRedisConnected) {
    try { return await (originalTtl as any)(key); } catch (e) {}
  }
  const item = memoryStore.get(key);
  if (!item || !item.expireAt) return -1;
  const remaining = Math.floor((item.expireAt - Date.now()) / 1000);
  return remaining > 0 ? remaining : -2;
};
