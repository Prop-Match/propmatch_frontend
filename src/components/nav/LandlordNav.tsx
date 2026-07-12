"use client";

import { LayoutDashboard, MessageSquare, User as UserIcon } from "lucide-react";
import { RoleNav, NotificationBell } from "./RoleNav";
import { RoleModeSwitch } from "./RoleModeSwitch";

const items = [
  { href: "/landlord", label: "عقاراتي", Icon: LayoutDashboard },
  { href: "/landlord/inquiries", label: "الطلبات", Icon: MessageSquare },
  { href: "/profile", label: "حسابي", Icon: UserIcon },
];

/** Client wrapper so Lucide icon components never cross the RSC boundary. */
export function LandlordNav({ isDual }: { isDual: boolean }) {
  return (
    <RoleNav
      items={items}
      rightSlot={
        <>
          {isDual && <RoleModeSwitch />}
          <NotificationBell />
        </>
      }
    />
  );
}
