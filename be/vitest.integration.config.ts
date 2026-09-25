import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    clearMocks: true,
    restoreMocks: true,
    testTimeout: 30000,
    hookTimeout: 30000,
    env: {
      JWT_SECRET: "test-jwt-secret-min32chars-for-unit-testing",
      NODE_ENV: "test",
    },
  },
});
