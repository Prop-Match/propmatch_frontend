import { requireRole } from "@/src/lib/api/serverSession";
import { TenantOfferInbox } from "@/src/features/matching/components/TenantOfferInbox";

export default async function TenantOffersPage() {
  await requireRole("tenant", "/tenant/offers");
  return <TenantOfferInbox />;
}
