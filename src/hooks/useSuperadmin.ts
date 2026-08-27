import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import {
  listAllClients,
  listAllSubscriptions,
  setUserPlan,
  type AdminClientRow,
  type AdminSubscriptionRow,
} from "@/lib/admin.functions";

export function useIsSuperadmin() {
  return useQuery({
    queryKey: ["is-superadmin"],
    queryFn: async (): Promise<boolean> => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return false;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "superadmin")
        .maybeSingle();
      if (error) return false;
      return Boolean(data);
    },
  });
}

export function useAllClients(enabled: boolean) {
  const fetchAll = useServerFn(listAllClients);
  return useQuery({
    queryKey: ["all-clients"],
    enabled,
    queryFn: async (): Promise<AdminClientRow[]> =>
      (await fetchAll()) as unknown as AdminClientRow[],
  });
}

export function useAllSubscriptions(enabled: boolean) {
  const fetchAll = useServerFn(listAllSubscriptions);
  return useQuery({
    queryKey: ["all-subscriptions"],
    enabled,
    queryFn: async (): Promise<AdminSubscriptionRow[]> =>
      (await fetchAll()) as unknown as AdminSubscriptionRow[],
  });
}

export function useSetUserPlan() {
  const setPlan = useServerFn(setUserPlan);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { userId: string; plan: "free" | "pro" }) => setPlan({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-subscriptions"] });
    },
  });
}
