import { and, asc, count, desc, eq } from "drizzle-orm";
import { db } from "@/db/index.server";
import { chatConversations, chatMessages } from "@/db/schema";
import type { ChatMessageRole } from "@/db/schema";
import { generateGeminiResponse } from "@/services/ai.service.server";
import {
  consumeCredit,
  getCreditBalance,
  refundCredit,
} from "@/services/credit.service.server";
import type {
  CreateConversationInput,
  ListConversationsInput,
} from "@/validators/chat";

// Batas agar riwayat tetap ringkas dan payload ke AI tetap kecil.
const DEFAULT_TITLE = "Percakapan baru";
const TITLE_MAX_LENGTH = 60;
const CONTEXT_MESSAGE_LIMIT = 12;

export class ChatError extends Error {
  constructor(
    public code: "NOT_FOUND" | "INSUFFICIENT_CREDITS",
    message: string,
  ) {
    super(message);
  }
}

export type ChatConversationSummary = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
};

export type ChatStoredMessage = {
  id: string;
  role: ChatMessageRole;
  content: string;
  createdAt: string;
};

export type ChatConversationDetail = ChatConversationSummary & {
  messages: ChatStoredMessage[];
};

// Judul otomatis dari pesan pertama: satu baris, dipotong agar tidak panjang.
export function deriveConversationTitle(content: string): string {
  const flat = content.replace(/\s+/g, " ").trim();
  if (!flat) return DEFAULT_TITLE;
  return flat.length > TITLE_MAX_LENGTH
    ? `${flat.slice(0, TITLE_MAX_LENGTH - 1).trimEnd()}…`
    : flat;
}

const conversationFields = {
  id: chatConversations.id,
  title: chatConversations.title,
  createdAt: chatConversations.createdAt,
  updatedAt: chatConversations.updatedAt,
};

function toIso(value: Date): string {
  return value.toISOString();
}

export async function listConversations(
  userId: string,
  { limit }: ListConversationsInput,
): Promise<ChatConversationSummary[]> {
  const rows = await db
    .select({
      ...conversationFields,
      messageCount: count(chatMessages.id),
    })
    .from(chatConversations)
    .leftJoin(
      chatMessages,
      and(
        eq(chatMessages.conversationId, chatConversations.id),
        eq(chatMessages.userId, userId),
      ),
    )
    .where(eq(chatConversations.userId, userId))
    .groupBy(chatConversations.id)
    .orderBy(desc(chatConversations.updatedAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    messageCount: Number(row.messageCount),
  }));
}

export async function getConversation(
  userId: string,
  id: string,
): Promise<ChatConversationDetail | undefined> {
  const [conversation] = await db
    .select(conversationFields)
    .from(chatConversations)
    .where(and(eq(chatConversations.id, id), eq(chatConversations.userId, userId)))
    .limit(1);
  if (!conversation) return undefined;

  const messages = await db
    .select({
      id: chatMessages.id,
      role: chatMessages.role,
      content: chatMessages.content,
      createdAt: chatMessages.createdAt,
    })
    .from(chatMessages)
    .where(
      and(
        eq(chatMessages.conversationId, id),
        eq(chatMessages.userId, userId),
      ),
    )
    .orderBy(asc(chatMessages.createdAt), asc(chatMessages.id));

  return {
    id: conversation.id,
    title: conversation.title,
    createdAt: toIso(conversation.createdAt),
    updatedAt: toIso(conversation.updatedAt),
    messageCount: messages.length,
    messages: messages.map((message) => ({
      id: message.id,
      role: message.role as ChatMessageRole,
      content: message.content,
      createdAt: toIso(message.createdAt),
    })),
  };
}

export async function createConversation(
  userId: string,
  input: CreateConversationInput,
) {
  const [row] = await db
    .insert(chatConversations)
    .values({ userId, title: input.title?.trim() || DEFAULT_TITLE })
    .returning(conversationFields);

  return {
    id: row.id,
    title: row.title,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    messageCount: 0,
  };
}

export async function renameConversation(
  userId: string,
  id: string,
  title: string,
) {
  const [row] = await db
    .update(chatConversations)
    .set({ title })
    .where(and(eq(chatConversations.id, id), eq(chatConversations.userId, userId)))
    .returning({ id: chatConversations.id, title: chatConversations.title });
  return row;
}

export async function deleteConversation(userId: string, id: string) {
  const [deleted] = await db
    .delete(chatConversations)
    .where(and(eq(chatConversations.id, id), eq(chatConversations.userId, userId)))
    .returning({ id: chatConversations.id });
  return Boolean(deleted);
}

// Satu putaran chat lengkap: simpan pesan user, pakai credit, minta jawaban AI,
// lalu simpan jawabannya. Credit dikembalikan bila AI gagal.
export async function sendConversationMessage(
  userId: string,
  conversationId: string,
  content: string,
): Promise<{ reply: string; credits: number }> {
  const [conversation] = await db
    .select({
      id: chatConversations.id,
      title: chatConversations.title,
    })
    .from(chatConversations)
    .where(
      and(
        eq(chatConversations.id, conversationId),
        eq(chatConversations.userId, userId),
      ),
    )
    .limit(1);
  if (!conversation)
    throw new ChatError("NOT_FOUND", "Percakapan tidak ditemukan.");

  if ((await getCreditBalance(userId)) <= 0)
    throw new ChatError(
      "INSUFFICIENT_CREDITS",
      "Credit Anda habis. Silakan top up untuk melanjutkan chat.",
    );

  const [{ total }] = await db
    .select({ total: count(chatMessages.id) })
    .from(chatMessages)
    .where(
      and(
        eq(chatMessages.conversationId, conversationId),
        eq(chatMessages.userId, userId),
      ),
    );

  await db.insert(chatMessages).values({
    conversationId,
    userId,
    role: "user",
    content,
  });
  await db
    .update(chatConversations)
    .set({
      updatedAt: new Date(),
      ...(Number(total) === 0
        ? { title: deriveConversationTitle(content) }
        : {}),
    })
    .where(
      and(
        eq(chatConversations.id, conversationId),
        eq(chatConversations.userId, userId),
      ),
    );

  // Konteks diambil dari database, bukan dari kiriman browser.
  const history = await db
    .select({ role: chatMessages.role, content: chatMessages.content })
    .from(chatMessages)
    .where(
      and(
        eq(chatMessages.conversationId, conversationId),
        eq(chatMessages.userId, userId),
      ),
    )
    .orderBy(asc(chatMessages.createdAt), asc(chatMessages.id))
    .limit(CONTEXT_MESSAGE_LIMIT);

  const credits = await consumeCredit(userId);
  let reply: string;
  try {
    reply = await generateGeminiResponse(history);
  } catch (error) {
    await refundCredit(userId);
    throw error;
  }

  await db.insert(chatMessages).values({
    conversationId,
    userId,
    role: "assistant",
    content: reply,
  });
  await db
    .update(chatConversations)
    .set({ updatedAt: new Date() })
    .where(
      and(
        eq(chatConversations.id, conversationId),
        eq(chatConversations.userId, userId),
      ),
    );

  return { reply, credits };
}
