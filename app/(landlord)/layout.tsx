import { LayoutDashboard, MessageSquare, User as UserIcon } from "lucide-react";
import { RoleNav, NotificationBell } from "@/src/components/nav/RoleNav";
import { RoleModeSwitch } from "@/src/components/nav/RoleModeSwitch";
import { requireSession } from "@/src/lib/api/serverSession";

const items = [
  { href: "/landlord", label: "عقاراتي", Icon: LayoutDashboard },
  { href: "/landlord/inquiries", label: "الطلبات", Icon: MessageSquare },
  { href: "/profile", label: "حسابي", Icon: UserIcon },
];

export default async function LandlordLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSession("/landlord");
  return (
    <div className="flex min-h-dvh flex-col pb-16 md:pb-0">
      <RoleNav
        items={items}
        rightSlot={
          <>
            {user.role === "both" && <RoleModeSwitch />}
            <NotificationBell />
          </>
        }
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
