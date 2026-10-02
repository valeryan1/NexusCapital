import { createFileRoute } from "@tanstack/react-router";
import { ApiError, readJson, withApiSession } from "@/lib/api.server";
import {
  deleteConversation,
  getConversation,
  renameConversation,
} from "@/services/chat.service.server";
import {
  conversationIdSchema,
  renameConversationSchema,
} from "@/validators/chat";

export const Route = createFileRoute("/api/chat/conversations/$id")({
  server: {
    handlers: {
      GET: ({ request, params }) =>
        withApiSession(request, async (session) => {
          const id = conversationIdSchema.parse(params.id);
          const conversation = await getConversation(session.user.id, id);
          if (!conversation)
            throw new ApiError(404, "NOT_FOUND", "Percakapan tidak ditemukan.");
          return Response.json({ data: conversation });
        }),
      PATCH: ({ request, params }) =>
        withApiSession(request, async (session) => {
          const id = conversationIdSchema.parse(params.id);
          const input = renameConversationSchema.parse(await readJson(request));
          const renamed = await renameConversation(
            session.user.id,
            id,
            input.title,
          );
          if (!renamed)
            throw new ApiError(404, "NOT_FOUND", "Percakapan tidak ditemukan.");
          return Response.json({ data: renamed });
        }),
      DELETE: ({ request, params }) =>
        withApiSession(request, async (session) => {
          const id = conversationIdSchema.parse(params.id);
          if (!(await deleteConversation(session.user.id, id)))
            throw new ApiError(404, "NOT_FOUND", "Percakapan tidak ditemukan.");
          return new Response(null, { status: 204 });
        }),
    },
  },
});
