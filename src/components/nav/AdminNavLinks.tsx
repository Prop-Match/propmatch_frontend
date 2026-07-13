"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck, BarChart3, Headset, Users, ScrollText } from "lucide-react";
import { cn } from "@/src/utils/cn";
import { useAdminSession } from "@/src/features/admin/hooks/useTeam";
import type { Capability } from "@/src/lib/api/contracts/common";

interface AdminLink {
  href: string;
  label: string;
  Icon: typeof ClipboardCheck;
  exact: boolean;
  /** Capability required to see this link; undefined = any admin. */
  cap?: Capability;
}

const links: AdminLink[] = [
  { href: "/admin", label: "المراجعة", Icon: ClipboardCheck, exact: true },
  { href: "/admin/support", label: "الدعم", Icon: Headset, exact: false, cap: "ticket:reply" },
  { href: "/admin/reports", label: "التقارير", Icon: BarChart3, exact: false, cap: "report:export" },
  { href: "/admin/team", label: "الفريق", Icon: Users, exact: false, cap: "admin:manage" },
  { href: "/admin/activity", label: "السجل", Icon: ScrollText, exact: false, cap: "admin:manage" },
];

/** Capability-aware admin nav: only shows sections the current admin can use. */
export function AdminNavLinks() {
  const pathname = usePathname();
  const { data: session } = useAdminSession();
  const caps = session?.capabilities ?? [];

  const visible = links.filter((l) => !l.cap || caps.includes(l.cap));

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {visible.map(({ href, label, Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-1.5 rounded-control px-3 py-2 text-small font-semibold transition-colors",
              active ? "bg-primary-tint text-primary" : "text-body-text hover:bg-background",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
