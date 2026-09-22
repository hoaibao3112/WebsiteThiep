import type { CorsOptions } from "cors";

export function parseAllowedOrigins(raw: string): ReadonlySet<string> {
  const origins = raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.includes("*")) {
    throw new Error("Credentialed CORS wildcard origins are not allowed");
  }

  return new Set(
    origins.map((origin) => {
      const parsed = new URL(origin);
      if (parsed.origin !== origin.replace(/\/$/, "")) {
        throw new Error(`Invalid CORS origin: ${origin}`);
      }
      return parsed.origin;
    }),
  );
}

export function isOriginAllowed(
  origin: string | undefined,
  allowedOrigins: ReadonlySet<string>,
): boolean {
  if (!origin) return true;
  try {
    return allowedOrigins.has(new URL(origin).origin);
  } catch {
    return false;
  }
}

export function createCorsOptions(
  allowedOrigins: ReadonlySet<string>,
): CorsOptions {
  return {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin, allowedOrigins)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Idempotency-Key",
      "X-CSRF-Token",
      "X-Polling-Token",
    ],
    exposedHeaders: ["X-CSRF-Token"],
    credentials: true,
  };
}
