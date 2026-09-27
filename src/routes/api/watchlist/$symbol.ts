import { createFileRoute } from "@tanstack/react-router";
import { withApiSession } from "@/lib/api.server";
import { removeFromWatchlist } from "@/services/watchlist.service.server";

export const Route = createFileRoute("/api/watchlist/$symbol")({
  server: {
    handlers: {
      DELETE: ({ request, params }) =>
        withApiSession(request, async (session) => {
          await removeFromWatchlist(session.user.id, params.symbol);
          return Response.json({ success: true });
        }),
    },
  },
});