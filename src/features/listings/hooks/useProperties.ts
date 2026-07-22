"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/src/lib/api/browserClient";
import type {
  PropertyDetail,
  PropertySearchQuery,
  PropertySummary,
} from "@/src/lib/api/contracts/property";

interface Paginated<T> {
  items: T[];
  total: number;
}

/**
 * PRO-11 hybrid search: the hard filters below are SQL `WHERE` clauses on the
 * backend, while `q` is the semantic half (ChromaDB). Only send keys the user
 * actually set — an empty string would filter everything out.
 */
function toSearchParams(query: PropertySearchQuery): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useApprovedProperties(query: PropertySearchQuery) {
  return useQuery({
    queryKey: ["properties", "browse", query],
    queryFn: () => api.get<Paginated<PropertySummary>>(`properties${toSearchParams(query)}`),
  });
}

/** Natural-language search for approved properties, triggered only on submit. */
export function useSemanticPropertySearch(query: string | null, limit = 10) {
  return useQuery({
    queryKey: ["properties", "semantic-search", query, limit],
    queryFn: () => {
      const params = new URLSearchParams({ query: query ?? "", limit: String(limit) });
      return api.get<Paginated<PropertySummary>>(`properties/search/semantic?${params.toString()}`);
    },
    enabled: query !== null,
    retry: false,
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
