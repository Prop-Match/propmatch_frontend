import { create } from "zustand";

/**
 * Client-only UI state for the current session: active role context for
 * dual-role ("الاثنين") accounts, and mobile bottom-nav visibility.
 *
 * This store is NOT the source of truth for entitlements/quotas — those are
 * enforced server-side. It only mirrors server state for optimistic UI
 * (see docs/analysis/requirements.md, "Freemium quotas").
 */
export type ActiveRoleContext = "tenant" | "landlord";

interface SessionUiState {
  activeRoleContext: ActiveRoleContext;
  setActiveRoleContext: (role: ActiveRoleContext) => void;

  bottomNavVisible: boolean;
  setBottomNavVisible: (visible: boolean) => void;
}

export const useSessionUiStore = create<SessionUiState>((set) => ({
  activeRoleContext: "tenant",
  setActiveRoleContext: (role) => set({ activeRoleContext: role }),

  bottomNavVisible: true,
  setBottomNavVisible: (visible) => set({ bottomNavVisible: visible }),
}));
