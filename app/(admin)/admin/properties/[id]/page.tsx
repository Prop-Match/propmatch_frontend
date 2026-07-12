import { AdminPropertyReview } from "@/src/features/admin/components/AdminPropertyReview";

export default async function AdminPropertyReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminPropertyReview id={id} />;
}
