-- Baseline Migration: Schema state prior to multi-tenant account isolation
-- Creates foundational entities: users, plans, templates, cards, orders, guests, wishes, etc.

CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "PlanCode" AS ENUM ('FREE', 'BASIC', 'VIP');
CREATE TYPE "CardCategory" AS ENUM ('WEDDING', 'BIRTHDAY', 'NEWBORN');
CREATE TYPE "CardStatus" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED', 'ARCHIVED');
CREATE TYPE "OpeningEffect" AS ENUM ('NONE', 'WAX_SEAL', 'GATE_OPEN', 'GIFT_BOX');
CREATE TYPE "FallingEffect" AS ENUM ('NONE', 'PETAL', 'HEART', 'SNOW', 'CONFETTI', 'BALLOON');
CREATE TYPE "GuestDeliveryStatus" AS ENUM ('NOT_SENT', 'OPENED_ZALO', 'CONFIRMED_SENT', 'FAILED');
CREATE TYPE "RsvpStatus" AS ENUM ('ATTENDING', 'DECLINED', 'UNDECIDED');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'EXPIRED');
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'VNPAY', 'MOMO', 'ZALOPAY');

-- 1. Users
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "googleId" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "telegramId" TEXT,
    "weddingProfile" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- 2. Plans
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "code" "PlanCode" NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "durationDays" INTEGER,
    "maxPhotos" INTEGER NOT NULL DEFAULT 5,
    "hasWatermark" BOOLEAN NOT NULL DEFAULT true,
    "allowCustomDomain" BOOLEAN NOT NULL DEFAULT false,
    "allowMusicUpload" BOOLEAN NOT NULL DEFAULT false,
    "allowTelegramNoti" BOOLEAN NOT NULL DEFAULT false,
    "allowPremiumTemplates" BOOLEAN NOT NULL DEFAULT false,
    "features" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "plans_code_key" ON "plans"("code");

-- 3. Templates
CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "CardCategory" NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "previewUrl" TEXT,
    "configJson" JSONB NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "templates_slug_key" ON "templates"("slug");
CREATE INDEX "templates_category_isActive_idx" ON "templates"("category", "isActive");

-- 4. Cards
CREATE TABLE "cards" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "cardCategory" "CardCategory" NOT NULL,
    "status" "CardStatus" NOT NULL DEFAULT 'DRAFT',
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "createIdempotencyKey" TEXT,
    "openingEffect" "OpeningEffect" NOT NULL DEFAULT 'WAX_SEAL',
    "fallingEffect" "FallingEffect" NOT NULL DEFAULT 'NONE',
    "musicUrl" TEXT,
    "musicTitle" TEXT,
    "musicAutoPlay" BOOLEAN NOT NULL DEFAULT false,
    "customSlugHistory" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "customDomain" TEXT,
    "categoryData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "cards_slug_key" ON "cards"("slug");
CREATE INDEX "cards_userId_idx" ON "cards"("userId");
CREATE INDEX "cards_status_idx" ON "cards"("status");

-- 5. Card Events
CREATE TABLE "card_events" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "lunarDate" TEXT,
    "venueName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "mapUrl" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "card_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "card_events_cardId_idx" ON "card_events"("cardId");

-- 6. Card Photos
CREATE TABLE "card_photos" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbUrl" TEXT,
    "caption" TEXT,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "card_photos_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "card_photos_cardId_idx" ON "card_photos"("cardId");

-- 7. Guests
CREATE TABLE "guests" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "guestCode" TEXT NOT NULL,
    "guestToken" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "normalizedPhone" TEXT,
    "salutation" TEXT NOT NULL DEFAULT 'Bạn',
    "group" TEXT,
    "phone" TEXT,
    "customUrl" TEXT,
    "notes" TEXT,
    "deliveryStatus" "GuestDeliveryStatus" NOT NULL DEFAULT 'NOT_SENT',
    "shareOpenedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "guests_guestToken_key" ON "guests"("guestToken");
CREATE UNIQUE INDEX "guests_cardId_guestCode_key" ON "guests"("cardId", "guestCode");
CREATE INDEX "guests_cardId_idx" ON "guests"("cardId");

-- 8. RSVP Responses
CREATE TABLE "rsvp_responses" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "guestId" TEXT,
    "guestName" TEXT NOT NULL,
    "guestPhone" TEXT,
    "guestCount" INTEGER NOT NULL DEFAULT 1,
    "status" "RsvpStatus" NOT NULL DEFAULT 'ATTENDING',
    "note" TEXT,
    "dietaryReqs" TEXT,
    "transportation" TEXT,
    "wishes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rsvp_responses_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "rsvp_responses_cardId_idx" ON "rsvp_responses"("cardId");

-- 9. Wishes
CREATE TABLE "wishes" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "relationship" TEXT,
    "content" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '❤️',
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wishes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "wishes_cardId_idx" ON "wishes"("cardId");

-- 10. Orders
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "orderCode" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'BANK_TRANSFER',
    "paymentGateway" TEXT,
    "paidAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "orders_orderCode_key" ON "orders"("orderCode");
CREATE INDEX "orders_userId_idx" ON "orders"("userId");
CREATE INDEX "orders_cardId_idx" ON "orders"("cardId");
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- 11. Payment Transactions
CREATE TABLE "payment_transactions" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "gateway" TEXT NOT NULL,
    "transactionId" TEXT,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "payment_transactions_orderId_idx" ON "payment_transactions"("orderId");

-- Foreign key constraints
ALTER TABLE "cards" ADD CONSTRAINT "cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cards" ADD CONSTRAINT "cards_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cards" ADD CONSTRAINT "cards_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "card_events" ADD CONSTRAINT "card_events_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "card_photos" ADD CONSTRAINT "card_photos_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "guests" ADD CONSTRAINT "guests_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rsvp_responses" ADD CONSTRAINT "rsvp_responses_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rsvp_responses" ADD CONSTRAINT "rsvp_responses_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "wishes" ADD CONSTRAINT "wishes_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
