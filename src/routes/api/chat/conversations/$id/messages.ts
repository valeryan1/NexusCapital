import { createFileRoute } from "@tanstack/react-router";
import { ApiError, readJson, withApiSession } from "@/lib/api.server";
import {
  ChatError,
  sendConversationMessage,
} from "@/services/chat.service.server";
import {
  conversationIdSchema,
  sendMessageSchema,
} from "@/validators/chat";

export const Route = createFileRoute("/api/chat/conversations/$id/messages")({
  server: {
    handlers: {
      POST: async ({ request, params }) =>
        withApiSession(request, async (session) => {
          const id = conversationIdSchema.parse(params.id);
          const input = sendMessageSchema.parse(await readJson(request));

          try {
            const result = await sendConversationMessage(
              session.user.id,
              id,
              input.content,
            );
            return Response.json({ data: result });
          } catch (error) {
            if (error instanceof ChatError) {
              if (error.code === "INSUFFICIENT_CREDITS")
                throw new ApiError(402, error.code, error.message);
              throw new ApiError(404, error.code, error.message);
            }
            throw error;
          }
        }),
    },
  },
});
