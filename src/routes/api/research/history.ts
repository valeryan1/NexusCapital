import { createFileRoute } from "@tanstack/react-router";
import { withApiSession } from "@/lib/api.server";
import { getResearchHistory } from "@/services/research.service.server";

export const Route = createFileRoute("/api/research/history")({
  server: {
    handlers: {
      GET: ({ request }) =>
        withApiSession(request, async (session) => {
          const projects = await getResearchHistory(session.user.id);
          // Recents = one entry per ticker, latest first (rows are already ordered desc).
          // Drop the heavy report blobs — the sidebar only needs id/ticker/companyName.
          const seen = new Set<string>();
          const recents = projects
            .filter((project) => {
              if (seen.has(project.ticker)) return false;
              seen.add(project.ticker);
              return true;
            })
            .slice(0, 8)
            .map(({ id, ticker, companyName }) => ({ id, ticker, companyName }));
          return Response.json({ data: recents });
        }),
    },
  },
});
