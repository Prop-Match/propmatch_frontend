"use client";

import { useEffect, useRef, useState } from "react";
import { LifeBuoy, Send, Bot, User as UserIcon, Headset, UserRoundCheck } from "lucide-react";
import { useSupportThread, useSendSupportMessage, useEscalateSupport } from "../hooks/useSupport";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/utils/cn";
import { ticketStatusLabels } from "@/src/lib/api/contracts/support";

const examples = ["كيف أوثّق هويتي؟", "كيف أضيف عقارًا؟", "كيف تتم عملية الدفع؟"];

export function SupportChat() {
  const { data: thread } = useSupportThread();
  const send = useSendSupportMessage();
  const escalate = useEscalateSupport();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = thread?.messages ?? [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, send.isPending]);

  function submit(text: string) {
    const t = text.trim();
    if (!t || send.isPending) return;
    setInput("");
    send.mutate(t);
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-8rem)] max-w-2xl flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary-tint text-primary">
            <LifeBuoy className="size-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-title font-bold text-ink">الدعم الفني</h1>
            <p className="text-caption text-muted">مساعد آلي متاح دائمًا — ويمكنك طلب موظف بشري</p>
          </div>
        </div>
        {thread?.escalated && thread.status && (
          <span className="rounded-pill bg-trust-blue-tint px-3 py-1 text-caption font-bold text-trust-blue">
            {ticketStatusLabels[thread.status]}
          </span>
        )}
      </div>

      <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto rounded-card border border-hairline bg-surface p-4">
        {messages.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <Bot className="size-10 text-muted" aria-hidden />
            <p className="text-small text-muted">اسأل المساعد الآلي عن أي شيء يخص المنصة</p>
            <div className="flex flex-col gap-2">
              {examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => submit(ex)}
                  className="rounded-pill border border-hairline px-4 py-1.5 text-small text-body-text hover:border-primary hover:text-primary"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => {
          const isUser = m.author === "user";
          return (
            <div key={m.id} className={cn("flex", isUser ? "justify-start" : "justify-end")}>
              <div className={cn("flex max-w-[85%] flex-col gap-1", isUser ? "items-start" : "items-end")}>
                {!isUser && (
                  <span className="flex items-center gap-1 text-caption text-muted">
                    {m.author === "ai" ? <Bot className="size-3" aria-hidden /> : <UserRoundCheck className="size-3" aria-hidden />}
                    {m.authorName}
                  </span>
                )}
                <div
                  className={cn(
                    "whitespace-pre-line rounded-card px-4 py-2.5 text-body leading-relaxed",
                    isUser ? "bg-primary text-white" : m.author === "admin" ? "bg-trust-blue-tint text-ink" : "bg-background text-ink",
                  )}
                >
                  {m.content}
                </div>
              </div>
            </div>
          );
        })}

        {send.isPending && (
          <div className="flex justify-end">
            <div className="flex gap-1 rounded-card bg-background px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span key={i} className="size-2 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Escalation */}
      {!thread?.escalated ? (
        <Button
          variant="secondary"
          onClick={() => escalate.mutate()}
          loading={escalate.isPending}
          disabled={messages.length === 0}
        >
          <Headset className="size-4" aria-hidden />
          التحدث مع موظف بشري
        </Button>
      ) : (
        <p className="flex items-center justify-center gap-1.5 rounded-control bg-trust-blue-tint px-3 py-2 text-caption font-semibold text-trust-blue">
          <UserIcon className="size-4" aria-hidden />
          تم تحويلك لموظف الدعم — سيصلك الرد هنا
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب رسالتك…"
          className="flex-1 rounded-pill border border-hairline bg-surface px-4 py-2.5 text-body focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={!input.trim() || send.isPending}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-50"
          aria-label="إرسال"
        >
          <Send className="size-5 rtl:-scale-x-100" aria-hidden />
        </button>
      </form>
    </div>
  );
}
