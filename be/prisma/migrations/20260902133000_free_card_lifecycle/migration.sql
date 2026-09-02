ALTER TABLE "cards"
ADD COLUMN "publishedAt" TIMESTAMP(3),
ADD COLUMN "createIdempotencyKey" TEXT;

CREATE UNIQUE INDEX "cards_accountId_createIdempotencyKey_key"
ON "cards"("accountId", "createIdempotencyKey");
