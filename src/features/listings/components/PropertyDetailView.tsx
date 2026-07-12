"use client";

import Image from "next/image";
import { BedDouble, Bath, Ruler, Building2, ArrowUpDown, Sofa, CheckCircle2, ImageOff } from "lucide-react";
import { useProperty } from "../hooks/useProperties";
import { ContactGate } from "./ContactGate";
import { MatchScoreRing } from "@/src/components/ui/MatchScoreRing";
import { VerifiedBadge, OwnershipDisclaimer } from "@/src/components/ui/VerifiedBadge";
import { StatusChip } from "@/src/components/ui/StatusChip";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { ErrorState } from "@/src/components/ui/States";
import { formatEGP, formatNumber } from "@/src/utils/format";
import { amenityLabels, propertyTypeLabels, finishLabels, orientationLabels } from "@/src/lib/api/contracts/property";

export function PropertyDetailView({
  id,
  matchScore,
  hideContact,
}: {
  id: string;
  matchScore?: number;
  /** True when the owner is viewing their own listing — no contact gate. */
  hideContact?: boolean;
}) {
  const { data: p, isLoading, isError, refetch } = useProperty(id);

  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (isLoading || !p) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const facts = [
    { Icon: BedDouble, label: "غرف", value: formatNumber(p.rooms) },
    { Icon: Bath, label: "حمّامات", value: formatNumber(p.bathrooms) },
    { Icon: Ruler, label: "المساحة", value: `${formatNumber(p.area)} م²` },
    { Icon: Building2, label: "الدور", value: formatNumber(p.floor) },
    { Icon: ArrowUpDown, label: "أسانسير", value: p.hasElevator ? "نعم" : "لا" },
    { Icon: Sofa, label: "الفرش", value: p.furnished ? "مفروش" : "غير مفروش" },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-5 lg:col-span-2">
        {/* Gallery */}
        <div className="relative h-64 overflow-hidden rounded-card bg-background md:h-80">
          {p.coverImage ? (
            <Image src={p.coverImage} alt={p.title} fill sizes="(max-width:1024px) 100vw, 66vw" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted">
              <ImageOff className="size-10" aria-hidden />
            </div>
          )}
          <div className="absolute top-3 start-3 flex gap-2">
            {p.boosted && (
              <span className="rounded-pill bg-pending-tint px-2.5 py-0.5 text-caption font-bold text-pending">مميّز</span>
            )}
            {p.status !== "approved" && <StatusChip status={p.status} />}
          </div>
          {matchScore !== undefined && (
            <div className="absolute bottom-3 end-3 rounded-card bg-surface/95 p-1.5 shadow-card">
              <MatchScoreRing score={matchScore} size={56} />
            </div>
          )}
        </div>

        {/* Title + price */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-h1 font-bold text-ink">{p.title}</h1>
            <p className="mt-1 text-body text-muted">
              {p.location.neighborhood}، {p.location.city} — {propertyTypeLabels[p.type]}
            </p>
          </div>
          <div className="shrink-0 text-left">
            <span className="text-h1 font-bold text-primary">{formatNumber(p.monthlyRent)}</span>
            <span className="block text-small text-muted">ج.م / شهريًا</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <VerifiedBadge status={p.ownerVerified ? "verified" : "unverified"} />
        </div>
        <OwnershipDisclaimer />

        {/* Facts */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {facts.map(({ Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2 rounded-control border border-hairline bg-surface p-3">
              <Icon className="size-5 text-primary" aria-hidden />
              <div>
                <p className="text-caption text-muted">{label}</p>
                <p className="text-small font-bold text-ink">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        <section>
          <h2 className="mb-2 text-title font-bold text-ink">الوصف</h2>
          <p className="whitespace-pre-line leading-relaxed text-body text-body-text">{p.description}</p>
        </section>

        {/* Details */}
        <section className="grid grid-cols-2 gap-x-6 gap-y-2 text-small sm:grid-cols-3">
          <Detail label="مبلغ التأمين" value={formatEGP(p.deposit)} />
          <Detail label="مدة العقد" value={`${formatNumber(p.leaseDurationMonths)} شهر`} />
          <Detail label="التشطيب" value={finishLabels[p.finish]} />
          <Detail label="الاتجاه" value={orientationLabels[p.orientation]} />
          <Detail label="العنوان" value={p.location.detailedAddress} />
        </section>

        {/* Amenities */}
        {p.amenities.length > 0 && (
          <section>
            <h2 className="mb-2 text-title font-bold text-ink">المميزات</h2>
            <div className="flex flex-wrap gap-2">
              {p.amenities.map((a) => (
                <span key={a} className="inline-flex items-center gap-1 rounded-pill bg-primary-tint px-3 py-1 text-small font-medium text-primary-dark">
                  <CheckCircle2 className="size-3.5" aria-hidden />
                  {amenityLabels[a]}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Contact gate — sticky on desktop; hidden for the owner's own view */}
      {!hideContact && (
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <ContactGate propertyId={p.id} />
        </aside>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 border-b border-hairline py-1.5">
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}
