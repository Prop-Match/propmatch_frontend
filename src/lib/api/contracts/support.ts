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

// Ticket/Review DTOs are V1.1+/V2 per docs/analysis/mvp.md — added when those
// modules are built.
