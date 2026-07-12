import type { AccountRole } from "@/src/lib/api/contracts/auth";

/** Where each role lands after auth. Dual-role users start in tenant view. */
export function landingAfterLogin(role: AccountRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "landlord":
      return "/landlord";
    case "tenant":
    case "both":
    default:
      return "/tenant";
  }
}
