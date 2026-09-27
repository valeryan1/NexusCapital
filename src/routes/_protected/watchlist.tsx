import { createFileRoute } from "@tanstack/react-router";
import { Star, Plus, Trash2, Bell } from "lucide-react";
import { useState } from "react";
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

const addToWatchlistFn = createServerFn({ method: "POST" })
  .validator((data: { symbol: string; name?: string }) => data)
  .handler(async ({ data }) => {
    const [{ getSession }, { addToWatchlist }] = await Promise.all([
      import("@/lib/session.server"),
      import("@/services/watchlist.service.server"),
    ]);
    const session = await getSession(getRequestHeaders() as unknown as Headers);
    if (!session) throw new Error("Unauthorized");
    return addToWatchlist(session.user.id, data.symbol, data.name);
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
  createdAt: Date;
}

export const Route = createFileRoute("/_protected/watchlist")({
  loader: async () => ({
    watchlist: await getWatchlistFn(),
  }),
  component: WatchlistPage,
});

function WatchlistPage() {
  const { watchlist } = Route.useLoaderData();
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) return;
    setIsAdding(true);
    try {
      await addToWatchlistFn({ data: { symbol: symbol.toUpperCase(), name } });
      setSymbol("");
      setName("");
      window.location.reload();
    } catch {
      // Error handled by server fn
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (sym: string) => {
    try {
      await removeFromWatchlistFn({ data: { symbol: sym } });
      window.location.reload();
    } catch {
      // Error handled by server fn
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Watchlist</h1>
      </div>

      <form onSubmit={handleAdd} className="flex gap-3 p-4 bg-dark-900 border border-dark-800 rounded-xl">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="BBCA"
            className="w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none"
            maxLength={10}
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Name (optional)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bank Central Asia"
            className="w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isAdding || !symbol.trim()}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed self-end"
        >
          <Plus size={16} className="mr-1" />
          Add
        </button>
      </form>

      <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
        {watchlist.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Star size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">Your watchlist is empty</p>
            <p className="text-sm mt-1">Add tickers to track them</p>
          </div>
        ) : (
          <ul className="divide-y divide-dark-800">
            {watchlist.map((item: WatchlistItem) => (
              <li key={item.symbol} className="flex items-center justify-between p-4 hover:bg-dark-950 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-brand-500/10 rounded-lg">
                    <Star size={20} className="text-brand-500" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{item.symbol}</p>
                    {item.name && <p className="text-sm text-gray-500">{item.name}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    onClick={() => handleRemove(item.symbol)}
                    aria-label={`Remove ${item.symbol} from watchlist`}
                  >
                    <Trash2 size={18} />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" aria-label="Set alerts">
                    <Bell size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}