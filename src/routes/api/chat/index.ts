import { createFileRoute } from "@tanstack/react-router";
import {
  generateCustomerServiceResponse,
  type ChatMessage,
} from "@/services/customer-service.service.server";
import { auth } from "@/lib/auth.server";

interface ChatRequest {
  messages: ChatMessage[];
}

export const Route = createFileRoute("/api/chat/")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as ChatRequest;

          if (
            !body.messages ||
            !Array.isArray(body.messages) ||
            body.messages.length === 0
          ) {
            return Response.json(
              { error: "messages array is required and must not be empty." },
              { status: 422 },
            );
          }

          // Validate message shape
          const valid = body.messages.every(
            (m) =>
              typeof m.content === "string" &&
              (m.role === "user" || m.role === "assistant"),
          );
          if (!valid) {
            return Response.json(
              { error: "Each message must have role (user|assistant) and content (string)." },
              { status: 422 },
            );
          }

          // Optionally get username if logged in (no auth required)
          let userName: string | undefined;
          try {
            const session = await auth.api.getSession({
              headers: request.headers,
              query: { disableCookieCache: true },
            });
            if (session?.user?.name) {
              userName = session.user.name;
            }
          } catch {
            // Not logged in, that's fine
          }

          // Only send last 10 messages for context window
          const recentMessages = body.messages.slice(-10);

          const reply = await generateCustomerServiceResponse(
            recentMessages,
            userName,
          );

          return Response.json({ reply });
        } catch (error) {
          console.error("Chat API error:", error);
          return Response.json(
            {
              error:
                error instanceof Error
                  ? error.message
                  : "Internal server error.",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
