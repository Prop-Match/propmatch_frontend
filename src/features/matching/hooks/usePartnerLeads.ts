"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/src/lib/api/browserClient";
import type { CreatePartnerLeadRequest, PartnerLead } from "@/src/lib/api/contracts/partnerLead";

/**
 * PRO-16 — B2B partner opt-in, offered right after a match connects. Opt-in is
 * explicit: nothing is routed to a partner without the tenant ticking a box.
 */
export function useCreatePartnerLeads() {
  return useMutation({
    mutationFn: (body: CreatePartnerLeadRequest) => api.post<{ items: PartnerLead[] }>("partner-leads", body),
  });
}
