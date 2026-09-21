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
