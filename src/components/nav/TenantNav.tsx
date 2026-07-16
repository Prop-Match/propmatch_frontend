"use client";

import { Search, Sparkles, Scale, User as UserIcon } from "lucide-react";
import { RoleNav, NotificationBell } from "./RoleNav";

const items = [
  { href: "/tenant", label: "تصفّح", Icon: Search },
  { href: "/tenant/match", label: "المطابقة", Icon: Sparkles },
  { href: "/tenant/legal", label: "المساعد القانوني", Icon: Scale },
  { href: "/profile", label: "حسابي", Icon: UserIcon },
];

/** Client wrapper so Lucide icon components never cross the RSC boundary. */
export function TenantNav() {
  return <RoleNav items={items} rightSlot={<NotificationBell />} />;
}
