import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { Calculator, Search, SlidersHorizontal, TrendingUp, AlertCircle, Filter, Sparkles, X, GripVertical } from "lucide-react";
import { useState, useRef } from "react";


export const Route = createFileRoute("/_protected/valuation")({
  head: () => ({ meta: [{ title: `Valuation Screener | ${siteConfig.name}` }] }),
  component: ValuationPage,
});

function ValuationPage() {
  const [activeFilters, setActiveFilters] = useState<string[]>(['per', 'pbv']);
  const [maxPer, setMaxPer] = useState<number | "">(15);
  const [maxPbv, setMaxPbv] = useState<number | "">(1.5);
  const [minRoe, setMinRoe] = useState<number | "">(10);
  const [maxDer, setMaxDer] = useState<number | "">(1.5);
  const [minYield, setMinYield] = useState<number | "">(0);
  const [minMarketCap, setMinMarketCap] = useState<number | "">(1); // in Trillions
  const [isSearching, setIsSearching] = useState(false);
  const [stocks, setStocks] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Cache untuk menyimpan hasil pencarian sebelumnya (menghemat hit API)
  const queryCache = useRef<Record<string, any[]>>({});

  const fetchStocks = async () => {
    setIsSearching(true);
    setHasSearched(true);
    setAiResponse(null);
    
    try {
      const conditions = [];
      if (activeFilters.includes('per')) conditions.push(`pe_ttm ${maxPer !== "" ? "<= " + maxPer : "> -9999"}`);
      if (activeFilters.includes('pbv')) conditions.push(`pb_mrq ${maxPbv !== "" ? "<= " + maxPbv : "> -9999"}`);
      if (activeFilters.includes('roe')) conditions.push(`roe_ttm ${minRoe !== "" ? ">= " + (Number(minRoe) / 100) : "> -9999"}`);
      if (activeFilters.includes('der')) conditions.push(`der_mrq ${maxDer !== "" ? "<= " + maxDer : "> -9999"}`);
      if (activeFilters.includes('yield')) conditions.push(`yield_ttm ${minYield !== "" ? ">= " + (Number(minYield) / 100) : ">= 0"}`);
      if (activeFilters.includes('marketcap')) {
        if (minMarketCap !== "") conditions.push(`market_cap >= ${Number(minMarketCap) * 1000000000000}`);
      }
      
      conditions.push(`last_close_price > 0`);
      conditions.push(`sector != ''`);
      
      const whereQuery = conditions.join(" and ");
      
      // Cek apakah query ini sudah pernah dicari sebelumnya
      if (queryCache.current[whereQuery]) {
        // Jika ada di cache, gunakan data cache (TIDAK HIT API)
        setStocks(queryCache.current[whereQuery]);
        setIsSearching(false);
        return;
      }

      const url = `https://api.sectors.app/v2/companies/?where=${encodeURIComponent(whereQuery)}&include_query_values=true&limit=10`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: "ced24817315a288d530ac3dc65a2d871d86420ea14dcac64b5e8348319d0119b"
        }
      });
      const data = await response.json();
      
      const mappedStocks = (data.results || []).map((res: any) => ({
        ticker: res.symbol.split('.')[0],
        name: res.company_name,
        price: res.query_values.last_close_price,
        sector: res.query_values.sector,
        per: Number((res.query_values.pe_ttm || 0).toFixed(2)),
        pbv: Number((res.query_values.pb_mrq || 0).toFixed(2)),
        roe: Number(((res.query_values.roe_ttm || 0) * 100).toFixed(2)),
        der: Number((res.query_values.der_mrq || 0).toFixed(2)),
        divYield: Number(((res.query_values.yield_ttm || 0) * 100).toFixed(2)),
        marketCap: res.query_values.market_cap ? (res.query_values.market_cap / 1000000000000).toFixed(2) : "0"
      }));
      
      // Simpan hasil ke dalam cache
      queryCache.current[whereQuery] = mappedStocks;
      setStocks(mappedStocks);
      
    } catch (error) {
      console.error("Failed to fetch stocks:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStocks();
  };

  const availableFilters = ['per', 'pbv', 'roe', 'der', 'yield', 'marketcap'].filter(f => !activeFilters.includes(f));

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("id", id);
  };

  const onDrop = (e: React.DragEvent) => {
    const id = e.dataTransfer.getData("id");
    if (id && !activeFilters.includes(id)) {
      setActiveFilters([...activeFilters, id]);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFilter = (id: string) => {
    setActiveFilters(activeFilters.filter(f => f !== id));
  };

  const handleAskAi = () => {
    setIsAiLoading(true);
    setAiResponse(null);
    setTimeout(() => {
      const sector = stocks.length > 0 ? stocks[0].sector : "Teknologi";
      setAiResponse(`Berdasarkan hasil screener Anda, saham-saham ini tergolong undervalued secara valuasi (PER & PBV rendah). Sektor ${sector} terlihat menarik untuk dikaji lebih lanjut karena metrik fundamentalnya yang solid. Namun, selalu periksa tren pertumbuhan laba sebelum berinvestasi.`);
      setIsAiLoading(false);
    }, 2000);
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        {/* Input Parameters (Left Side) - 4 cols */}
        <div className="lg:col-span-4 sticky top-6 self-start space-y-6">
          
          {/* Available Filters */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-white mb-3">Available Filters</h3>
            <div className="flex flex-wrap gap-2">
              {availableFilters.length === 0 ? (
                <span className="text-xs text-gray-500">All filters are active</span>
              ) : (
                availableFilters.map(f => (
                  <div
                    key={f}
                    draggable
                    onDragStart={(e) => onDragStart(e, f)}
                    className="cursor-grab active:cursor-grabbing px-3 py-1.5 bg-dark-800 hover:bg-dark-700 border border-dark-700 hover:border-brand-500/50 rounded-full text-xs font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <GripVertical className="size-3 text-gray-500" />
                    {f.toUpperCase()}
                  </div>
                ))
              )}
            </div>
            <p className="text-[10px] text-gray-500 mt-3">Drag a filter and drop it into the form below to use it.</p>
          </div>

          <form 
            onSubmit={handleSearch} 
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="bg-dark-900 border border-dark-800 rounded-xl p-5 shadow-sm min-h-[200px]"
          >
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-dark-800">
              <Filter className="size-4 text-brand-500" />
              <h2 className="text-lg font-semibold text-white">Active Filters</h2>
            </div>
            
            <div className="space-y-5">
              {activeFilters.length === 0 && (
                <div className="py-8 text-center border border-dashed border-dark-700 rounded-lg bg-dark-950/50">
                  <p className="text-xs text-gray-500">Drop filters here</p>
                </div>
              )}

              {activeFilters.includes('per') && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 flex justify-between items-center">
                    <span>Target Maximum PER (x)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-brand-500 text-[10px] font-mono border border-brand-500/30 px-1 rounded bg-brand-500/10">&lt; 15x is ideal</span>
                      <button type="button" onClick={() => removeFilter('per')} className="text-gray-500 hover:text-red-400 p-0.5 rounded hover:bg-dark-800 transition-colors">
                        <X className="size-3.5" />
                      </button>
                    </div>
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
              )}

              {activeFilters.includes('pbv') && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 flex justify-between items-center">
                    <span>Target Maximum PBV (x)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-brand-500 text-[10px] font-mono border border-brand-500/30 px-1 rounded bg-brand-500/10">&lt; 1.5x is ideal</span>
                      <button type="button" onClick={() => removeFilter('pbv')} className="text-gray-500 hover:text-red-400 p-0.5 rounded hover:bg-dark-800 transition-colors">
                        <X className="size-3.5" />
                      </button>
                    </div>
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
              )}

              {activeFilters.includes('roe') && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 flex justify-between items-center">
                    <span>Target Minimum ROE (%)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-brand-500 text-[10px] font-mono border border-brand-500/30 px-1 rounded bg-brand-500/10">&gt; 10% is ideal</span>
                      <button type="button" onClick={() => removeFilter('roe')} className="text-gray-500 hover:text-red-400 p-0.5 rounded hover:bg-dark-800 transition-colors">
                        <X className="size-3.5" />
                      </button>
                    </div>
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
              )}

              {activeFilters.includes('der') && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 flex justify-between items-center">
                    <span>Target Maximum DER (x)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-brand-500 text-[10px] font-mono border border-brand-500/30 px-1 rounded bg-brand-500/10">&lt; 1.5x is ideal</span>
                      <button type="button" onClick={() => removeFilter('der')} className="text-gray-500 hover:text-red-400 p-0.5 rounded hover:bg-dark-800 transition-colors">
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </label>
                  <input 
                    type="number" 
                    step="0.1"
                    placeholder="e.g. 1.5" 
                    value={maxDer}
                    onChange={(e) => setMaxDer(e.target.value === "" ? "" : Number(e.target.value))}
                    className="block w-full px-4 py-2.5 border border-dark-700 rounded-lg bg-dark-950 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-mono transition-colors hover:border-dark-600"
                  />
                  <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
                    Debt-to-Equity Ratio.
                  </p>
                </div>
              )}

              {activeFilters.includes('yield') && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 flex justify-between items-center">
                    <span>Target Minimum Div. Yield (%)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-brand-500 text-[10px] font-mono border border-brand-500/30 px-1 rounded bg-brand-500/10">&gt; 4% is ideal</span>
                      <button type="button" onClick={() => removeFilter('yield')} className="text-gray-500 hover:text-red-400 p-0.5 rounded hover:bg-dark-800 transition-colors">
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </label>
                  <input 
                    type="number" 
                    step="0.1"
                    placeholder="e.g. 4" 
                    value={minYield}
                    onChange={(e) => setMinYield(e.target.value === "" ? "" : Number(e.target.value))}
                    className="block w-full px-4 py-2.5 border border-dark-700 rounded-lg bg-dark-950 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-mono transition-colors hover:border-dark-600"
                  />
                  <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
                    Dividend Yield.
                  </p>
                </div>
              )}

              {activeFilters.includes('marketcap') && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 flex justify-between items-center">
                    <span>Min. Market Cap (Trillion IDR)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-brand-500 text-[10px] font-mono border border-brand-500/30 px-1 rounded bg-brand-500/10">&gt; 1T is ideal</span>
                      <button type="button" onClick={() => removeFilter('marketcap')} className="text-gray-500 hover:text-red-400 p-0.5 rounded hover:bg-dark-800 transition-colors">
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </label>
                  <input 
                    type="number" 
                    step="1"
                    placeholder="e.g. 1" 
                    value={minMarketCap}
                    onChange={(e) => setMinMarketCap(e.target.value === "" ? "" : Number(e.target.value))}
                    className="block w-full px-4 py-2.5 border border-dark-700 rounded-lg bg-dark-950 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-mono transition-colors hover:border-dark-600"
                  />
                  <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
                    Market Capitalization.
                  </p>
                </div>
              )}

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
                  onClick={() => { setActiveFilters(['per', 'pbv']); setMaxPer(15); setMaxPbv(1.5); setMinRoe(10); setMaxDer(1.5); setMinYield(0); setMinMarketCap(1); }}
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
                {isSearching ? "Searching..." : `Found ${stocks.length} undervalued stocks matching your criteria`}
              </p>
            </div>
            {stocks.length > 0 && !isSearching && (
              <button 
                onClick={handleAskAi}
                disabled={isAiLoading}
                className="flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-500 text-xs font-medium rounded-lg transition-colors border border-brand-500/30 disabled:opacity-50"
              >
                {isAiLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                ✨ Tanya AI Insight
              </button>
            )}
          </div>

          {aiResponse && (
            <div className="bg-dark-900/50 backdrop-blur-md border border-brand-500/50 rounded-xl p-5 shadow-[0_0_15px_rgba(255,122,0,0.1)] relative animate-fade-in">
              <div className="flex gap-3">
                <div className="p-2 bg-brand-500/20 rounded-lg h-fit">
                  <Sparkles className="size-4 text-brand-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">AI Insight</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {aiResponse}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setAiResponse(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dark-800 border-dashed rounded-xl bg-dark-900/30">
              <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400 text-sm">Scanning market database...</p>
            </div>
          ) : !hasSearched ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-dark-900 border border-dark-800 rounded-xl border-dashed">
              <TrendingUp className="size-10 text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Ready to screen</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                Adjust your valuation parameters on the left and click "Find Matching Stocks" to begin scanning the market.
              </p>
            </div>
          ) : stocks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stocks.map((stock) => (
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
                    <div className="bg-dark-950 rounded-lg p-2.5 border border-dark-800 flex flex-col justify-between">
                      <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">DER</span>
                      <span className={`text-sm font-bold ${stock.der < 1.5 ? 'text-semantic-bull' : 'text-gray-300'}`}>
                        {stock.der}x
                      </span>
                    </div>
                    <div className="bg-dark-950 rounded-lg p-2.5 border border-dark-800 flex flex-col justify-between">
                      <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">YIELD</span>
                      <span className={`text-sm font-bold ${stock.divYield > 4 ? 'text-semantic-bull' : 'text-gray-300'}`}>
                        {stock.divYield}%
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
                onClick={() => { setActiveFilters(['per', 'pbv']); setMaxPer(""); setMaxPbv(""); setMinRoe(""); setMaxDer(""); setMinYield(""); setMinMarketCap(""); }}
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
