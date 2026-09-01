export type PlanKind = "monthly" | "annual";

export const MONTHLY_PRICE_EUR = 39.99;
export const ANNUAL_PRICE_EUR = 399;
/** Discounted first-month price for new accounts on the monthly plan. */
export const FIRST_MONTH_PRICE_EUR = 19.99;
export const TRIAL_DAYS = 14;

export type PlanState = {
  /** Which plan is billed — null if the account never subscribed or its subscription ended. */
  plan: PlanKind | null;
  status: string;
  /** True while the account has full paid (or trialing, or admin-granted) access. */
  isPro: boolean;
  /** Superadmins bypass billing entirely. */
  unlimited: boolean;
  trialEnd: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

export const NO_PLAN: PlanState = {
  plan: null,
  status: "inactive",
  isPro: false,
  unlimited: false,
  trialEnd: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
};

/** Whether the account can use the app at all — subscribed (incl. trialing) or admin-granted. */
export function hasAccess(plan: PlanState): boolean {
  return plan.unlimited || plan.isPro;
}
