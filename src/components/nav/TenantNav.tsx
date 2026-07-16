"use client";

import { Search, FileText, Inbox, Scale, User as UserIcon } from "lucide-react";
import { RoleNav, NotificationBell } from "./RoleNav";

const items = [
  { href: "/tenant", label: "تصفّح", Icon: Search },
  { href: "/tenant/requests", label: "طلباتي", Icon: FileText },
  { href: "/tenant/offers", label: "العروض", Icon: Inbox },
  { href: "/tenant/legal", label: "القانوني", Icon: Scale },
  { href: "/profile", label: "حسابي", Icon: UserIcon },
];

/** Client wrapper so Lucide icon components never cross the RSC boundary. */
export function TenantNav() {
  return <RoleNav items={items} rightSlot={<NotificationBell />} />;
}
