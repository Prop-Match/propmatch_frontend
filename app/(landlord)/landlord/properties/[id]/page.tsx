import { LandlordPropertyView } from "@/src/features/landlord/components/LandlordPropertyView";

export default async function LandlordPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LandlordPropertyView id={id} />;
}
