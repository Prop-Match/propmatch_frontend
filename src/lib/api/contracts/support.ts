import { z } from "zod";

/** Legal chatbot messages (SRS FR4) — session-scoped, purged after session. */

export const ChatRoleSchema = z.enum(["user", "assistant"]);
export type ChatRole = z.infer<typeof ChatRoleSchema>;

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: ChatRoleSchema,
  content: z.string(),
  /** True when the assistant declined an off-topic question (FR4.4). */
  declined: z.boolean().optional(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

/* ---------------------------------------------------------------------------
 * Customer support (Module C). AI-first: the AI assistant answers platform
 * questions; when the user requests a human, the thread escalates into a
 * ticket that a support admin joins. Ticket lifecycle per the master brief:
 * new → assigned → in_progress → waiting → closed.
 * ------------------------------------------------------------------------- */

export const TicketStatusSchema = z.enum(["new", "assigned", "in_progress", "waiting", "closed"]);
export type TicketStatus = z.infer<typeof TicketStatusSchema>;

export const ticketStatusLabels: Record<TicketStatus, string> = {
  new: "جديد",
  assigned: "معيّن",
  in_progress: "قيد المعالجة",
  waiting: "بانتظار العميل",
  closed: "مغلق",
};

/** Who authored a support message. AI + user are public; admin notes may be internal. */
export const SupportAuthorSchema = z.enum(["ai", "user", "admin"]);
export type SupportAuthor = z.infer<typeof SupportAuthorSchema>;

export const SupportMessageSchema = z.object({
  id: z.string(),
  author: SupportAuthorSchema,
  authorName: z.string(),
  content: z.string(),
  /** Admin-only note, never returned to the customer. */
  internal: z.boolean(),
  at: z.string(),
});
export type SupportMessage = z.infer<typeof SupportMessageSchema>;

/** Customer-facing view of their own support conversation. */
export const SupportThreadSchema = z.object({
  ticketId: z.string().nullable(),
  status: TicketStatusSchema.nullable(),
  /** True once a human agent has been requested/assigned. */
  escalated: z.boolean(),
  messages: z.array(SupportMessageSchema),
});
export type SupportThread = z.infer<typeof SupportThreadSchema>;

export const SupportSendRequestSchema = z.object({ message: z.string().min(1).max(2000) });
export type SupportSendRequest = z.infer<typeof SupportSendRequestSchema>;

/** Admin queue item + detail. */
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
