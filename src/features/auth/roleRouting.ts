import type { AccountRole } from "@/src/lib/api/contracts/auth";

/** Where each role lands after auth. */
export function landingAfterLogin(role: AccountRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "landlord":
      return "/landlord";
    case "tenant":
    default:
      return "/tenant";
  }
}

/**
 * Under the strict role-based account system, accounts are dedicated and isolated.
 * There is no tenant/landlord mode switching for unified profiles.
 */
export function isDualCapable(role?: AccountRole): boolean {
  return false;
}
