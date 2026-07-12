import { AdminUserReview } from "@/src/features/admin/components/AdminUserReview";

export default async function AdminUserReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminUserReview userId={id} />;
}
