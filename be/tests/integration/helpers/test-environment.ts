/**
 * Integration Test Environment Guard & Config Helper
 * Enforces dedicated test database and redis instances to prevent data corruption.
 */

export interface IntegrationEnvCheck {
  isConfigured: boolean;
  testDbUrl?: string;
  testRedisUrl?: string;
  reason?: string;
}

export function getIntegrationEnv(): IntegrationEnvCheck {
  const testDbUrl = process.env.TEST_DATABASE_URL;
  const testRedisUrl = process.env.TEST_REDIS_URL;

  if (!testDbUrl || !testRedisUrl) {
    return {
      isConfigured: false,
      reason:
        "TEST_DATABASE_URL and TEST_REDIS_URL must be explicitly configured for isolated container tests. Refusing to run on primary DATABASE_URL.",
    };
  }

  // Safety check: ensure test database does not point to production database
  if (
    process.env.DATABASE_URL &&
    testDbUrl === process.env.DATABASE_URL &&
    process.env.NODE_ENV === "production"
  ) {
    throw new Error(
      "CRITICAL SAFETY VIOLATION: TEST_DATABASE_URL cannot match production DATABASE_URL!"
    );
  }

  return {
    isConfigured: true,
    testDbUrl,
    testRedisUrl,
  };
}
