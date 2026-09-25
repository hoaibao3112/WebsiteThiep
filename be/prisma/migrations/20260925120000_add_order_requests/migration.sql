-- CreateTable order_requests for persistent idempotency and order request alias tracking
CREATE TABLE "order_requests" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "planCode" "PlanCode" NOT NULL,
    "orderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_requests_pkey" PRIMARY KEY ("id")
);

-- Unique index to prevent duplicate request keys per account
CREATE UNIQUE INDEX "order_requests_accountId_idempotencyKey_key" ON "order_requests"("accountId", "idempotencyKey");

-- Index on orderId for quick lookups
CREATE INDEX "order_requests_orderId_idx" ON "order_requests"("orderId");

-- Foreign key constraints
ALTER TABLE "order_requests" ADD CONSTRAINT "order_requests_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_requests" ADD CONSTRAINT "order_requests_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill one mapping for each existing order that has an idempotencyKey
INSERT INTO "order_requests" ("id", "accountId", "idempotencyKey", "planCode", "orderId", "createdAt")
SELECT
    'req_' || md5(o."id" || ':' || o."idempotencyKey"),
    o."accountId",
    o."idempotencyKey",
    p."code",
    o."id",
    o."createdAt"
FROM "orders" o
JOIN "plans" p ON o."planId" = p."id"
WHERE o."idempotencyKey" IS NOT NULL
ON CONFLICT ("accountId", "idempotencyKey") DO NOTHING;
