import { TenantNav } from "@/src/components/nav/TenantNav";
import { getServerSession } from "@/src/lib/api/serverSession";
import { isDualCapable } from "@/src/features/auth/roleRouting";

export default async function TenantLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerSession();
  return (
    <div className="flex min-h-dvh flex-col pb-16 md:pb-0">
      <TenantNav isDual={isDualCapable(user?.role)} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
