import { LandlordNav } from "@/src/components/nav/LandlordNav";
import { requireSession } from "@/src/lib/api/serverSession";
import { isDualCapable } from "@/src/features/auth/roleRouting";

export default async function LandlordLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSession("/landlord");
  return (
    <div className="flex min-h-dvh flex-col pb-16 md:pb-0">
      <LandlordNav isDual={isDualCapable(user.role)} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
