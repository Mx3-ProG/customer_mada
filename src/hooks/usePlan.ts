import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyPlan } from "@/lib/billing.functions";
import { NO_PLAN, type PlanState } from "@/lib/billing";

export function usePlan() {
  const fetchPlan = useServerFn(getMyPlan);
  const query = useQuery({
    queryKey: ["my-plan"],
    queryFn: async (): Promise<PlanState> =>
      (await fetchPlan()) as unknown as PlanState,
    staleTime: 60_000,
  });
  return { ...query, plan: query.data ?? NO_PLAN };
}
