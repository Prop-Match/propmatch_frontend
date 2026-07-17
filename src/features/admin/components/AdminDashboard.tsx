"use client";

import { useRouter } from "next/navigation";
import { Home, ScanFace, Clock, ChevronLeft, FileText, Star, ShieldAlert } from "lucide-react";
import { useAdminQueues } from "../hooks/useAdmin";
import { useAdminSession } from "../hooks/useTeam";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { EmptyState } from "@/src/components/ui/States";
import { formatRelativeTime } from "@/src/utils/format";
import { cn } from "@/src/utils/cn";
import type { QueueItem } from "@/src/lib/api/contracts/admin";
import type { Capability } from "@/src/lib/api/contracts/common";

/**
 * All four PRO-08 queues: eKYC, properties, tenant requests, property reviews.
 *
 * Each column is capability-gated (sub-roles restored — conflicts.md B2-R), so
 * a kyc-reviewer sees only the eKYC column. That is UX only; the backend's
 * capability guard is what actually enforces it.
 */
export function AdminDashboard() {
  const { data, isLoading } = useAdminQueues();
  const { data: session } = useAdminSession();
  const caps = session?.capabilities ?? [];
  const can = (c: Capability) => caps.includes(c);

  const columns = [
    {
      cap: "property:approve" as Capability,
      title: "عقارات بانتظار المراجعة",
      Icon: Home,
      items: data?.propertyQueue,
      emptyText: "لا توجد عقارات بانتظار المراجعة",
      hrefBase: "/admin/properties",
    },
    {
      cap: "kyc:review" as Capability,
      title: "مستخدمون بحاجة لمراجعة",
      Icon: ScanFace,
      items: data?.kycQueue,
      emptyText: "لا توجد طلبات توثيق جديدة",
      hrefBase: "/admin/users",
    },
    {
      cap: "request:approve" as Capability,
      title: "طلبات سكن بانتظار النشر",
      Icon: FileText,
      items: data?.requestQueue,
      emptyText: "لا توجد طلبات سكن جديدة",
      hrefBase: "/admin/requests",
    },
    {
      cap: "review:moderate" as Capability,
      title: "تقييمات بانتظار المراجعة",
      Icon: Star,
      items: data?.reviewQueue,
      emptyText: "لا توجد تقييمات جديدة",
      hrefBase: "/admin/reviews",
    },
  ].filter((c) => can(c.cap));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-h1 font-bold text-ink">لوحة المراجعة</h1>
        <p className="mt-1 text-small text-muted">تُحدَّث القائمة تلقائيًا فور وصول طلبات جديدة.</p>
      </div>

      {session && columns.length === 0 ? (
        <EmptyState
          Icon={ShieldAlert}
          title="لا تملك صلاحية مراجعة أي طابور"
          description={`دورك الحالي «${session.roleName}» للاطلاع فقط.`}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {columns.map(({ cap, ...col }) => (
            <QueueColumn key={cap} {...col} loading={isLoading} />
          ))}
        </div>
      )}
    </div>
  );
}

function QueueColumn({
  title,
  Icon,
  items,
  loading,
  emptyText,
  hrefBase,
}: {
  title: string;
  Icon: typeof Home;
  items?: QueueItem[];
  loading: boolean;
  emptyText: string;
  hrefBase: string;
}) {
  const router = useRouter();
  return (
    <section className="flex flex-col gap-3 rounded-card border border-hairline bg-surface p-4">
      <h2 className="flex items-center gap-2 text-title font-bold text-ink">
        <Icon className="size-5 text-primary" aria-hidden />
        {title}
        {items && items.length > 0 && (
          <span className="rounded-pill bg-primary px-2 py-0.5 text-caption font-bold text-white">{items.length}</span>
        )}
      </h2>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !items || items.length === 0 ? (
        <EmptyState Icon={Icon} title={emptyText} />
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => router.push(`${hrefBase}/${item.subjectId}`)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-control border border-hairline p-3 text-start",
                  "hover:border-primary hover:bg-primary-tint/30",
                  "animate-[queue-slide-in_.5s_ease-out]",
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-small font-bold text-ink">{item.title}</p>
                  <p className="truncate text-caption text-muted">{item.subtitle}</p>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-caption text-muted">
                  <Clock className="size-3" aria-hidden />
                  {formatRelativeTime(item.submittedAt)}
                  <ChevronLeft className="size-4" aria-hidden />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
