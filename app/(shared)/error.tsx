"use client";

import { RouteError } from "@/src/components/RouteError";

export default function SharedError({ reset }: { error: Error; reset: () => void }) {
  return <RouteError reset={reset} />;
}
