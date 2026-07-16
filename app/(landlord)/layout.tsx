import { LandlordNav } from "@/src/components/nav/LandlordNav";
import { requireSession } from "@/src/lib/api/serverSession";

export default async function LandlordLayout({ children }: { children: React.ReactNode }) {
  // Redirects to /login when unauthenticated; the backend remains the final
  // authority on role access (docs/analysis/rbac.md).
  await requireSession("/landlord");
  return (
    <div className="flex min-h-dvh flex-col pb-16 md:pb-0">
      <LandlordNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
