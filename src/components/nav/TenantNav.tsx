"use client";

import { Search, Sparkles, Scale, User as UserIcon } from "lucide-react";
import { RoleNav, NotificationBell } from "./RoleNav";
import { RoleModeSwitch } from "./RoleModeSwitch";

const items = [
  { href: "/tenant", label: "تصفّح", Icon: Search },
  { href: "/tenant/match", label: "المطابقة", Icon: Sparkles },
  { href: "/tenant/legal", label: "المساعد القانوني", Icon: Scale },
  { href: "/profile", label: "حسابي", Icon: UserIcon },
];

/** Client wrapper so Lucide icon components never cross the RSC boundary. */
export function TenantNav({ isDual }: { isDual: boolean }) {
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
