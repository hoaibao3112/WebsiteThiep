-- AlterTable accounts: add nullable columns first
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "currentPlanId" TEXT;
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "planStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "planExpiresAt" TIMESTAMP(3);

-- AlterTable orders: make cardId nullable and add review/audit fields
ALTER TABLE "orders" ALTER COLUMN "cardId" DROP NOT NULL;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "reviewedById" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "reviewNote" TEXT;

-- Foreign key for orders.reviewedById -> users.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_reviewedById_fkey'
  ) THEN
    ALTER TABLE "orders" ADD CONSTRAINT "orders_reviewedById_fkey"
      FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Backfill Account currentPlanId:
-- 1. Ensure FREE plan exists as default fallback
-- 2. Rank non-expired cards per account: VIP > BASIC > FREE
-- 3. If account has non-expired VIP card -> VIP plan, planExpiresAt = NULL
-- 4. Else if account has non-expired BASIC card -> BASIC plan, planExpiresAt = MAX(card.expiredAt)
-- 5. Else -> FREE plan
DO $$
DECLARE
  free_plan_id TEXT;
  basic_plan_id TEXT;
  vip_plan_id TEXT;
BEGIN
  SELECT id INTO free_plan_id FROM "plans" WHERE "code" = 'FREE' LIMIT 1;
  SELECT id INTO basic_plan_id FROM "plans" WHERE "code" = 'BASIC' LIMIT 1;
  SELECT id INTO vip_plan_id FROM "plans" WHERE "code" = 'VIP' LIMIT 1;

  -- Default accounts without currentPlanId to FREE
  IF free_plan_id IS NOT NULL THEN
    UPDATE "accounts"
    SET "currentPlanId" = free_plan_id
    WHERE "currentPlanId" IS NULL;
  END IF;

  -- Promote accounts with non-expired VIP cards
  IF vip_plan_id IS NOT NULL THEN
    UPDATE "accounts" a
    SET "currentPlanId" = vip_plan_id, "planExpiresAt" = NULL
    WHERE EXISTS (
      SELECT 1 FROM "cards" c
      JOIN "plans" p ON c."planId" = p.id
      WHERE c."accountId" = a.id
        AND p."code" = 'VIP'
        AND (c."expiredAt" IS NULL OR c."expiredAt" > NOW())
    );
  END IF;

  -- Promote accounts with non-expired BASIC cards (if not already VIP)
  IF basic_plan_id IS NOT NULL THEN
    UPDATE "accounts" a
    SET "currentPlanId" = basic_plan_id,
        "planExpiresAt" = (
          SELECT MAX(c."expiredAt")
          FROM "cards" c
          WHERE c."accountId" = a.id AND c."planId" = basic_plan_id
        )
    WHERE a."currentPlanId" = free_plan_id
      AND EXISTS (
        SELECT 1 FROM "cards" c
        JOIN "plans" p ON c."planId" = p.id
        WHERE c."accountId" = a.id
          AND p."code" = 'BASIC'
          AND (c."expiredAt" IS NULL OR c."expiredAt" > NOW())
      );
  END IF;
END $$;

-- Enforce NOT NULL and foreign key on accounts.currentPlanId
ALTER TABLE "accounts" ALTER COLUMN "currentPlanId" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'accounts_currentPlanId_fkey'
  ) THEN
    ALTER TABLE "accounts" ADD CONSTRAINT "accounts_currentPlanId_fkey"
      FOREIGN KEY ("currentPlanId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- Indexes for performance & review queue
CREATE INDEX IF NOT EXISTS "accounts_currentPlanId_planExpiresAt_idx" ON "accounts"("currentPlanId", "planExpiresAt");
CREATE INDEX IF NOT EXISTS "orders_status_submittedAt_idx" ON "orders"("status", "submittedAt");
CREATE INDEX IF NOT EXISTS "orders_accountId_status_idx" ON "orders"("accountId", "status");

-- Partial unique index: prevent multiple active pending/awaiting_review orders for the same account & plan
CREATE UNIQUE INDEX IF NOT EXISTS "orders_active_account_plan_uniq"
ON "orders"("accountId", "planId")
WHERE "status" IN ('PENDING', 'AWAITING_REVIEW');
