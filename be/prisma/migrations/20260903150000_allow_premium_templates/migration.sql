-- AlterTable
ALTER TABLE "plans" ADD COLUMN "allowPremiumTemplates" BOOLEAN NOT NULL DEFAULT false;

-- Update BASIC and VIP plans to allow premium templates
UPDATE "plans" SET "allowPremiumTemplates" = true WHERE "code" IN ('BASIC', 'VIP');
