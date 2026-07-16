"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, isApiClientError } from "@/src/lib/api/browserClient";
import type {
  CreatePropertyRequest,
  OptimizeDescriptionResponse,
  PropertyDetail,
  PropertySummary,
} from "@/src/lib/api/contracts/property";
import type { UserQuota } from "@/src/lib/api/contracts/payment";

/** ERD: USER_QUOTA is landlord-only, so this can legitimately be null. */
export function useQuota() {
  return useQuery({
    queryKey: ["quota"],
    queryFn: () => api.get<UserQuota | null>("quota"),
  });
}

export function useMyProperties() {
  return useQuery({
    queryKey: ["properties", "mine"],
    queryFn: () => api.get<{ items: PropertySummary[] }>("landlord/properties"),
  });
}

export interface CreatePropertyResult {
  property: PropertyDetail;
}

/**
 * A domain error the UI must react to specifically rather than showing a
 * generic failure: VERIFICATION_REQUIRED → send to eKYC; QUOTA_EXHAUSTED →
 * open the paywall for `paymentType` (docs/analysis/rbac.md "gate composition").
 */
export interface LandlordActionError {
  code?: string;
  paymentType?: string;
  message: string;
}

function toActionError(e: unknown): LandlordActionError {
  if (isApiClientError(e)) {
    const body = e.body as { code?: string; paymentType?: string } | null;
    return { code: body?.code, paymentType: body?.paymentType, message: e.message };
  }
  return { message: "تعذر إتمام العملية، حاول مرة أخرى" };
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation<CreatePropertyResult, LandlordActionError, CreatePropertyRequest>({
    mutationFn: async (body) => {
      try {
        return await api.post<CreatePropertyResult>("landlord/properties", body);
      } catch (e) {
        throw toActionError(e);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties", "mine"] });
      qc.invalidateQueries({ queryKey: ["quota"] });
    },
  });
}

export function useOptimizeDescription(propertyId = "draft") {
  const qc = useQueryClient();
  return useMutation<OptimizeDescriptionResponse, LandlordActionError, string>({
    mutationFn: async (description) => {
      try {
        return await api.post<OptimizeDescriptionResponse>(
          `landlord/properties/${propertyId}/optimize-description`,
          { description },
        );
      } catch (e) {
        throw toActionError(e);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quota"] }),
  });
}

export function useBoostProperty(propertyId: string) {
  return useMutation<{ ok: boolean }, LandlordActionError, void>({
    mutationFn: async () => {
      try {
        return await api.post<{ ok: boolean }>(`landlord/properties/${propertyId}/boost`);
      } catch (e) {
        throw toActionError(e);
      }
    },
  });
}

export function useArchiveProperty(propertyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ ok: boolean }>(`landlord/properties/${propertyId}/archive`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["properties"] }),
  });
}
