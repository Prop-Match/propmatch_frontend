"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/src/lib/api/browserClient";
import type { KycState, KycStep, KycUploadResponse } from "@/src/lib/api/contracts/verification";

const KEY = ["kyc", "state"] as const;

export function useKycState() {
  return useQuery({ queryKey: KEY, queryFn: () => api.get<KycState>("kyc/state") });
}

export function useKycUpload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { step: KycStep; simulateBadQuality?: boolean }) =>
      api.post<KycUploadResponse>("kyc/upload", vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useKycSubmit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ ok: boolean }>("kyc/submit"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["session"] });
    },
  });
}
