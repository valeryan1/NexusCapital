import { createFileRoute } from "@tanstack/react-router";
import { readJson, withApiSession } from "@/lib/api.server";
import { getWatchlist, addToWatchlist } from "@/services/watchlist.service.server";
import { z } from "zod";

const createWatchlistSchema = z.object({
  symbol: z.string().min(1).max(10).toUpperCase(),
  name: z.string().optional(),
  groupName: z.string().optional().default("Default"),
});

export const Route = createFileRoute("/api/watchlist/")({
  server: {
    handlers: {
      GET: ({ request }) =>
        withApiSession(request, async (session) => {
          const watchlist = await getWatchlist(session.user.id);
          return Response.json({ data: watchlist });
        }),
      POST: ({ request }) =>
        withApiSession(request, async (session) => {
          const input = createWatchlistSchema.parse(await readJson(request));
          const item = await addToWatchlist(session.user.id, input.symbol, input.name, input.groupName);
          const { createNotification } = await import("@/services/watchlist-notification.service.server");
          await createNotification(session.user.id, {
            kind: "alert",
            symbol: input.symbol,
            title: `Ditambahkan ke Grup: ${input.groupName}`,
            body: `Saham ${input.symbol} baru saja ditambahkan ke watchlist grup ${input.groupName}.`,
          });
          return Response.json({ data: item }, { status: 201 });
        }),
    },
  },
});