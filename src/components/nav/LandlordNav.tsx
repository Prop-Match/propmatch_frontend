"use client";

import { LayoutDashboard, Users, Send, User as UserIcon } from "lucide-react";
import { RoleNav, NotificationBell } from "./RoleNav";

const items = [
  { href: "/landlord", label: "عقاراتي", Icon: LayoutDashboard },
  { href: "/landlord/requests", label: "طلبات المستأجرين", Icon: Users },
  { href: "/landlord/offers", label: "عروضي", Icon: Send },
  { href: "/profile", label: "حسابي", Icon: UserIcon },
];

/** Client wrapper so Lucide icon components never cross the RSC boundary. */
export function LandlordNav() {
  return <RoleNav items={items} rightSlot={<NotificationBell />} />;
}
