"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { api, isApiClientError } from "@/src/lib/api/browserClient";
import {
  QuotaExhaustedPayloadSchema,
  type MatchIntake,
  type MatchResponse,
  type QuotaExhaustedPayload,
} from "@/src/lib/api/contracts/match";

export function useMatchQuota() {
  return useQuery({
    queryKey: ["match", "quota"],
    queryFn: () => api.get<{ remaining: number }>("match/quota"),
  });
}

export interface MatchError {
  quotaExhausted: QuotaExhaustedPayload | null;
  message: string;
}

export function useRunMatch() {
  return useMutation<MatchResponse, MatchError, MatchIntake>({
    mutationFn: async (intake) => {
      try {
        return await api.post<MatchResponse>("match", intake);
      } catch (e) {
        if (isApiClientError(e) && e.statusCode === 403) {
          const parsed = QuotaExhaustedPayloadSchema.safeParse(e.body);
          throw {
            quotaExhausted: parsed.success ? parsed.data : null,
            message: e.message,
          } satisfies MatchError;
        }
        throw { quotaExhausted: null, message: isApiClientError(e) ? e.message : "تعذر تشغيل المطابقة" } satisfies MatchError;
      }
    },
  });
}
