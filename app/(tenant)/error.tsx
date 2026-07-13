"use client";

import { RouteError } from "@/src/components/RouteError";

export default function TenantError({ reset }: { error: Error; reset: () => void }) {
  return <RouteError reset={reset} homeHref="/tenant" />;
}
