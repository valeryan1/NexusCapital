import { createFileRoute } from "@tanstack/react-router";
import { withApiSession } from "@/lib/api.server";
import { getWatchlistNotifications, markNotificationsAsRead } from "@/services/watchlist-notification.service.server";

export const Route = createFileRoute("/api/watchlist/notifications")({
  server: {
    handlers: {
      GET: ({ request }) =>
        withApiSession(request, async (session) => {
          const notifications = await getWatchlistNotifications(session.user.id);
          return Response.json({ data: notifications });
        }),
      PATCH: ({ request }) =>
        withApiSession(request, async (session) => {
          await markNotificationsAsRead(session.user.id);
          return Response.json({ success: true });
        }),
    },
  },
});