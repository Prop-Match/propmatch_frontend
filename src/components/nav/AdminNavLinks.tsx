"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck, BarChart3 } from "lucide-react";
import { cn } from "@/src/utils/cn";

/**
 * V1 admin nav. One flat ADMIN role holds every admin capability
 * (docs/analysis/conflicts.md B2), so there is nothing to gate here yet —
 * re-introduce capability filtering if scoped admins are added later.
 */
const links = [
  { href: "/admin", label: "المراجعة", Icon: ClipboardCheck, exact: true },
  { href: "/admin/reports", label: "السجلات", Icon: BarChart3, exact: false },
];

export function AdminNavLinks() {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 md:flex">
      {links.map(({ href, label, Icon, exact }) => {
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
