"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/src/lib/api/browserClient";
import type { PropertyDetail, PropertySummary } from "@/src/lib/api/contracts/property";

interface Paginated<T> {
  items: T[];
  total: number;
}

export function useApprovedProperties(search: string) {
  return useQuery({
    queryKey: ["properties", "browse", search],
    queryFn: () =>
      api.get<Paginated<PropertySummary>>(`properties${search ? `?q=${encodeURIComponent(search)}` : ""}`),
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ["properties", id],
    queryFn: () => api.get<PropertyDetail>(`properties/${id}`),
  });
}

export function useMyProperties() {
  return useQuery({
    queryKey: ["properties", "mine"],
    queryFn: () => api.get<Paginated<PropertySummary>>("landlord/properties"),
  });
}
