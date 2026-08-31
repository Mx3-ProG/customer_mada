import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Client, ClientDraft } from "@/lib/clients";

export const listClients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Client[]> => {
    const { decryptClientRow } = await import("@/lib/crypto.server");
    const { data, error } = await context.supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ((data ?? []) as unknown as Client[]).map(decryptClientRow);
  });

export const saveClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { id?: string | undefined; draft: ClientDraft }) => input,
  )
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { encryptClientDraft } = await import("@/lib/crypto.server");
    const encrypted = encryptClientDraft(data.draft);

    if (data.id) {
      const { error } = await context.supabase
        .from("clients")
        .update(encrypted)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    const { error } = await context.supabase
      .from("clients")
      .insert({ ...encrypted, user_id: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => ({ id: String(input.id) }))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { error } = await context.supabase
      .from("clients")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
