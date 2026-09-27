import { createFileRoute } from "@tanstack/react-router";
import { withApiSession } from "@/lib/api.server";
import { getCreditBalance } from "@/services/credit.service.server";

export const Route = createFileRoute("/api/credits/")({
  server: {
    handlers: {
      GET: ({ request }) =>
        withApiSession(request, async (session) => {
          const credits = await getCreditBalance(session.user.id);
          return Response.json({ data: { credits } });
        }),
    },
  },
});