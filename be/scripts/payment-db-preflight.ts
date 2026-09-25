import { prisma } from "../src/lib/prisma";
import { logger } from "../src/lib/logger";

export interface PreflightReport {
  timestamp: string;
  isReadyForMigration: boolean;
  migrations: {
    appliedCount: number;
    failedCount: number;
    failedMigrationNames: string[];
  };
  plansConfigured: {
    free: boolean;
    basic: boolean;
    vip: boolean;
  };
  tableStats: {
    users: number;
    accounts: number;
    cards: number;
    orders: number;
    transactions: number;
  };
  partialUniqueIndex: {
    exists: boolean;
    validPredicate: boolean;
  };
  orderConflicts: {
    expiredOrdersIdentified: number;
    expiredOrdersUpdated: number;
    duplicateActiveOrdersCount: number;
    duplicateActiveOrderGroups: Array<{
      accountId: string;
      planId: string;
      activeOrderCount: number;
      orderIds: string[];
      hasAwaitingReview: boolean;
    }>;
  };
  blockingIssues: string[];
}

/**
 * Preflight script for checking database readiness before running migrations.
 * Read-only by default. When autoExpireExpiredOrders is true, it safely marks
 * overdue pending orders as EXPIRED without touching conflicting unexpired orders.
 */
export async function runPaymentDbPreflight(
  db: typeof prisma = prisma,
  options: { autoExpireExpiredOrders?: boolean } = {}
): Promise<PreflightReport> {
  const blockingIssues: string[] = [];
  const now = new Date();

  // 1. Inspect _prisma_migrations table
  let appliedCount = 0;
  let failedCount = 0;
  const failedMigrationNames: string[] = [];

  try {
    const migrations: any[] = await db.$queryRawUnsafe(
      `SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations" ORDER BY started_at ASC`
    );
    for (const m of migrations) {
      if (m.finished_at && !m.rolled_back_at) {
        appliedCount++;
      } else if (!m.finished_at && !m.rolled_back_at) {
        failedCount++;
        failedMigrationNames.push(m.migration_name);
      }
    }
  } catch {
    // _prisma_migrations might not exist on an uninitialized DB
  }

  if (failedCount > 0) {
    blockingIssues.push(
      `Phát hiện migration bị lỗi hoặc chưa hoàn thành: ${failedMigrationNames.join(", ")}. Cần khắc phục trước khi migrate.`
    );
  }

  // 2. Check Plan configuration (FREE, BASIC, VIP)
  let free = false;
  let basic = false;
  let vip = false;

  try {
    const plans = await db.plan.findMany({
      where: { code: { in: ["FREE", "BASIC", "VIP"] } },
      select: { code: true },
    });
    const codes = new Set(plans.map((p) => p.code));
    free = codes.has("FREE");
    basic = codes.has("BASIC");
    vip = codes.has("VIP");
  } catch {
    // Plans table might not exist yet on fresh DB
  }

  // 3. Table row statistics
  const tableStats = {
    users: 0,
    accounts: 0,
    cards: 0,
    orders: 0,
    transactions: 0,
  };

  try {
    tableStats.users = await db.user.count();
    tableStats.accounts = await db.account.count();
    tableStats.cards = await db.card.count();
    tableStats.orders = await db.order.count();
    tableStats.transactions = await db.paymentTransaction.count();
  } catch {
    // Ignored if tables are not yet created
  }

  // 4. Verify partial unique index existence and definition in PostgreSQL
  let indexExists = false;
  let validPredicate = false;

  try {
    const indexes: any[] = await db.$queryRawUnsafe(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'orders' AND indexname = 'orders_active_account_plan_uniq'
    `);

    if (indexes.length > 0) {
      indexExists = true;
      const def = indexes[0].indexdef || "";
      if (
        def.includes("accountId") &&
        def.includes("planId") &&
        def.includes("PENDING") &&
        def.includes("AWAITING_REVIEW")
      ) {
        validPredicate = true;
      }
    }
  } catch {
    // Ignored if pg_indexes or orders table does not exist
  }

  // 5. Detect and handle overdue orders & duplicate active orders
  let expiredOrdersIdentified = 0;
  let expiredOrdersUpdated = 0;
  const duplicateActiveOrderGroups: PreflightReport["orderConflicts"]["duplicateActiveOrderGroups"] = [];

  try {
    // Find overdue PENDING orders
    const overdueOrders = await db.order.findMany({
      where: {
        status: "PENDING",
        expiresAt: { lt: now },
      },
      select: { id: true },
    });
    expiredOrdersIdentified = overdueOrders.length;

    if (options.autoExpireExpiredOrders && expiredOrdersIdentified > 0) {
      const updateRes = await db.order.updateMany({
        where: {
          id: { in: overdueOrders.map((o) => o.id) },
          status: "PENDING",
        },
        data: { status: "EXPIRED" },
      });
      expiredOrdersUpdated = updateRes.count;
    }

    // Group active orders by accountId + planId
    const activeOrders = await db.order.findMany({
      where: {
        status: { in: ["PENDING", "AWAITING_REVIEW"] },
        expiresAt: { gt: now },
      },
      select: {
        id: true,
        accountId: true,
        planId: true,
        status: true,
      },
    });

    const groups = new Map<string, typeof activeOrders>();
    for (const ord of activeOrders) {
      const key = `${ord.accountId}:::${ord.planId}`;
      const list = groups.get(key) || [];
      list.push(ord);
      groups.set(key, list);
    }

    for (const [key, list] of groups.entries()) {
      if (list.length > 1) {
        const [accountId, planId] = key.split(":::");
        const hasAwaitingReview = list.some((o) => o.status === "AWAITING_REVIEW");
        duplicateActiveOrderGroups.push({
          accountId,
          planId,
          activeOrderCount: list.length,
          orderIds: list.map((o) => o.id),
          hasAwaitingReview,
        });

        blockingIssues.push(
          `Xung đột đơn hàng: Tài khoản ${accountId} có ${list.length} đơn active cho cùng gói ${planId}. ${
            hasAwaitingReview ? "Có đơn đang chờ duyệt (AWAITING_REVIEW)!" : ""
          } Cần đối soát trước khi tạo unique index.`
        );
      }
    }
  } catch {
    // Ignored if orders table not ready
  }

  const isReadyForMigration = blockingIssues.length === 0;

  return {
    timestamp: now.toISOString(),
    isReadyForMigration,
    migrations: {
      appliedCount,
      failedCount,
      failedMigrationNames,
    },
    plansConfigured: { free, basic, vip },
    tableStats,
    partialUniqueIndex: {
      exists: indexExists,
      validPredicate,
    },
    orderConflicts: {
      expiredOrdersIdentified,
      expiredOrdersUpdated,
      duplicateActiveOrdersCount: duplicateActiveOrderGroups.length,
      duplicateActiveOrderGroups,
    },
    blockingIssues,
  };
}

if (require.main === module) {
  const autoExpire = process.argv.includes("--auto-expire");
  runPaymentDbPreflight(prisma, { autoExpireExpiredOrders: autoExpire })
    .then((report) => {
      logger.info(
        {
          ready: report.isReadyForMigration,
          appliedMigrations: report.migrations.appliedCount,
          failedMigrations: report.migrations.failedCount,
          blockingIssuesCount: report.blockingIssues.length,
        },
        "Database migration preflight check finished"
      );

      console.log(JSON.stringify(report, null, 2));

      if (!report.isReadyForMigration) {
        console.error("Migration preflight checks failed with blocking issues!");
        process.exit(1);
      }
      process.exit(0);
    })
    .catch((err) => {
      logger.error({ err }, "Migration preflight check crashed");
      process.exit(1);
    });
}
