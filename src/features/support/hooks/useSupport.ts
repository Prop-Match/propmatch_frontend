"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/src/lib/api/browserClient";
import type { SupportThread } from "@/src/lib/api/contracts/support";

const KEY = ["support", "thread"] as const;

export function useSupportThread() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => api.get<SupportThread>("support/thread"),
    // Poll so admin replies appear in the user's thread without a refresh.
    refetchInterval: 5000,
  });
}

export function useSendSupportMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => api.post<SupportThread>("support/message", { message }),
    onSuccess: (data) => qc.setQueryData(KEY, data),
  });
}

export function useEscalateSupport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<SupportThread>("support/escalate"),
    onSuccess: (data) => qc.setQueryData(KEY, data),
  });
}
