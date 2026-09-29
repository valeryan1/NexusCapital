import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Star, Trash2, Bell } from "lucide-react";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

const getWatchlistFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const [{ getSession }, { getWatchlist }] = await Promise.all([
      import("@/lib/session.server"),
      import("@/services/watchlist.service.server"),
    ]);
    const session = await getSession(getRequestHeaders() as unknown as Headers);
    return session ? getWatchlist(session.user.id) : [];
  });

const removeFromWatchlistFn = createServerFn({ method: "POST" })
  .validator((data: { symbol: string }) => data)
  .handler(async ({ data }) => {
    const [{ getSession }, { removeFromWatchlist }] = await Promise.all([
      import("@/lib/session.server"),
      import("@/services/watchlist.service.server"),
    ]);
    const session = await getSession(getRequestHeaders() as unknown as Headers);
    if (!session) throw new Error("Unauthorized");
    return removeFromWatchlist(session.user.id, data.symbol);
  });

interface WatchlistItem {
  id: string;
  userId: string;
  symbol: string;
  name: string | null;
  groupName: string;
  createdAt: Date;
}

export const Route = createFileRoute("/_protected/watchlist")({
  loader: async () => ({
    watchlist: await getWatchlistFn(),
  }),
  component: WatchlistPage,
});

function WatchlistPage() {
  const router = useRouter();
  const { watchlist } = Route.useLoaderData();

  // Grouping logic
  const groupedWatchlist = watchlist.reduce((acc: Record<string, WatchlistItem[]>, item: WatchlistItem) => {
    const group = item.groupName || "Default";
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  const handleRemove = async (sym: string) => {
    try {
      await removeFromWatchlistFn({ data: { symbol: sym } });
      await router.invalidate();
    } catch {
      // Error handled by server fn
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Watchlist Saham</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau saham pilihanmu. Tambahkan saham baru melalui menu Screener, Research, atau Overview.
          </p>
        </div>
      </div>

      {watchlist.length === 0 ? (
        <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-12 text-center text-gray-500 border border-dashed border-dark-700 rounded-xl m-4 bg-dark-950/50">
            <Star size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium text-gray-400">Watchlist Anda masih kosong</p>
            <p className="text-sm mt-1 max-w-sm mx-auto">Tambahkan saham dari Research, Screener, atau App Overview untuk memantau notifikasi dan harga di sini.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedWatchlist).map(([groupName, items]) => (
            <div key={groupName} className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden shadow-lg">
              <div className="bg-dark-950 border-b border-dark-800 px-5 py-3">
                <h2 className="text-sm font-bold text-brand-500 uppercase tracking-wider">{groupName}</h2>
              </div>
              <ul className="divide-y divide-dark-800">
                {items.map((item: WatchlistItem) => (
                  <li key={item.symbol} className="flex items-center justify-between p-4 hover:bg-dark-800/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-brand-500/10 border border-brand-500/20 rounded-lg group-hover:bg-brand-500/20 transition-colors">
                        <Star size={20} className="text-brand-500" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg">{item.symbol}</p>
                        {item.name && <p className="text-sm text-gray-500">{item.name}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors border border-transparent hover:border-blue-500/20" aria-label="Set alerts">
                        <Bell size={14} />
                        <span className="hidden sm:inline">Set Alert</span>
                      </button>
                      <button
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                        onClick={() => handleRemove(item.symbol)}
                        aria-label={`Remove ${item.symbol} from watchlist`}
                      >
                        <Trash2 size={14} />
                        <span className="hidden sm:inline">Hapus</span>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}