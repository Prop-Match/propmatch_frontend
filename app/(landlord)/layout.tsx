import { LandlordNav } from "@/src/components/nav/LandlordNav";
import { requireRole } from "@/src/lib/api/serverSession";

export default async function LandlordLayout({ children }: { children: React.ReactNode }) {
  // Unauthenticated → /login; signed in as a tenant/admin → their own landing.
  // Without the role check the page renders and then every call 403s. The
  // backend remains the final authority (docs/analysis/rbac.md).
  await requireRole("landlord", "/landlord");
  return (
    <div className="flex min-h-dvh flex-col pb-16 md:pb-0">
      <LandlordNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
