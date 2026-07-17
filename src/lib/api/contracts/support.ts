import { z } from "zod";

/**
 * Legal Support Chatbot (PRO-17 / SRS 3.3). RAG over Egyptian tenancy law +
 * platform T&Cs, with a strict on-topic guardrail. Session-scoped: no ERD
 * entity persists chat, so history lives only in the client session.
 *
 * Customer-support ticketing (below) was deleted in Phase 2 as out-of-scope
 * and restored by explicit request — see `docs/analysis/conflicts.md` B2-R.
 * It has **no ERD entity and no PRO ticket**: the shapes here are a frontend
 * proposal, not an agreed backend contract (`ASSUMPTIONS.md` #26).
 */

export const ChatRoleSchema = z.enum(["user", "assistant"]);
export type ChatRole = z.infer<typeof ChatRoleSchema>;

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: ChatRoleSchema,
  content: z.string(),
  /** True when the assistant declined an off-topic question (SRS 3.3). */
  declined: z.boolean().optional(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

/* ----------------------------- support tickets ---------------------------- */
/* Restored per conflicts.md B2-R. No ERD entity backs any of this.           */

/** Lifecycle: new → assigned → in_progress → waiting → closed. */
export const TicketStatusSchema = z.enum(["new", "assigned", "in_progress", "waiting", "closed"]);
export type TicketStatus = z.infer<typeof TicketStatusSchema>;

export const ticketStatusLabels: Record<TicketStatus, string> = {
  new: "جديد",
  assigned: "معيّن",
  in_progress: "قيد المعالجة",
  waiting: "بانتظار العميل",
  closed: "مغلق",
};

/** Who authored a message. `internal` admin notes never reach the customer. */
export const SupportAuthorSchema = z.enum(["ai", "user", "admin"]);
export type SupportAuthor = z.infer<typeof SupportAuthorSchema>;

export const SupportMessageSchema = z.object({
  id: z.string(),
  author: SupportAuthorSchema,
  authorName: z.string(),
  content: z.string(),
  internal: z.boolean(),
  at: z.string(),
});
export type SupportMessage = z.infer<typeof SupportMessageSchema>;

export const TicketSummarySchema = z.object({
  id: z.string(),
  subject: z.string(),
  userName: z.string(),
  status: TicketStatusSchema,
  assignedAdminName: z.string().nullable(),
  lastMessageAt: z.string(),
  createdAt: z.string(),
});
export type TicketSummary = z.infer<typeof TicketSummarySchema>;

export const TicketDetailSchema = TicketSummarySchema.extend({
  userId: z.string(),
  assignedAdminId: z.string().nullable(),
  messages: z.array(SupportMessageSchema),
});
export type TicketDetail = z.infer<typeof TicketDetailSchema>;

export const AdminReplyRequestSchema = z.object({
  content: z.string().min(1),
  internal: z.boolean().default(false),
});
export type AdminReplyRequest = z.infer<typeof AdminReplyRequestSchema>;

export const TicketStatusUpdateSchema = z.object({ status: TicketStatusSchema });
export type TicketStatusUpdate = z.infer<typeof TicketStatusUpdateSchema>;
