"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, isApiClientError } from "@/src/lib/api/browserClient";
import type { CreatePropertyRequest, OptimizeDescriptionResponse, PropertyDetail } from "@/src/lib/api/contracts/property";

export interface CreatePropertyResult {
  property: PropertyDetail;
  requiresPayment: boolean;
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePropertyRequest) => api.post<CreatePropertyResult>("landlord/properties", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["properties", "mine"] }),
  });
}

export type OptimizeResult = OptimizeDescriptionResponse;

export function useOptimizeDescription(propertyDraftId = "draft") {
  return useMutation<OptimizeResult, { exhausted: boolean; message: string }, string>({
    mutationFn: async (description) => {
      try {
        return await api.post<OptimizeResult>(`landlord/properties/${propertyDraftId}/optimize-description`, {
          description,
        });
      } catch (e) {
        const exhausted = isApiClientError(e) && e.statusCode === 403;
        throw { exhausted, message: isApiClientError(e) ? e.message : "تعذر تحسين الوصف" };
      }
    },
  });
}

export interface InquiryItem {
  id: string;
  status: "requested" | "accepted";
  createdAt: string;
  propertyTitle: string;
  propertyId: string;
  tenantVerified: boolean;
  tenantName: string;
  tenantPhone: string | null;
}

export function useInquiries() {
  return useQuery({
    queryKey: ["inquiries"],
    queryFn: () => api.get<{ items: InquiryItem[] }>("landlord/inquiries"),
  });
}

export function useAcceptInquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<{ ok: boolean }>(`landlord/inquiries/${id}/accept`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inquiries"] }),
  });
}
