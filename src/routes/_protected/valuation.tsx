import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { Calculator, Search, SlidersHorizontal, TrendingUp, AlertCircle, Filter } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_protected/valuation")({
  head: () => ({ meta: [{ title: `Valuation Screener | ${siteConfig.name}` }] }),
  component: ValuationPage,
});

// Mock data with raw fundamental values
const rawStocks = [
  { ticker: "BBCA", name: "Bank Central Asia Tbk.", price: 9800, eps: 645, bvps: 2042, netIncome: 48000, totalEquity: 240000, sector: "Finance" },
  { ticker: "BBRI", name: "Bank Rakyat Indonesia", price: 5400, eps: 446, bvps: 2160, netIncome: 51000, totalEquity: 300000, sector: "Finance" },
  { ticker: "ASII", name: "Astra International", price: 5100, eps: 750, bvps: 4636, netIncome: 28000, totalEquity: 180000, sector: "Consumer" },
  { ticker: "TLKM", name: "Telkom Indonesia", price: 3200, eps: 220, bvps: 1142, netIncome: 24000, totalEquity: 130000, sector: "Technology" },
  { ticker: "ITMG", name: "Indo Tambangraya", price: 27500, eps: 8593, bvps: 22916, netIncome: 15000, totalEquity: 30000, sector: "Energy" },
  { ticker: "PTBA", name: "Bukit Asam Tbk.", price: 2900, eps: 707, bvps: 2230, netIncome: 8000, totalEquity: 20000, sector: "Energy" },
  { ticker: "ICBP", name: "Indofood CBP", price: 11200, eps: 682, bvps: 3500, netIncome: 8500, totalEquity: 35000, sector: "Consumer" },
  { ticker: "PGEO", name: "Pertamina Geothermal", price: 1250, eps: 68, bvps: 595, netIncome: 2500, totalEquity: 25000, sector: "Energy" },
];

function calculateMetrics(stock: typeof rawStocks[0]) {
  const per = stock.price / stock.eps;
  const pbv = stock.price / stock.bvps;
  const roe = (stock.netIncome / stock.totalEquity) * 100;
  return {
    ...stock,
    per: Number(per.toFixed(2)),
    pbv: Number(pbv.toFixed(2)),
    roe: Number(roe.toFixed(2)),
  };
}

const mockStocks = rawStocks.map(calculateMetrics);

function ValuationPage() {
  const [maxPer, setMaxPer] = useState<number | "">(15);
  const [maxPbv, setMaxPbv] = useState<number | "">(1.5);
  const [minRoe, setMinRoe] = useState<number | "">(10);
  const [isSearching, setIsSearching] = useState(false);

  // Filter logic
  const filteredStocks = mockStocks.filter(stock => {
    if (maxPer !== "" && stock.per > Number(maxPer)) return false;
    if (maxPbv !== "" && stock.pbv > Number(maxPbv)) return false;
    if (minRoe !== "" && stock.roe < Number(minRoe)) return false;
    return true;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 600); // simulate loading
  };

  return (
    <div className="view-section animate-fade-in max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-brand-500/10 rounded-xl border border-brand-500/20 text-brand-500">
          <SlidersHorizontal className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Valuation Screener</h1>
          <p className="text-sm text-gray-400">Find undervalued stocks based on Price-to-Earnings (PER) and Price-to-Book (PBV) ratios.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters (Left Side) - 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          <form onSubmit={handleSearch} className="bg-dark-900 border border-dark-800 rounded-xl p-5 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-dark-800">
              <Filter className="size-4 text-brand-500" />
              <h2 className="text-lg font-semibold text-white">Valuation Filters</h2>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 flex justify-between">
                  <span>Target Maximum PER (x)</span>
                  <span className="text-brand-500 text-[10px] font-mono border border-brand-500/30 px-1 rounded bg-brand-500/10">&lt; 15x is ideal</span>
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  placeholder="e.g. 10" 
                  value={maxPer}
                  onChange={(e) => setMaxPer(e.target.value === "" ? "" : Number(e.target.value))}
                  className="block w-full px-4 py-2.5 border border-dark-700 rounded-lg bg-dark-950 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-mono transition-colors hover:border-dark-600"
                />
                <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
                  Price-to-Earnings Ratio. Lower PER generally indicates the stock is cheaper relative to its earnings.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 flex justify-between">
                  <span>Target Maximum PBV (x)</span>
                  <span className="text-brand-500 text-[10px] font-mono border border-brand-500/30 px-1 rounded bg-brand-500/10">&lt; 1.5x is ideal</span>
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  placeholder="e.g. 1.5" 
                  value={maxPbv}
                  onChange={(e) => setMaxPbv(e.target.value === "" ? "" : Number(e.target.value))}
                  className="block w-full px-4 py-2.5 border border-dark-700 rounded-lg bg-dark-950 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-mono transition-colors hover:border-dark-600"
                />
                <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
                  Price-to-Book Value. A PBV under 1.5 usually indicates the stock is reasonably priced relative to assets.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 flex justify-between">
                  <span>Target Minimum ROE (%)</span>
                  <span className="text-brand-500 text-[10px] font-mono border border-brand-500/30 px-1 rounded bg-brand-500/10">&gt; 10% is ideal</span>
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  placeholder="e.g. 10" 
                  value={minRoe}
                  onChange={(e) => setMinRoe(e.target.value === "" ? "" : Number(e.target.value))}
                  className="block w-full px-4 py-2.5 border border-dark-700 rounded-lg bg-dark-950 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-mono transition-colors hover:border-dark-600"
                />
                <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
                  Return on Equity. Higher ROE means the company is highly efficient at generating profits from its equity.
                </p>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="w-full bg-brand-500 hover:bg-brand-400 text-dark-950 font-bold py-3 px-4 rounded-lg transition-all flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(255,122,0,0.3)] hover:shadow-[0_0_25px_rgba(255,122,0,0.5)] active:scale-[0.98] disabled:opacity-70"
                >
                  {isSearching ? (
                    <div className="w-5 h-5 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Search className="size-4" /> Find Matching Stocks
                    </>
                  )}
                </button>
                <button 
                  type="button"
                  onClick={() => { setMaxPer(15); setMaxPbv(1.5); setMinRoe(10); }}
                  className="w-full mt-3 text-gray-400 hover:text-white text-xs font-medium py-2 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results Section (Right Side) - 8 cols */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between bg-dark-900 border border-dark-800 rounded-xl px-5 py-4">
            <div>
              <h2 className="text-white font-semibold flex items-center gap-2">
                Screener Results
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {isSearching ? "Searching..." : `Found ${filteredStocks.length} undervalued stocks matching your criteria`}
              </p>
            </div>
          </div>

          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dark-800 border-dashed rounded-xl bg-dark-900/30">
              <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400 text-sm">Scanning market database...</p>
            </div>
          ) : filteredStocks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStocks.map((stock) => (
                <div key={stock.ticker} className="bg-dark-900 border border-dark-800 rounded-xl p-5 hover:border-brand-500/50 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-brand-500 transition-colors">{stock.ticker}</h3>
                      <p className="text-xs text-gray-500">{stock.name}</p>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-1 rounded bg-dark-800 text-gray-400 border border-dark-700">
                      {stock.sector}
                    </span>
                  </div>
                  
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold text-white">Rp {stock.price.toLocaleString("id-ID")}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-dark-950 rounded-lg p-2.5 border border-dark-800 flex flex-col justify-between">
                      <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">PER</span>
                      <span className={`text-sm font-bold ${stock.per < 15 ? 'text-semantic-bull' : 'text-gray-300'}`}>
                        {stock.per}x
                      </span>
                    </div>
                    <div className="bg-dark-950 rounded-lg p-2.5 border border-dark-800 flex flex-col justify-between">
                      <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">PBV</span>
                      <span className={`text-sm font-bold ${stock.pbv < 1.5 ? 'text-semantic-bull' : 'text-gray-300'}`}>
                        {stock.pbv}x
                      </span>
                    </div>
                    <div className="bg-dark-950 rounded-lg p-2.5 border border-dark-800 flex flex-col justify-between">
                      <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">ROE</span>
                      <span className={`text-sm font-bold ${stock.roe > 10 ? 'text-semantic-bull' : 'text-gray-300'}`}>
                        {stock.roe}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 border border-dark-800 border-dashed rounded-xl bg-dark-900/30 text-center px-4">
              <AlertCircle className="size-10 text-gray-600 mb-3" />
              <h3 className="text-white font-medium mb-1">No stocks found</h3>
              <p className="text-gray-500 text-sm max-w-md">
                We couldn't find any stocks matching your strict PER, PBV, and ROE criteria. Try adjusting the parameters to broaden your search.
              </p>
              <button 
                onClick={() => { setMaxPer(""); setMaxPbv(""); setMinRoe(""); }}
                className="mt-4 text-brand-500 text-sm font-medium hover:text-brand-400 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
