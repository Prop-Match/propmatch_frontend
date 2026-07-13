import type { AccountRole } from "@/src/lib/api/contracts/auth";

/** Where each role lands after auth. Dual-role users start in tenant view. */
export function landingAfterLogin(role: AccountRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "landlord":
      return "/landlord";
    case "user":
    case "tenant":
    case "both":
    default:
      return "/tenant";
  }
}

/**
 * The uniform base "user" account is both tenant- and landlord-capable
 * (everyone can browse AND list; listing is gated by verificationStatus, not
 * role). So the tenant⇄landlord mode switch is available to every normal
 * account. Legacy "both" is treated the same; single-purpose legacy
 * "tenant"/"landlord" and "admin" are not dual.
 */
export function isDualCapable(role?: AccountRole): boolean {
  return role === "user" || role === "both";
}
