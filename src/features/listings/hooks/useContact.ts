"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/src/lib/api/browserClient";
import type { ContactStateResponse } from "@/src/lib/api/contracts/match";

/**
 * Gated-contact state for a property. The owner's phone/PII is present in the
 * response ONLY when status === "accepted" (both parties consented). The
 * backend enforces this; the UI simply never has the data before then.
 */
export function useContactState(propertyId: string) {
  return useQuery({
    queryKey: ["contact", propertyId],
    queryFn: () => api.get<ContactStateResponse>(`properties/${propertyId}/contact`),
  });
}

export function useRequestContact(propertyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<ContactStateResponse>(`properties/${propertyId}/contact`),
    onSuccess: (data) => qc.setQueryData(["contact", propertyId], data),
  });
}
