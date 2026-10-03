import { z } from "zod";

const title = z.string().trim().min(1).max(160);
const content = z.string().trim().min(1).max(8_000);

export const createConversationSchema = z
  .object({ title: title.optional() })
  .strict();
export const renameConversationSchema = z
  .object({ title })
  .strict();
export const sendMessageSchema = z
  .object({ content })
  .strict();
export const conversationIdSchema = z.string().uuid();
export const listConversationsSchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
  })
  .strict();

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ListConversationsInput = z.infer<typeof listConversationsSchema>;
