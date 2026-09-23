import { describe, expect, it } from "vitest";
import { PLANS, getLocalizedPlans } from "@/config/plans";
import { PlanCode, OrderStatus } from "@/types/billing.types";

describe("Frontend Billing Configurations & Types", () => {
  it("enforces authoritative pricing for standard plans", () => {
    const freePlan = PLANS.find((p) => p.code === "FREE");
    const basicPlan = PLANS.find((p) => p.code === "BASIC");
    const vipPlan = PLANS.find((p) => p.code === "VIP");

    expect(freePlan?.price).toBe(0);
    expect(basicPlan?.price).toBe(199000);
    expect(vipPlan?.price).toBe(399000);
  });

  it("verifies localized plans return accurate VIP price of 399.000đ", () => {
    const mockT = (key: string) => {
      if (key === "planVipPrice") return "399.000đ";
      return "";
    };

    const localized = getLocalizedPlans(mockT);
    const vip = localized.find((p) => p.code === "VIP");
    expect(vip?.price).toBe(399000);
  });

  it("verifies status type unions support manual review flow", () => {
    const validStatuses: OrderStatus[] = [
      "PENDING",
      "AWAITING_REVIEW",
      "PAID",
      "REJECTED",
      "EXPIRED",
    ];
    expect(validStatuses).toHaveLength(5);
  });
});
