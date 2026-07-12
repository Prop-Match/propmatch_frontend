"use client";

import { Phone, User as UserIcon, BadgeCheck, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { useInquiries, useAcceptInquiry } from "../hooks/useLandlord";
import { Button } from "@/src/components/ui/Button";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/src/components/ui/States";
import { formatRelativeTime } from "@/src/utils/format";

export function LandlordInquiries() {
  const { data, isLoading, isError, refetch } = useInquiries();
  const accept = useAcceptInquiry();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-h1 font-bold text-ink">الطلبات</h1>
        <p className="mt-1 text-small text-muted">مستأجرون مهتمّون بعقاراتك. بياناتهم تظهر بعد موافقتك.</p>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState Icon={UserIcon} title="لا توجد طلبات بعد" description="عندما يهتم مستأجر بعقارك سيظهر طلبه هنا." />
      ) : (
        <div className="flex flex-col gap-3">
          {data.items.map((inq) => (
            <div key={inq.id} className="flex flex-col gap-3 rounded-card border border-hairline bg-surface p-4 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-small text-muted">{inq.propertyTitle}</p>
                  <p className="flex items-center gap-1.5 text-body font-bold text-ink">
                    <UserIcon className="size-4 text-muted" aria-hidden />
                    {inq.tenantName}
                    {inq.tenantVerified && <BadgeCheck className="size-4 text-success" aria-hidden />}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-caption text-muted">
                  <Clock className="size-3" aria-hidden />
                  {formatRelativeTime(inq.createdAt)}
                </span>
              </div>

              {inq.status === "accepted" ? (
                <div className="flex flex-wrap items-center gap-3">
                  {inq.tenantPhone && (
                    <a href={`tel:${inq.tenantPhone}`} className="flex items-center gap-1.5 text-small font-semibold text-primary">
                      <Phone className="size-4" aria-hidden />
                      {inq.tenantPhone}
                    </a>
                  )}
                  <Link href="/contracts/new" className="ms-auto">
                    <Button variant="secondary" size="sm">
                      <FileText className="size-4" aria-hidden />
                      إنشاء العقد
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <p className="flex items-center gap-1.5 text-small text-muted">
                    <Clock className="size-4" aria-hidden />
                    بانتظار موافقتك للكشف عن البيانات
                  </p>
                  <Button size="sm" loading={accept.isPending && accept.variables === inq.id} onClick={() => accept.mutate(inq.id)}>
                    قبول وكشف البيانات
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
