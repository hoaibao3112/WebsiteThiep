import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";

export interface CardExpiryAuditResult {
  totalActiveCardsWithExpiry: number;
  candidatesToClearExpiry: Array<{
    cardId: string;
    accountId: string;
    slug: string;
    publishedAt: Date | null;
    currentExpiredAt: Date;
    evidence: {
      orderId: string;
      planCode: string;
      paidAt: Date;
    };
  }>;
  ambiguousCards: Array<{
    cardId: string;
    accountId: string;
    slug: string;
    publishedAt: Date | null;
    currentExpiredAt: Date;
    reason: string;
  }>;
  validFreeCards: Array<{
    cardId: string;
    accountId: string;
    slug: string;
    currentExpiredAt: Date;
  }>;
}

/**
 * Read-only audit function to identify cards with incorrect expiration dates
 * caused by previous bugs, without performing any mass-clearing or uncontrolled DB mutations.
 */
export async function auditCardExpiryCandidates(
  db: typeof prisma = prisma
): Promise<CardExpiryAuditResult> {
  const cards = await db.card.findMany({
    where: {
      status: "ACTIVE",
      expiredAt: { not: null },
    },
    include: {
      account: {
        include: {
          orders: {
            where: { status: "PAID" },
            include: { plan: true },
            orderBy: { paidAt: "asc" },
          },
        },
      },
      plan: true,
    },
  });

  const candidatesToClearExpiry: CardExpiryAuditResult["candidatesToClearExpiry"] = [];
  const ambiguousCards: CardExpiryAuditResult["ambiguousCards"] = [];
  const validFreeCards: CardExpiryAuditResult["validFreeCards"] = [];

  for (const card of cards) {
    if (!card.expiredAt) continue;

    const paidOrders = card.account.orders || [];

    if (paidOrders.length === 0) {
      // No paid orders ever -> this is a genuine FREE card
      validFreeCards.push({
        cardId: card.id,
        accountId: card.accountId,
        slug: card.slug,
        currentExpiredAt: card.expiredAt,
      });
      continue;
    }

    // Check if publishedAt corresponds to any paid order period
    if (!card.publishedAt) {
      ambiguousCards.push({
        cardId: card.id,
        accountId: card.accountId,
        slug: card.slug,
        publishedAt: null,
        currentExpiredAt: card.expiredAt,
        reason: "Card has no publishedAt timestamp to correlate with paid orders",
      });
      continue;
    }

    // Find if publishedAt occurred after a paid order
    const matchingOrder = paidOrders.find((order) => {
      if (!order.paidAt) return false;
      return order.paidAt <= card.publishedAt!;
    });

    if (matchingOrder && matchingOrder.paidAt) {
      candidatesToClearExpiry.push({
        cardId: card.id,
        accountId: card.accountId,
        slug: card.slug,
        publishedAt: card.publishedAt,
        currentExpiredAt: card.expiredAt,
        evidence: {
          orderId: matchingOrder.id,
          planCode: matchingOrder.plan.code,
          paidAt: matchingOrder.paidAt,
        },
      });
    } else {
      ambiguousCards.push({
        cardId: card.id,
        accountId: card.accountId,
        slug: card.slug,
        publishedAt: card.publishedAt,
        currentExpiredAt: card.expiredAt,
        reason: "Published date preceded any verified paid order payment timestamp",
      });
    }
  }

  return {
    totalActiveCardsWithExpiry: cards.length,
    candidatesToClearExpiry,
    ambiguousCards,
    validFreeCards,
  };
}

// Standalone execution entrypoint
if (require.main === module) {
  auditCardExpiryCandidates()
    .then((report) => {
      logger.info(
        {
          total: report.totalActiveCardsWithExpiry,
          candidates: report.candidatesToClearExpiry.length,
          ambiguous: report.ambiguousCards.length,
          validFree: report.validFreeCards.length,
        },
        "Card expiry audit completed (Read-only report)"
      );
      console.log(JSON.stringify(report, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      logger.error({ err }, "Card expiry audit failed");
      process.exit(1);
    });
}
