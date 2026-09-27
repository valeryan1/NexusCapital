import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { 
  Sparkles, 
  Terminal, 
  Play, 
  Coins, 
  TrendingUp, 
  Radar, 
  Brain, 
  Server, 
  Flame,
  TrendingDown
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getTrendingStocks } from "@/services/sectors.service.server";
import { AddToWatchlistButton } from "@/components/add-to-watchlist-button";

const fetchDashboardStatsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const stocks = await getTrendingStocks();
      return { stocks };
    } catch (error) {
      console.error(error);
      return { stocks: [] };
    }
  });

export const Route = createFileRoute("/_protected/app")({
  head: () => ({ meta: [{ title: `Overview | ${siteConfig.name}` }] }),
  loader: async () => {
    return await fetchDashboardStatsFn();
  },
  component: OverviewPage,
});

const getScore = (change: number) => {
  const percentage = change * 100;
  if (percentage > 5) return { score: 95, label: "Strong Bull", textClass: "text-semantic-bull", bgClass: "bg-semantic-bull", badgeClass: "text-semantic-bull bg-semantic-bull/10 border-semantic-bull/20" };
  if (percentage > 0) return { score: 70 + Math.min(20, Math.floor(percentage * 5)), label: "Bull", textClass: "text-semantic-bull", bgClass: "bg-semantic-bull", badgeClass: "text-semantic-bull bg-semantic-bull/10 border-semantic-bull/20" };
  if (percentage < -5) return { score: 15, label: "Strong Bear", textClass: "text-semantic-bear", bgClass: "bg-semantic-bear", badgeClass: "text-semantic-bear bg-semantic-bear/10 border-semantic-bear/20" };
  if (percentage < 0) return { score: 45 + Math.max(-30, Math.floor(percentage * 5)), label: "Bear", textClass: "text-semantic-bear", bgClass: "bg-semantic-bear", badgeClass: "text-semantic-bear bg-semantic-bear/10 border-semantic-bear/20" };
  return { score: 50, label: "Neutral", textClass: "text-semantic-info", bgClass: "bg-semantic-info", badgeClass: "text-semantic-info bg-semantic-info/10 border-semantic-info/20" };
};

function OverviewPage() {
  const navigate = useNavigate();
  const [ticker, setTicker] = useState("");
  const { stocks } = Route.useLoaderData();

  const handleRunAgents = () => {
    if (!ticker.trim()) return;
    navigate({
      to: "/research",
      search: { q: ticker.trim().toUpperCase(), auto: true }
    });
  };

  return (
    <div className="view-section animate-fade-in max-w-7xl mx-auto space-y-6 pb-12">
      {/* Hero AI Prompt Section */}
      <div className="relative rounded-2xl p-1 bg-gradient-to-r from-dark-800 via-brand-500/20 to-dark-800 shadow-2xl animate-glow">
        <div className="bg-dark-900 rounded-xl p-6 sm:p-8 border border-dark-800 relative overflow-hidden bg-grid-pattern">
          <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-center">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-2xl font-bold text-white">Generate Research</h2>
                <span className="bg-brand-500/10 text-brand-400 border border-brand-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="size-3" /> AI Multi-Agent
                </span>
              </div>
              <p className="text-gray-300 text-sm mb-6 max-w-xl">
                Masukkan kode emiten. Agen Fundamental dan Teknikal kami akan menyintesis jutaan titik data menjadi laporan komprehensif dalam <span className="text-white font-medium">~30 detik</span>.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl">
                <div className="relative flex-1 group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Terminal className="text-brand-500 size-5" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Enter Ticker (e.g., PGEO, MBMA)..." 
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRunAgents()}
                    className="block w-full pl-11 pr-4 py-4 border border-dark-700 rounded-xl leading-5 bg-dark-950 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent sm:text-sm transition-all font-mono shadow-inner group-hover:border-dark-600 uppercase" 
                  />
                </div>
                <button 
                  onClick={handleRunAgents}
                  className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-sm font-bold rounded-xl text-dark-950 bg-brand-500 hover:bg-brand-400 focus:outline-none transition-all gap-2 shadow-[0_0_20px_rgba(255,122,0,0.3)] hover:shadow-[0_0_30px_rgba(255,166,77,0.5)] transform hover:-translate-y-0.5"
                >
                  Run Agents <Play className="size-3 fill-current" />
                </button>
              </div>
            </div>

            <div className="hidden lg:flex flex-col gap-2 p-4 rounded-xl bg-dark-950/80 border border-dark-800 min-w-[200px]">
              <p className="text-xs font-mono text-gray-500 mb-1">Swarm Status</p>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]"></div>
                <span className="text-sm text-gray-300">Fundamental Agt.</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]"></div>
                <span className="text-sm text-gray-300">Technical Agt.</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]"></div>
                <span className="text-sm text-gray-300">Orchestrator</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Credits Card */}
        <div className="bg-dark-900 rounded-xl p-6 border border-dark-800 relative overflow-hidden group hover:border-brand-500/50 transition-colors">
          <div className="absolute -right-4 -bottom-4 text-dark-800 opacity-20 group-hover:text-brand-500 group-hover:opacity-10 transition-all transform group-hover:scale-110">
            <Coins className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-gray-400">Available Credits</p>
            <h3 className="text-3xl font-bold text-white mt-2">1,240 <span className="text-sm font-normal text-gray-500">/ 2000</span></h3>
            <div className="w-full bg-dark-950 rounded-full h-1.5 mt-4 border border-dark-800">
              <div className="bg-gradient-to-r from-brand-500 to-orange-400 h-1.5 rounded-full" style={{ width: '62%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">API key resets in 12 days</p>
          </div>
        </div>

        {/* Total Reports Card */}
        <div className="bg-dark-900 rounded-xl p-6 border border-dark-800 relative overflow-hidden group hover:border-brand-500/50 transition-colors flex flex-col justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Reports Generated</p>
            <div className="flex items-end gap-3 mt-2">
              <h3 className="text-3xl font-bold text-white">348</h3>
              <span className="flex items-center gap-1 text-sm font-medium text-semantic-bull mb-1 bg-semantic-bull/10 px-1.5 py-0.5 rounded border border-semantic-bull/20">
                <TrendingUp className="size-3" /> +12%
              </span>
            </div>
          </div>
          <div className="h-10 mt-4 flex items-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <div className="w-full bg-gradient-to-t from-transparent to-brand-500/20 border-t border-brand-500/40 h-[30%] rounded-t-sm"></div>
            <div className="w-full bg-gradient-to-t from-transparent to-brand-500/30 border-t border-brand-500/50 h-[50%] rounded-t-sm"></div>
            <div className="w-full bg-gradient-to-t from-transparent to-brand-500/20 border-t border-brand-500/40 h-[40%] rounded-t-sm"></div>
            <div className="w-full bg-gradient-to-t from-transparent to-brand-500/40 border-t border-brand-500/60 h-[70%] rounded-t-sm"></div>
            <div className="w-full bg-gradient-to-t from-transparent to-brand-500/60 border-t border-brand-500/80 h-[90%] rounded-t-sm"></div>
            <div className="w-full bg-gradient-to-t from-transparent to-brand-500/80 border-t border-brand-500 h-[100%] rounded-t-sm shadow-[0_-5px_10px_rgba(255,122,0,0.2)]"></div>
          </div>
        </div>

        {/* Active Alerts Card */}
        <div className="bg-dark-900 rounded-xl p-6 border border-dark-800 group hover:border-brand-500/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-400">Active Alerts</p>
              <h3 className="text-3xl font-bold text-white mt-2">3</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-dark-950 border border-dark-800 flex items-center justify-center text-brand-400 relative">
              <Radar className="size-5 animate-pulse-slow" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-semantic-info rounded-full shadow-[0_0_5px_#3B82F6]"></span>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-dark-950 px-2 py-1.5 rounded border border-dark-800">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span> Watching <strong className="text-white">WIFI</strong> drops
            </div>
          </div>
        </div>
        
        {/* AI Compute / Tokens Card */}
        <div className="bg-dark-900 rounded-xl p-6 border border-dark-800 group hover:border-brand-500/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-400">Tokens Processed</p>
              <h3 className="text-3xl font-bold text-white mt-2">1.2M</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-dark-950 border border-dark-800 flex items-center justify-center text-purple-400">
              <Brain className="size-5" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-gray-500 bg-dark-950 px-2 py-1.5 rounded border border-dark-800">
            <Server className="size-3.5 text-brand-500" /> GPT-4o & Claude 3.5
          </div>
        </div>
      </div>

      {/* NEW SECTION: Trending & Live Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        
        {/* Trending Analyses Table */}
        <div className="lg:col-span-2 bg-dark-900 border border-dark-800 rounded-xl overflow-hidden flex flex-col shadow-lg">
          <div className="px-6 py-4 border-b border-dark-800 flex justify-between items-center bg-dark-950">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Flame className="size-4 text-brand-500" /> Market Pulse & AI Sentiment
            </h3>
            <span className="text-xs text-brand-500 bg-brand-500/10 px-2 py-1 rounded font-medium border border-brand-500/20">Live</span>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-dark-800">
              <thead className="bg-dark-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Ticker</th>
                  <th className="px-6 py-3 text-left text-[10px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Price & Change</th>
                  <th className="px-6 py-3 text-left text-[10px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider">AI Score</th>
                  <th className="px-6 py-3 text-right text-[10px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-[10px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {stocks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                      Memuat data pasar real-time...
                    </td>
                  </tr>
                ) : (
                  stocks.map((stock: { ticker: string; name: string; price: number; change: number }) => {
                    const { score, label, textClass, bgClass, badgeClass } = getScore(stock.change);
                    const isPositive = stock.change >= 0;
                    
                    return (
                      <tr key={stock.ticker} className="hover:bg-dark-800/60 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-dark-950 border border-dark-700 flex items-center justify-center text-xs font-bold text-white group-hover:border-brand-500/50 transition-colors">
                              {stock.ticker}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-200 font-bold truncate max-w-[120px] sm:max-w-[200px]">{stock.name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white font-mono">Rp {stock.price.toLocaleString("id-ID")}</span>
                            <span className={`text-xs font-bold flex items-center gap-1 ${isPositive ? 'text-semantic-bull' : 'text-semantic-bear'}`}>
                              {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                              {(stock.change * 100).toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`text-lg font-bold ${textClass}`}>{score}</div>
                            <div className="w-16 h-1.5 bg-dark-950 rounded-full overflow-hidden border border-dark-700">
                              <div className={`h-full rounded-full ${bgClass}`} style={{ width: `${score}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`text-[10px] sm:text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider ${badgeClass}`}>
                            {label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <AddToWatchlistButton
                            symbol={stock.ticker}
                            companyName={stock.name}
                            currentPrice={stock.price}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Swarm Activity (Terminal Style) */}
        <div className="lg:col-span-1 bg-dark-950 border border-dark-800 rounded-xl overflow-hidden flex flex-col relative shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-500/5 pointer-events-none opacity-100"></div>
          <div className="px-4 py-3 border-b border-dark-800 flex justify-between items-center bg-dark-900">
            <h3 className="text-gray-300 text-xs font-mono uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
              Live Swarm Log
            </h3>
            <Terminal className="text-dark-700 size-4" />
          </div>
          <div className="flex-1 p-5 font-mono text-[11px] sm:text-xs space-y-4 overflow-y-auto max-h-[350px]">
            <div className="text-gray-400">
              <span className="text-dark-600">[10:42:01]</span> <span className="text-emerald-400 font-bold">SYS:</span> Micro-report trigger evaluated for <span className="text-white font-bold">WIFI</span>.
            </div>
            <div className="text-gray-400">
              <span className="text-dark-600">[10:43:15]</span> <span className="text-blue-400 font-bold">AGT-F:</span> Fetching Q3 balance sheet for <span className="text-white font-bold">BBCA</span>...
            </div>
            <div className="text-gray-400">
              <span className="text-dark-600">[10:43:16]</span> <span className="text-purple-400 font-bold">AGT-T:</span> Analyzing volume profile (30d) for <span className="text-white font-bold">BBCA</span>...
            </div>
            <div className="text-gray-400">
              <span className="text-dark-600">[10:43:18]</span> <span className="text-brand-500 font-bold">ORCH:</span> Synthesizing conflicting bias.
            </div>
            <div className="text-gray-400">
              <span className="text-dark-600">[10:43:20]</span> <span className="text-emerald-400 font-bold">SYS:</span> PDF Generated. Tokens used: 4,102.
            </div>
            <div className="text-gray-400">
              <span className="text-dark-600">[10:45:10]</span> <span className="text-blue-400 font-bold">AGT-F:</span> Fetching screener data for <span className="text-white font-bold">GOTO</span>.
            </div>
            <div className="flex items-center gap-2 text-brand-500 font-bold mt-4 pt-4 border-t border-dark-800/50">
              <span className="text-dark-600 font-normal">[{new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span> Awaiting prompt <span className="w-2 h-4 bg-brand-500 animate-pulse"></span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
