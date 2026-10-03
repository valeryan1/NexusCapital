import { useCallback, useEffect, useMemo, useState } from "react";

export type ConversationSummary = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
};

export type ThreadMessage = {
  id?: string;
  role: "user" | "assistant";
  content: string;
};

type ApiErrorShape = { error?: { code?: string; message?: string } };

async function readError(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as ApiErrorShape;
    return {
      code: body.error?.code ?? "REQUEST_FAILED",
      message: body.error?.message ?? fallback,
    };
  } catch {
    return { code: "REQUEST_FAILED", message: fallback };
  }
}

// Semua percakapan milik pengguna yang sudah masuk. Riwayat diambil dari
// /api/chat/conversations, jadi data tidak pernah datang dari kiriman browser.
export function useAssistantChat(initialCredits: number) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [credits, setCredits] = useState(initialCredits);
  const [isListLoading, setIsListLoading] = useState(true);
  const [isThreadLoading, setIsThreadLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Riwayat hanya dibaca sekali saat halaman dibuka; setelah itu daftar
  // diperbarui langsung di state setelah chat dikirim atau dihapus.
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch("/api/chat/conversations", {
          credentials: "same-origin",
        });
        if (!response.ok) throw new Error("Gagal memuat riwayat chat.");
        const body = (await response.json()) as {
          data: ConversationSummary[];
        };
        if (!cancelled) setConversations(body.data);
      } catch (cause) {
        if (!cancelled)
          setError(
            cause instanceof Error
              ? cause.message
              : "Gagal memuat riwayat chat.",
          );
      } finally {
        if (!cancelled) setIsListLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectConversation = useCallback(async (id: string) => {
    setActiveId(id);
    setIsThreadLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/chat/conversations/${id}`, {
        credentials: "same-origin",
      });
      if (!response.ok) {
        const { message } = await readError(response, "Gagal membuka chat.");
        throw new Error(message);
      }
      const body = (await response.json()) as {
        data: { messages: ThreadMessage[] };
      };
      setMessages(body.data.messages);
    } catch (cause) {
      setMessages([]);
      setError(
        cause instanceof Error ? cause.message : "Gagal membuka chat.",
      );
    } finally {
      setIsThreadLoading(false);
    }
  }, []);

  const startNewChat = useCallback(() => {
    setActiveId(null);
    setMessages([]);
    setError(null);
  }, []);

  const deleteConversation = useCallback(
    async (id: string) => {
      const response = await fetch(`/api/chat/conversations/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!response.ok && response.status !== 404) {
        const { message } = await readError(response, "Gagal menghapus chat.");
        setError(message);
        return;
      }
      setConversations((previous) =>
        previous.filter((item) => item.id !== id),
      );
      if (activeId === id) startNewChat();
    },
    [activeId, startNewChat],
  );

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || isSending) return;

      setIsSending(true);
      setError(null);
      setMessages((previous) => [
        ...previous,
        { role: "user", content },
      ]);

      try {
        let conversationId = activeId;
        if (!conversationId) {
          const created = await fetch("/api/chat/conversations", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });
          if (!created.ok) {
            const { message } = await readError(
              created,
              "Gagal membuat percakapan baru.",
            );
            throw new Error(message);
          }
          const body = (await created.json()) as {
            data: ConversationSummary;
          };
          conversationId = body.data.id;
          setActiveId(conversationId);
          setConversations((previous) => [body.data, ...previous]);
        }

        const response = await fetch(
          `/api/chat/conversations/${conversationId}/messages`,
          {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
          },
        );

        if (!response.ok) {
          const { code, message } = await readError(
            response,
            "Gagal mengirim pesan.",
          );
          if (code === "INSUFFICIENT_CREDITS") setCredits(0);
          throw new Error(message);
        }

        const body = (await response.json()) as {
          data: { reply: string; credits: number };
        };
        setMessages((previous) => [
          ...previous,
          { role: "assistant", content: body.data.reply },
        ]);
        setCredits(body.data.credits);
        window.dispatchEvent(new Event("nexus:credits-updated"));
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Gagal mengirim pesan. Coba lagi.",
        );
      } finally {
        setIsSending(false);
      }
    },
    [activeId, isSending],
  );

  return useMemo(
    () => ({
      conversations,
      activeId,
      messages,
      credits,
      isListLoading,
      isThreadLoading,
      isSending,
      error,
      send,
      selectConversation,
      startNewChat,
      deleteConversation,
      clearError: () => setError(null),
    }),
    [
      conversations,
      activeId,
      messages,
      credits,
      isListLoading,
      isThreadLoading,
      isSending,
      error,
      send,
      selectConversation,
      startNewChat,
      deleteConversation,
    ],
  );
}
