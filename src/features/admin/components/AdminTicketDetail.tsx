"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Bot, User as UserIcon, Send, StickyNote, UserPlus } from "lucide-react";
import { useTicket, useTicketActions } from "../hooks/useTickets";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { ErrorState } from "@/src/components/ui/States";
import { Button } from "@/src/components/ui/Button";
import { SelectField } from "@/src/components/ui/Field";
import { useToast } from "@/src/components/ui/Toast";
import { cn } from "@/src/utils/cn";
import { formatRelativeTime } from "@/src/utils/format";
import { ticketStatusLabels, type TicketStatus } from "@/src/lib/api/contracts/support";

const statuses: TicketStatus[] = ["new", "assigned", "in_progress", "waiting", "closed"];

export function AdminTicketDetail({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const { data: ticket, isLoading, isError, refetch } = useTicket(id);
  const { reply, assign, setStatus } = useTicketActions(id);
  const [text, setText] = useState("");
  const [internal, setInternal] = useState(false);

  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (isLoading || !ticket) return <Skeleton className="h-96 w-full" />;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    reply.mutate(
      { content: text.trim(), internal },
      {
        onSuccess: () => {
          setText("");
          toast("success", internal ? "تم حفظ الملاحظة الداخلية" : "تم إرسال الرد للعميل");
        },
      },
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => router.push("/admin/support")}>
          <ArrowRight className="size-4" aria-hidden />
          رجوع
        </Button>
        <div className="flex items-center gap-2">
          {!ticket.assignedAdminId && (
            <Button size="sm" variant="secondary" loading={assign.isPending} onClick={() => assign.mutate()}>
              <UserPlus className="size-4" aria-hidden />
              تعيين لي
            </Button>
          )}
          <SelectField
            aria-label="حالة التذكرة"
            options={statuses.map((s) => ({ value: s, label: ticketStatusLabels[s] }))}
            value={ticket.status}
            onChange={(e) => setStatus.mutate(e.target.value as TicketStatus)}
            className="w-36"
          />
        </div>
      </div>

      <div className="rounded-card border border-hairline bg-surface p-4">
        <h1 className="text-title font-bold text-ink">{ticket.subject}</h1>
        <p className="mt-0.5 flex items-center gap-1.5 text-caption text-muted">
          <UserIcon className="size-3" aria-hidden />
          {ticket.userName}
          {ticket.assignedAdminName && <span>· معيّن لـ {ticket.assignedAdminName}</span>}
        </p>
      </div>

      {/* Thread */}
      <div className="flex flex-col gap-3 rounded-card border border-hairline bg-surface p-4">
        {ticket.messages.map((m) => {
          const isUser = m.author === "user";
          return (
            <div key={m.id} className={cn("flex", isUser ? "justify-start" : "justify-end")}>
              <div className={cn("flex max-w-[85%] flex-col gap-1", isUser ? "items-start" : "items-end")}>
                <span className="flex items-center gap-1 text-caption text-muted">
                  {m.author === "ai" ? <Bot className="size-3" aria-hidden /> : <UserIcon className="size-3" aria-hidden />}
                  {m.authorName}
                  {m.internal && <span className="rounded bg-pending-tint px-1 text-pending">ملاحظة داخلية</span>}
                  <span>· {formatRelativeTime(m.at)}</span>
                </span>
                <div
                  className={cn(
                    "whitespace-pre-line rounded-card px-4 py-2.5 text-body leading-relaxed",
                    m.internal
                      ? "border border-dashed border-pending/40 bg-pending-tint/40 text-ink"
                      : isUser
                        ? "bg-background text-ink"
                        : m.author === "admin"
                          ? "bg-primary text-white"
                          : "bg-primary-tint text-ink",
                  )}
                >
                  {m.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply box */}
      <form onSubmit={submit} className="flex flex-col gap-2 rounded-card border border-hairline bg-surface p-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={internal ? "اكتب ملاحظة داخلية (لا تظهر للعميل)…" : "اكتب ردك للعميل…"}
          className="min-h-20 w-full rounded-control border border-hairline bg-surface px-3.5 py-2.5 text-body focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-1.5 text-small text-body-text">
            <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} className="size-4 accent-[var(--color-primary)]" />
            <StickyNote className="size-4 text-muted" aria-hidden />
            ملاحظة داخلية
          </label>
          <Button type="submit" loading={reply.isPending} disabled={!text.trim()}>
            <Send className="size-4 rtl:-scale-x-100" aria-hidden />
            {internal ? "حفظ الملاحظة" : "إرسال الرد"}
          </Button>
        </div>
      </form>
    </div>
  );
}
