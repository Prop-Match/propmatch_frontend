"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/src/lib/api/browserClient";
import { isVerificationRequired, toActionError, type ActionError } from "@/src/lib/api/actionError";
import { verificationQueryKey } from "@/src/features/ekyc/hooks/useKyc";
import type { CreateTenantRequest, TenantRequest } from "@/src/lib/api/contracts/tenantRequest";

/** PRO-05 — the tenant side of the reverse marketplace. */

const KEY = ["tenant", "requests"] as const;

export function useMyTenantRequests() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => api.get<{ items: TenantRequest[] }>("tenant/requests"),
  });
}

export function useCreateTenantRequest() {
  const qc = useQueryClient();
  return useMutation<TenantRequest, ActionError, CreateTenantRequest>({
    retry: false,
    mutationFn: async (body) => {
      try {
        return await api.post<TenantRequest>("tenant/requests", body);
      } catch (e) {
        throw toActionError(e);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: async (error) => {
      if (!isVerificationRequired(error)) return;

      await qc.refetchQueries({ queryKey: verificationQueryKey, exact: true });
    },
  });
}

export function useCloseTenantRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => api.post<{ ok: boolean }>(`tenant/requests/${requestId}/close`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
