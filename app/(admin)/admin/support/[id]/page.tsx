import { AdminTicketDetail } from "@/src/features/admin/components/AdminTicketDetail";

export default async function AdminTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminTicketDetail id={id} />;
}
