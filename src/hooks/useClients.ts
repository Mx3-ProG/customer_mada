import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { Client, ClientDraft } from "@/lib/clients";
import { deleteClient, listClients, saveClient } from "@/lib/clients.functions";

const KEY = ["clients"] as const;

export function useClients() {
  const fetchClients = useServerFn(listClients);
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<Client[]> =>
      (await fetchClients()) as unknown as Client[],
  });
}

export function useSaveClient() {
  const save = useServerFn(saveClient);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, draft }: { id?: string; draft: ClientDraft }) => {
      await save({ data: { id, draft } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteClient() {
  const del = useServerFn(deleteClient);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await del({ data: { id } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
