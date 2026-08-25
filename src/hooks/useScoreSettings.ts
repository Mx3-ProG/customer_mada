import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_SETTINGS, type ScoreSettings } from "@/lib/clients";

const KEY = ["score-settings"] as const;

export function useScoreSettings() {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<ScoreSettings> => {
      const { data, error } = await supabase
        .from("score_settings")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      if (!data) return DEFAULT_SETTINGS;
      const row = data as unknown as Record<string, number>;
      const merged = { ...DEFAULT_SETTINGS };
      (Object.keys(DEFAULT_SETTINGS) as (keyof ScoreSettings)[]).forEach((k) => {
        const v = row[k];
        if (typeof v === "number" && Number.isFinite(v)) merged[k] = v;
      });
      return merged;
    },
  });
}

export function useSaveScoreSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: ScoreSettings) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Session expirée, reconnectez-vous.");
      const { error } = await supabase
        .from("score_settings")
        .upsert({ ...settings, user_id: userId }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
