"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, BellOff, BadgeCheck, MessageSquare, Home, Sparkles } from "lucide-react";
import { api } from "@/src/lib/api/browserClient";
import { cn } from "@/src/utils/cn";
import { formatRelativeTime } from "@/src/utils/format";

interface NotificationItem {
  id: string;
  kind: "review" | "inquiry" | "listing" | "match";
  title: string;
  at: string;
}

const kindIcon: Record<NotificationItem["kind"], typeof Bell> = {
  review: BadgeCheck,
  inquiry: MessageSquare,
  listing: Home,
  match: Sparkles,
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [readAll, setReadAll] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get<{ items: NotificationItem[]; unread: number }>("notifications"),
    // Light polling for the "live" feel; real build would use WebSocket/SSE.
    refetchInterval: 20_000,
  });

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const items = data?.items ?? [];
  const unread = readAll ? 0 : (data?.unread ?? 0);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setReadAll(true);
        }}
        className="relative flex size-9 items-center justify-center rounded-full text-body-text hover:bg-background"
        aria-label="الإشعارات"
        aria-expanded={open}
      >
        <Bell className="size-5" aria-hidden />
        {unread > 0 && (
          <span className="absolute -top-0.5 -end-0.5 flex min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-card border border-hairline bg-surface shadow-card">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
            <span className="text-small font-bold text-ink">الإشعارات</span>
            {items.length > 0 && (
              <button onClick={() => setReadAll(true)} className="text-caption font-semibold text-primary hover:underline">
                تعليم الكل كمقروء
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center text-muted">
              <BellOff className="size-6" aria-hidden />
              <span className="text-small">لا توجد إشعارات جديدة</span>
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {items.map((n) => {
                const Icon = kindIcon[n.kind];
                return (
                  <li key={n.id} className="flex items-start gap-3 border-b border-hairline px-4 py-3 last:border-0">
                    <span className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary")}>
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-small text-ink">{n.title}</p>
                      <p className="text-caption text-muted">{formatRelativeTime(n.at)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
