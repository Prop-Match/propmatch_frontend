import { z } from "zod";

/**
 * Legal Support Chatbot (PRO-17 / SRS 3.3). RAG over Egyptian tenancy law +
 * platform T&Cs, with a strict on-topic guardrail. Session-scoped: no ERD
 * entity persists chat, so history lives only in the client session.
 *
 * Customer-support ticketing is NOT part of V1 — it has no ERD entity and no
 * backlog ticket (docs/analysis/conflicts.md B2). The chatbot's
 * `transfer_to_human_support` tool is a backend concern; the frontend only
 * surfaces the handoff message.
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
