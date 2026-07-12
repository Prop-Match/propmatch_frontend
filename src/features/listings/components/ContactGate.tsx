"use client";

import { Lock, Phone, Mail, User as UserIcon, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { useContactState, useRequestContact } from "../hooks/useContact";
import { Button } from "@/src/components/ui/Button";
import { Skeleton } from "@/src/components/ui/Skeleton";

/**
 * The PII gate (design spec §6, ASSUMPTIONS.md #6). Owner phone/email is
 * hidden until BOTH parties accept the match. States:
 *  none      → tenant can request contact
 *  requested → waiting for the landlord to accept
 *  accepted  → contact revealed
 */
export function ContactGate({ propertyId }: { propertyId: string }) {
  const { data, isLoading } = useContactState(propertyId);
  const request = useRequestContact(propertyId);

  if (isLoading) return <Skeleton className="h-32 w-full" />;

  const status = data?.status ?? "none";

  return (
    <div className="rounded-card border border-hairline bg-surface p-5 shadow-card">
      <h3 className="mb-3 flex items-center gap-2 text-title font-bold text-ink">
        <Phone className="size-5 text-primary" aria-hidden />
        تواصل مع المالك
      </h3>

      {status === "none" && (
        <div className="flex flex-col gap-3">
          <p className="flex items-center gap-2 rounded-control bg-background px-3 py-2.5 text-small text-muted">
            <Lock className="size-4 shrink-0" aria-hidden />
            رقم الهاتف مخفي حتى تأكيد التطابق
          </p>
          <Button loading={request.isPending} onClick={() => request.mutate()}>
            اطلب التواصل
          </Button>
        </div>
      )}

      {status === "requested" && (
        <div className="flex flex-col gap-2 rounded-control bg-pending-tint px-4 py-3 text-pending">
          <span className="flex items-center gap-2 font-semibold">
            <Clock className="size-4" aria-hidden />
            بانتظار موافقة المالك
          </span>
          <p className="text-small text-body-text">
            أرسلنا طلبك للمالك. بمجرد موافقته ستظهر بيانات التواصل هنا مباشرة.
          </p>
        </div>
      )}

      {status === "accepted" && data?.contact && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded-control bg-success-tint px-4 py-3">
            <span className="flex items-center gap-2 text-small font-bold text-success">
              تم تأكيد التطابق — بيانات المالك
            </span>
            <p className="flex items-center gap-2 text-body text-ink">
              <UserIcon className="size-4 text-muted" aria-hidden />
              {data.contact.fullName}
            </p>
            <a href={`tel:${data.contact.phone}`} className="flex items-center gap-2 text-body font-semibold text-primary">
              <Phone className="size-4" aria-hidden />
              {data.contact.phone}
            </a>
            <p className="flex items-center gap-2 text-small text-body-text">
              <Mail className="size-4 text-muted" aria-hidden />
              {data.contact.email}
            </p>
          </div>
          <Link href="/contracts/new">
            <Button variant="secondary" block>
              <FileText className="size-4" aria-hidden />
              أنشئ عقد الإيجار
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
