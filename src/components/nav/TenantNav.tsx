"use client";

import { Search, FileText, Inbox, Heart, User as UserIcon } from "lucide-react";
import { RoleNav, NotificationBell } from "./RoleNav";

/**
 * Five slots max — the mobile bottom bar can't carry more. The legal assistant
 * (PRO-17) gave up its slot to المفضلة and is reached from /profile instead.
 */
const items = [
  { href: "/tenant", label: "تصفّح", Icon: Search },
  { href: "/tenant/requests", label: "طلباتي", Icon: FileText },
  { href: "/tenant/offers", label: "العروض", Icon: Inbox },
  { href: "/tenant/favorites", label: "المفضلة", Icon: Heart },
  { href: "/profile", label: "حسابي", Icon: UserIcon },
];

/** Client wrapper so Lucide icon components never cross the RSC boundary. */
export function TenantNav() {
  return <RoleNav items={items} rightSlot={<NotificationBell />} />;
}
