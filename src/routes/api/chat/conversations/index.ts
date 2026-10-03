import { createFileRoute } from "@tanstack/react-router";
import { readJson, withApiSession } from "@/lib/api.server";
import {
  createConversation,
  listConversations,
} from "@/services/chat.service.server";
import {
  createConversationSchema,
  listConversationsSchema,
} from "@/validators/chat";

export const Route = createFileRoute("/api/chat/conversations/")({
  server: {
    handlers: {
      GET: ({ request }) =>
        withApiSession(request, async (session) => {
          const query = listConversationsSchema.parse(
            Object.fromEntries(new URL(request.url).searchParams),
          );
          return Response.json({
            data: await listConversations(session.user.id, query),
          });
        }),
      POST: ({ request }) =>
        withApiSession(request, async (session) => {
          const input = createConversationSchema.parse(await readJson(request));
          const conversation = await createConversation(session.user.id, input);
          return Response.json(
            { data: conversation },
            {
              status: 201,
              headers: {
                Location: `/api/chat/conversations/${conversation.id}`,
              },
            },
          );
        }),
    },
  },
});
