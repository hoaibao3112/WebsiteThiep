import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const prismaMock = vi.hoisted(() => ({
  $queryRawUnsafe: vi.fn(),
  plan: { findMany: vi.fn() },
  user: { count: vi.fn().mockResolvedValue(10) },
  account: { count: vi.fn().mockResolvedValue(10) },
  card: { count: vi.fn().mockResolvedValue(15) },
  order: {
    count: vi.fn().mockResolvedValue(5),
    findMany: vi.fn(),
    updateMany: vi.fn(),
  },
  paymentTransaction: { count: vi.fn().mockResolvedValue(5) },
}));

vi.mock("../../src/lib/prisma", () => ({
  prisma: prismaMock,
}));

import { runPaymentDbPreflight } from "../../scripts/payment-db-preflight";

describe("Database migrations and preflight contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Baseline migration file structure", () => {
    it("has a valid baseline migration file before the tenancy migration", () => {
      const baselinePath = resolve(
        process.cwd(),
        "prisma/migrations/20260831200000_init_baseline/migration.sql"
      );
      expect(existsSync(baselinePath)).toBe(true);

      const sql = readFileSync(baselinePath, "utf-8");
      expect(sql).toContain('CREATE TABLE "users"');
      expect(sql).toContain('CREATE TABLE "plans"');
      expect(sql).toContain('CREATE TABLE "templates"');
      expect(sql).toContain('CREATE TABLE "cards"');
      expect(sql).toContain('CREATE TABLE "orders"');
      expect(sql).toContain('CREATE TYPE "Role"');
      expect(sql).toContain('CREATE TYPE "PlanCode"');
    });
  });

  describe("runPaymentDbPreflight", () => {
    it("reports ready when no failed migrations and no order conflicts exist", async () => {
      // Mock completed migrations
      prismaMock.$queryRawUnsafe
        .mockResolvedValueOnce([
          { migration_name: "20260831200000_init_baseline", finished_at: new Date(), rolled_back_at: null },
          { migration_name: "20260831235000_add_account_tenancy", finished_at: new Date(), rolled_back_at: null },
        ])
        // Mock pg_indexes for partial unique index
        .mockResolvedValueOnce([
          {
            indexname: "orders_active_account_plan_uniq",
            indexdef: 'CREATE UNIQUE INDEX orders_active_account_plan_uniq ON public.orders USING btree ("accountId", "planId") WHERE (status = ANY (ARRAY[\'PENDING\'::text, \'AWAITING_REVIEW\'::text]))',
          },
        ]);

      prismaMock.plan.findMany.mockResolvedValueOnce([
        { code: "FREE" },
        { code: "BASIC" },
        { code: "VIP" },
      ]);

      // Overdue orders: 0
      prismaMock.order.findMany
        .mockResolvedValueOnce([]) // overdue orders
        .mockResolvedValueOnce([
          // active unexpired orders: distinct account+plan
          { id: "o-1", accountId: "acc-1", planId: "plan-vip", status: "PENDING" },
          { id: "o-2", accountId: "acc-2", planId: "plan-basic", status: "AWAITING_REVIEW" },
        ]);

      const report = await runPaymentDbPreflight(prismaMock as any);

      expect(report.isReadyForMigration).toBe(true);
      expect(report.blockingIssues).toEqual([]);
      expect(report.migrations.appliedCount).toBe(2);
      expect(report.migrations.failedCount).toBe(0);
      expect(report.plansConfigured.free).toBe(true);
      expect(report.plansConfigured.basic).toBe(true);
      expect(report.plansConfigured.vip).toBe(true);
      expect(report.partialUniqueIndex.exists).toBe(true);
      expect(report.partialUniqueIndex.validPredicate).toBe(true);
      expect(report.orderConflicts.duplicateActiveOrdersCount).toBe(0);
    });

    it("detects failed migrations in _prisma_migrations and flags blocking issue", async () => {
      prismaMock.$queryRawUnsafe
        .mockResolvedValueOnce([
          { migration_name: "20260831235000_add_account_tenancy", finished_at: null, rolled_back_at: null },
        ])
        .mockResolvedValueOnce([]); // no index

      prismaMock.plan.findMany.mockResolvedValueOnce([]);
      prismaMock.order.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

      const report = await runPaymentDbPreflight(prismaMock as any);

      expect(report.isReadyForMigration).toBe(false);
      expect(report.migrations.failedCount).toBe(1);
      expect(report.blockingIssues.some((issue) => issue.includes("chưa hoàn thành"))).toBe(true);
    });

    it("detects duplicate active orders for the same account+plan and blocks migration", async () => {
      prismaMock.$queryRawUnsafe.mockResolvedValue([]);
      prismaMock.plan.findMany.mockResolvedValueOnce([{ code: "FREE" }, { code: "BASIC" }, { code: "VIP" }]);

      prismaMock.order.findMany
        .mockResolvedValueOnce([]) // no overdue
        .mockResolvedValueOnce([
          // Duplicate active orders for acc-1 & plan-vip!
          { id: "o-dup-1", accountId: "acc-1", planId: "plan-vip", status: "PENDING" },
          { id: "o-dup-2", accountId: "acc-1", planId: "plan-vip", status: "AWAITING_REVIEW" },
        ]);

      const report = await runPaymentDbPreflight(prismaMock as any);

      expect(report.isReadyForMigration).toBe(false);
      expect(report.orderConflicts.duplicateActiveOrdersCount).toBe(1);
      expect(report.orderConflicts.duplicateActiveOrderGroups[0].hasAwaitingReview).toBe(true);
      expect(report.orderConflicts.duplicateActiveOrderGroups[0].orderIds).toEqual(["o-dup-1", "o-dup-2"]);
      expect(report.blockingIssues.some((issue) => issue.includes("Xung đột đơn hàng"))).toBe(true);
    });

    it("auto-expires overdue pending orders when option is enabled", async () => {
      prismaMock.$queryRawUnsafe.mockResolvedValue([]);
      prismaMock.plan.findMany.mockResolvedValueOnce([]);

      prismaMock.order.findMany
        .mockResolvedValueOnce([{ id: "o-old-1" }, { id: "o-old-2" }]) // 2 overdue orders
        .mockResolvedValueOnce([]); // no active duplicate orders

      prismaMock.order.updateMany.mockResolvedValueOnce({ count: 2 });

      const report = await runPaymentDbPreflight(prismaMock as any, { autoExpireExpiredOrders: true });

      expect(report.orderConflicts.expiredOrdersIdentified).toBe(2);
      expect(report.orderConflicts.expiredOrdersUpdated).toBe(2);
      expect(prismaMock.order.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: ["o-old-1", "o-old-2"] },
          status: "PENDING",
        },
        data: { status: "EXPIRED" },
      });
    });
  });
});
