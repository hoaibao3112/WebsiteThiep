CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE "GuestDeliveryStatus" AS ENUM ('NOT_SENT', 'OPENED_ZALO', 'CONFIRMED_SENT', 'FAILED');

ALTER TABLE "guests"
  ADD COLUMN "guestToken" TEXT,
  ADD COLUMN "normalizedName" TEXT,
  ADD COLUMN "normalizedPhone" TEXT,
  ADD COLUMN "notes" TEXT,
  ADD COLUMN "deliveryStatus" "GuestDeliveryStatus" NOT NULL DEFAULT 'NOT_SENT',
  ADD COLUMN "shareOpenedAt" TIMESTAMP(3),
  ADD COLUMN "sentAt" TIMESTAMP(3);

UPDATE "guests"
SET "guestToken" = translate(encode(gen_random_bytes(24), 'base64'), '+/=', '-_'),
    "normalizedName" = lower(trim(regexp_replace("fullName", '\s+', ' ', 'g'))),
    "normalizedPhone" = NULLIF(regexp_replace(COALESCE("phone", ''), '[^0-9+]', '', 'g'), '');

ALTER TABLE "guests" ALTER COLUMN "guestToken" SET NOT NULL;
ALTER TABLE "guests" ALTER COLUMN "normalizedName" SET NOT NULL;

CREATE UNIQUE INDEX "guests_guestToken_key" ON "guests"("guestToken");
CREATE INDEX "guests_accountId_cardId_deliveryStatus_idx" ON "guests"("accountId", "cardId", "deliveryStatus");
CREATE INDEX "guests_accountId_cardId_normalizedPhone_idx" ON "guests"("accountId", "cardId", "normalizedPhone");

-- PostgreSQL permits multiple NULL values, so common-link responses remain independent.
CREATE UNIQUE INDEX "rsvp_responses_cardId_guestId_key"
ON "rsvp_responses"("cardId", "guestId");
