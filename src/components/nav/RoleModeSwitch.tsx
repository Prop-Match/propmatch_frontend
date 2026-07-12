"use client";

import { useRouter } from "next/navigation";
import { useSessionUiStore } from "@/src/lib/store/useSessionUiStore";
import { cn } from "@/src/utils/cn";

/**
 * Dual-role ("الاثنين") accounts switch between tenant and landlord views.
 * Only rendered for role === "both". Navigates to the corresponding surface.
 */
export function RoleModeSwitch() {
  const router = useRouter();
  const { activeRoleContext, setActiveRoleContext } = useSessionUiStore();

  function switchTo(mode: "tenant" | "landlord") {
    setActiveRoleContext(mode);
    router.push(mode === "tenant" ? "/tenant" : "/landlord");
  }

  return (
    <div className="inline-flex rounded-pill border border-hairline bg-background p-0.5" role="tablist">
      {(["tenant", "landlord"] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          role="tab"
          aria-selected={activeRoleContext === mode}
          onClick={() => switchTo(mode)}
          className={cn(
            "rounded-pill px-3 py-1 text-caption font-bold transition-colors",
            activeRoleContext === mode ? "bg-primary text-white" : "text-muted",
          )}
        >
          {mode === "tenant" ? "مستأجر" : "مالك"}
        </button>
      ))}
    </div>
  );
}
