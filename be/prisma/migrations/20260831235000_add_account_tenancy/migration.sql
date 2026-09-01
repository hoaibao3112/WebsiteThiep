-- Additive account-tenancy migration. This migration is safe to rehearse on a
-- disposable copy first; it intentionally has no destructive down migration.
CREATE TYPE "AccountMemberRole" AS ENUM ('OWNER', 'MEMBER');

CREATE TABLE "accounts" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "account_members" (
  "id" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" "AccountMemberRole" NOT NULL DEFAULT 'MEMBER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "account_members_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "cards" ADD COLUMN "accountId" TEXT;
ALTER TABLE "card_events" ADD COLUMN "accountId" TEXT;
ALTER TABLE "card_photos" ADD COLUMN "accountId" TEXT;
ALTER TABLE "guests" ADD COLUMN "accountId" TEXT;
ALTER TABLE "rsvp_responses" ADD COLUMN "accountId" TEXT;
ALTER TABLE "wishes" ADD COLUMN "accountId" TEXT;
ALTER TABLE "orders" ADD COLUMN "accountId" TEXT;
ALTER TABLE "orders" ADD COLUMN "idempotencyKey" TEXT;
ALTER TABLE "orders" ADD COLUMN "pollingTokenHash" TEXT;
ALTER TABLE "payment_transactions" ADD COLUMN "accountId" TEXT;

INSERT INTO "accounts" ("id", "name", "createdAt", "updatedAt")
SELECT 'acc_' || md5(u."id"), COALESCE(NULLIF(BTRIM(u."name"), ''), 'Tài khoản của tôi'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "users" u
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "account_members" ("id", "accountId", "userId", "role", "createdAt")
SELECT 'mem_' || md5(u."id"), 'acc_' || md5(u."id"), u."id", 'OWNER', CURRENT_TIMESTAMP
FROM "users" u
ON CONFLICT ("id") DO NOTHING;

UPDATE "cards" SET "accountId" = 'acc_' || md5("userId") WHERE "accountId" IS NULL;
UPDATE "orders" SET "accountId" = 'acc_' || md5("userId") WHERE "accountId" IS NULL;
UPDATE "card_events" child SET "accountId" = parent."accountId" FROM "cards" parent WHERE child."cardId" = parent."id" AND child."accountId" IS NULL;
UPDATE "card_photos" child SET "accountId" = parent."accountId" FROM "cards" parent WHERE child."cardId" = parent."id" AND child."accountId" IS NULL;
UPDATE "guests" child SET "accountId" = parent."accountId" FROM "cards" parent WHERE child."cardId" = parent."id" AND child."accountId" IS NULL;
UPDATE "rsvp_responses" child SET "accountId" = parent."accountId" FROM "cards" parent WHERE child."cardId" = parent."id" AND child."accountId" IS NULL;
UPDATE "wishes" child SET "accountId" = parent."accountId" FROM "cards" parent WHERE child."cardId" = parent."id" AND child."accountId" IS NULL;
UPDATE "payment_transactions" child SET "accountId" = parent."accountId" FROM "orders" parent WHERE child."orderId" = parent."id" AND child."accountId" IS NULL;
UPDATE "orders" SET "idempotencyKey" = 'legacy:' || "id" WHERE "idempotencyKey" IS NULL;
UPDATE "orders" SET "pollingTokenHash" = md5('legacy-disabled:' || "id") WHERE "pollingTokenHash" IS NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "cards" WHERE "accountId" IS NULL
    UNION ALL SELECT 1 FROM "card_events" WHERE "accountId" IS NULL
    UNION ALL SELECT 1 FROM "card_photos" WHERE "accountId" IS NULL
    UNION ALL SELECT 1 FROM "guests" WHERE "accountId" IS NULL
    UNION ALL SELECT 1 FROM "rsvp_responses" WHERE "accountId" IS NULL
    UNION ALL SELECT 1 FROM "wishes" WHERE "accountId" IS NULL
    UNION ALL SELECT 1 FROM "orders" WHERE "accountId" IS NULL
    UNION ALL SELECT 1 FROM "payment_transactions" WHERE "accountId" IS NULL
  ) THEN
    RAISE EXCEPTION 'Account tenancy backfill left orphaned rows';
  END IF;
END $$;

ALTER TABLE "cards" ALTER COLUMN "accountId" SET NOT NULL;
ALTER TABLE "card_events" ALTER COLUMN "accountId" SET NOT NULL;
ALTER TABLE "card_photos" ALTER COLUMN "accountId" SET NOT NULL;
ALTER TABLE "guests" ALTER COLUMN "accountId" SET NOT NULL;
ALTER TABLE "rsvp_responses" ALTER COLUMN "accountId" SET NOT NULL;
ALTER TABLE "wishes" ALTER COLUMN "accountId" SET NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "accountId" SET NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "idempotencyKey" SET NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "pollingTokenHash" SET NOT NULL;
ALTER TABLE "payment_transactions" ALTER COLUMN "accountId" SET NOT NULL;

CREATE UNIQUE INDEX "account_members_accountId_userId_key" ON "account_members"("accountId", "userId");
CREATE INDEX "account_members_userId_idx" ON "account_members"("userId");
CREATE UNIQUE INDEX "orders_accountId_idempotencyKey_key" ON "orders"("accountId", "idempotencyKey");
CREATE INDEX "cards_accountId_idx" ON "cards"("accountId");
CREATE INDEX "card_events_accountId_cardId_idx" ON "card_events"("accountId", "cardId");
CREATE INDEX "card_photos_accountId_cardId_idx" ON "card_photos"("accountId", "cardId");
CREATE INDEX "guests_accountId_cardId_idx" ON "guests"("accountId", "cardId");
CREATE INDEX "rsvp_responses_accountId_cardId_status_idx" ON "rsvp_responses"("accountId", "cardId", "status");
CREATE INDEX "wishes_accountId_cardId_createdAt_idx" ON "wishes"("accountId", "cardId", "createdAt" DESC);
CREATE INDEX "orders_accountId_status_idx" ON "orders"("accountId", "status");
CREATE INDEX "payment_transactions_accountId_orderId_idx" ON "payment_transactions"("accountId", "orderId");

ALTER TABLE "account_members" ADD CONSTRAINT "account_members_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "account_members" ADD CONSTRAINT "account_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cards" ADD CONSTRAINT "cards_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "card_events" ADD CONSTRAINT "card_events_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "card_photos" ADD CONSTRAINT "card_photos_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "guests" ADD CONSTRAINT "guests_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rsvp_responses" ADD CONSTRAINT "rsvp_responses_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wishes" ADD CONSTRAINT "wishes_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
