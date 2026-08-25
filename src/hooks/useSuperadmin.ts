import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listAllClients, type AdminClientRow } from "@/lib/admin.functions";

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
