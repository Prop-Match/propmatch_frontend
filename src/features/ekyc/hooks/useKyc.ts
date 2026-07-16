"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/src/lib/api/browserClient";
import type {
  KycDocument,
  KycUploadResponse,
  VerificationState,
} from "@/src/lib/api/contracts/verification";

const KEY = ["verification"] as const;

export function useVerificationState() {
  return useQuery({ queryKey: KEY, queryFn: () => api.get<VerificationState>("verification") });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { document: KycDocument; simulateUnreadable?: boolean }) =>
      api.post<KycUploadResponse>("verification/upload", vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useSubmitVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (nationalId: string) => api.post<{ ok: boolean }>("verification/submit", { nationalId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      // The session carries the derived verificationStatus used by every gate.
      qc.invalidateQueries({ queryKey: ["session"] });
    },
  });
}
