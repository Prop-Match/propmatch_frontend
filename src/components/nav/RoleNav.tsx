"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { cn } from "@/src/utils/cn";
import { useSessionUiStore } from "@/src/lib/store/useSessionUiStore";
import { useHideOnScroll } from "@/src/hooks/useHideOnScroll";

export interface NavItem {
  href: string;
  label: string;
  Icon: typeof Bell;
}

/**
 * Mobile: sticky bottom tab bar. Desktop: fixed top nav. Shared between
 * tenant/landlord/admin surfaces — pass role-specific items.
 */
export function RoleNav({
  items,
  brand = "PropMatch AI",
  rightSlot,
}: {
  items: NavItem[];
  brand?: string;
  rightSlot?: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const bottomNavVisible = useSessionUiStore((s) => s.bottomNavVisible);
  useHideOnScroll();

  return (
    <>
      {/* Desktop top nav */}
      <header className="sticky top-0 z-30 hidden border-b border-hairline bg-surface/90 backdrop-blur md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-h2 font-bold text-primary">
            {brand}
          </Link>
          <nav className="flex items-center gap-1">
            {items.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-control px-3 py-2 text-small font-semibold transition-colors",
                  isActive(href) ? "bg-primary-tint text-primary" : "text-body-text hover:bg-background",
                )}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">{rightSlot}</div>
        </div>
      </header>

      {/* Mobile bottom tab bar — hides on scroll-down, reveals on scroll-up (§4.5) */}
      <nav
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-hairline bg-surface transition-transform duration-300 md:hidden",
          bottomNavVisible ? "translate-y-0" : "translate-y-full",
        )}
      >
        {items.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-caption font-medium transition-colors",
              isActive(href) ? "text-primary" : "text-muted",
            )}
          >
            <Icon className="size-5" aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}

export { NotificationBell } from "./NotificationBell";
