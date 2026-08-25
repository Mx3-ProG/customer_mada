export const FREE_CLIENT_LIMIT = 30;
export const PRO_PRICE_EUR = 10;

export type PlanState = {
  plan: "free" | "pro";
  status: string;
  isPro: boolean;
  /** Superadmins bypass every limit. */
  unlimited: boolean;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

export const FREE_PLAN: PlanState = {
  plan: "free",
  status: "inactive",
  isPro: false,
  unlimited: false,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
};

export function canAddClient(plan: PlanState, clientCount: number) {
  return plan.unlimited || plan.isPro || clientCount < FREE_CLIENT_LIMIT;
}

export function remainingFreeSlots(plan: PlanState, clientCount: number) {
  if (plan.unlimited || plan.isPro) return Infinity;
  return Math.max(0, FREE_CLIENT_LIMIT - clientCount);
}
