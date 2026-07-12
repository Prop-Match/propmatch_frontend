import { Search, Sparkles, Scale, User as UserIcon } from "lucide-react";
import { RoleNav, NotificationBell } from "@/src/components/nav/RoleNav";
import { RoleModeSwitch } from "@/src/components/nav/RoleModeSwitch";
import { getServerSession } from "@/src/lib/api/serverSession";

const items = [
  { href: "/tenant", label: "تصفّح", Icon: Search },
  { href: "/tenant/match", label: "المطابقة", Icon: Sparkles },
  { href: "/tenant/legal", label: "المساعد القانوني", Icon: Scale },
  { href: "/profile", label: "حسابي", Icon: UserIcon },
];

export default async function TenantLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerSession();
  return (
    <div className="flex min-h-dvh flex-col pb-16 md:pb-0">
      <RoleNav
        items={items}
        rightSlot={
          <>
            {user?.role === "both" && <RoleModeSwitch />}
            <NotificationBell />
          </>
        }
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
