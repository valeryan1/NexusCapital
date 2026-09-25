import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { 
  BarChart2, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  PieChart as PieChartIcon, 
  Activity, 
  Newspaper,
  CheckCircle2,
  AlertTriangle,
  Info
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export const Route = createFileRoute("/_protected/research")({
  head: () => ({ meta: [{ title: `Research Studio | ${siteConfig.name}` }] }),
  component: ResearchStudio,
});

// ==========================================
// MOCK JSON DATA (Realistic out-of-the-box)
// ==========================================
const mockResearchData = {
  ticker: "BBCA",
  companyName: "Bank Central Asia Tbk.",
  sector: "Financials",
  currentPrice: 9800,
  priceChange: "+150 (+1.55%)",
  valuation: {
    per: { value: 15.2, status: "Healthy", threshold: "< 15 is Undervalued" },
    pbv: { value: 4.8, status: "Overvalued", threshold: "< 1.5 is Undervalued" },
    roe: { value: 22.5, status: "Healthy", threshold: "> 15% is Healthy" },
    divYield: { value: 2.1, status: "Healthy", threshold: "> 4% is High" },
    der: { value: 0.15, status: "Undervalued", threshold: "< 1 is Healthy" }, // Low debt is considered undervalued/very healthy here
  },
  historicalBands: [
    { year: "2019", per: 18, pbv: 4.2 },
    { year: "2020", per: 14, pbv: 3.5 },
    { year: "2021", per: 19, pbv: 4.5 },
    { year: "2022", per: 21, pbv: 5.0 },
    { year: "2023", per: 16, pbv: 4.7 },
    { year: "2024", per: 15.2, pbv: 4.8 },
  ],
  earnings: {
    nextRelease: "Oct 25, 2026",
    daysLeft: 12,
    history: [
      { quarter: "Q2 2026", type: "Beat", surprisePct: "+4.2%" },
      { quarter: "Q1 2026", type: "Miss", surprisePct: "-1.5%" },
    ]
  },
  ownership: {
    data: [
      { name: "Conglomerate", value: 54.94, color: "#FF7A00" }, // Brand color
      { name: "Foreign Inst.", value: 25.10, color: "#3B82F6" }, // Blue
      { name: "Retail / Public", value: 19.96, color: "#10B981" }, // Green
    ],
    summary: "High conglomerate ownership (54.9%) ensures management stability. Foreign institutional presence (25.1%) indicates strong global confidence. Retail float (20%) is at a healthy equilibrium for liquidity."
  },
  news: [
    { id: 1, date: "2 Hrs Ago", headline: "BBCA Reports Record Breaking Q3 Loan Growth", sentiment: "Bullish", tag: "Earnings" },
    { id: 2, date: "5 Hrs Ago", headline: "Foreign Net Buy Surges on Top Big Banks", sentiment: "Bullish", tag: "Macro" },
    { id: 3, date: "1 Day Ago", headline: "BI Holds Interest Rate, Positive for Credit Demand", sentiment: "Neutral", tag: "Macro" },
    { id: 4, date: "2 Days Ago", headline: "Market Consolidation Affects Finance Sector", sentiment: "Bearish", tag: "Macro" },
  ]
};

// Helper component for Status Badges
const StatusBadge = ({ status }: { status: string }) => {
  if (status === "Undervalued") {
    return <span className="flex items-center gap-1 text-[10px] font-bold text-semantic-bull bg-semantic-bull/10 px-1.5 py-0.5 rounded uppercase border border-semantic-bull/20"><TrendingDown className="size-3" /> Undervalued</span>;
  }
  if (status === "Overvalued") {
    return <span className="flex items-center gap-1 text-[10px] font-bold text-semantic-bear bg-semantic-bear/10 px-1.5 py-0.5 rounded uppercase border border-semantic-bear/20"><TrendingUp className="size-3" /> Overvalued</span>;
  }
  return <span className="flex items-center gap-1 text-[10px] font-bold text-gray-300 bg-gray-500/20 px-1.5 py-0.5 rounded uppercase border border-gray-500/30"><CheckCircle2 className="size-3" /> Healthy</span>;
};

// Helper for Sentiment
const SentimentBadge = ({ sentiment }: { sentiment: string }) => {
  if (sentiment === "Bullish") return <span className="text-[10px] font-bold text-semantic-bull">BULLISH</span>;
  if (sentiment === "Bearish") return <span className="text-[10px] font-bold text-semantic-bear">BEARISH</span>;
  return <span className="text-[10px] font-bold text-gray-400">NEUTRAL</span>;
}

function ResearchStudio() {
  const [tickerInput, setTickerInput] = useState("BBCA");
  const [researchData, setResearchData] = useState<any>(mockResearchData);
  const [isLoading, setIsLoading] = useState(false);
  const cache = useRef<Record<string, any>>({});

  const fetchCompanyData = async (ticker: string) => {
    if (!ticker) return;
    const cacheKey = ticker.toUpperCase().replace(".JK", "");

    if (cache.current[cacheKey]) {
      setResearchData(cache.current[cacheKey]);
      return;
    }

    setIsLoading(true);
    try {
      const screenerQuery = `symbol='${cacheKey}.JK' and (pe_ttm > -9999 or pe_ttm is null) and (pb_mrq > -9999 or pb_mrq is null) and (roe_ttm > -9999 or roe_ttm is null) and (der_mrq > -9999 or der_mrq is null) and (yield_ttm >= 0 or yield_ttm is null)`;

      const [reportResponse, newsResponse, screenerResponse] = await Promise.all([
        fetch(`https://api.sectors.app/v2/company/report/${cacheKey}.JK/?sections=overview,valuation,financials,dividend,ownership`, {
          headers: { Authorization: "ced24817315a288d530ac3dc65a2d871d86420ea14dcac64b5e8348319d0119b" }
        }),
        fetch(`https://api.sectors.app/v2/news/?extension=idx&symbols=${cacheKey}&limit=5`, {
          headers: { Authorization: "ced24817315a288d530ac3dc65a2d871d86420ea14dcac64b5e8348319d0119b" }
        }),
        // Sebagai ganti financials, kita panggil screener endpoint yang payloadnya sangat kecil (hanya sekian byte)
        fetch(`https://api.sectors.app/v2/companies/?where=${encodeURIComponent(screenerQuery)}&include_query_values=true`, {
          headers: { Authorization: "ced24817315a288d530ac3dc65a2d871d86420ea14dcac64b5e8348319d0119b" }
        })
      ]);
      
      if (!reportResponse.ok) throw new Error("Failed to fetch report");
      
      const res = await reportResponse.json();
      const newsData = newsResponse.ok ? await newsResponse.json() : { results: [] };
      const screenerData = screenerResponse.ok ? await screenerResponse.json() : { results: [] };

      const historicalEpsObj = res.financials?.historical_eps || {};
      const epsYears = Object.keys(historicalEpsObj).sort();
      const epsDataWithGrowth = epsYears
        .map(year => ({ year, ...historicalEpsObj[year] }))
        .filter((item: any) => item.eps_growth !== undefined && item.eps_growth !== null)
        .slice(-2);
        
      let earningsHistory = mockResearchData.earnings.history;
      if (epsDataWithGrowth.length > 0) {
        earningsHistory = epsDataWithGrowth.reverse().map((item: any) => {
          const growth = item.eps_growth;
          return {
            quarter: "FY " + item.year,
            type: growth > 0 ? "Growth" : "Decline",
            surprisePct: (growth > 0 ? "+" : "") + (growth * 100).toFixed(1) + "%"
          };
        });
      }

      const metrics = screenerData.results?.[0]?.query_values || {};
      const top3Shareholders = res.ownership?.major_shareholders?.slice(0, 3) || [];
      const colors = ["#FF7A00", "#3B82F6", "#10B981"];

      const mappedNews = (newsData.results || []).slice(0, 5).map((n: any, i: number) => {
        const d = new Date(n.timestamp);
        const dateStr = d.toLocaleDateString("id-ID", { month: "short", day: "numeric", year: "numeric" });
        
        let sentiment = "Neutral";
        if (n.tags?.includes("Bullish")) sentiment = "Bullish";
        if (n.tags?.includes("Bearish")) sentiment = "Bearish";
        
        // Pilih tag selain sentiment jika ada, fallback ke "News"
        const tag = n.tags?.find((t: string) => t !== "Bullish" && t !== "Bearish") || "News";

        return {
          id: i,
          date: dateStr,
          headline: n.title,
          sentiment: sentiment,
          tag: tag
        };
      });

      const mappedData = {
        ...mockResearchData,
        ticker: cacheKey,
        companyName: res.company_name || cacheKey,
        sector: res.overview?.sector || "-",
        currentPrice: res.overview?.last_close_price || 0,
        priceChange: res.overview?.daily_close_change ? (res.overview.daily_close_change > 0 ? "+" : "") + (res.overview.daily_close_change * 100).toFixed(2) + "%" : "0%",
        valuation: {
          ...mockResearchData.valuation,
          per: { ...mockResearchData.valuation.per, value: metrics.pe_ttm ? Number(metrics.pe_ttm.toFixed(2)) : 0 },
          pbv: { ...mockResearchData.valuation.pbv, value: metrics.pb_mrq ? Number(metrics.pb_mrq.toFixed(2)) : 0 },
          roe: { ...mockResearchData.valuation.roe, value: metrics.roe_ttm ? Number((metrics.roe_ttm * 100).toFixed(2)) : 0 },
          divYield: { ...mockResearchData.valuation.divYield, value: metrics.yield_ttm ? Number((metrics.yield_ttm * 100).toFixed(2)) : 0 },
          der: { ...mockResearchData.valuation.der, value: metrics.der_mrq ? Number(metrics.der_mrq.toFixed(2)) : 0 },
        },
        historicalBands: res.valuation?.historical_valuation?.map((item: any) => ({
          year: String(item.year),
          per: Number(item.pe?.toFixed(2) || 0),
          pbv: Number(item.pb?.toFixed(2) || 0)
        })) || [],
        earnings: {
          nextRelease: "TBA (Check IDX)",
          daysLeft: 0,
          history: earningsHistory
        },
        ownership: {
          data: top3Shareholders.map((sh: any, index: number) => ({
            name: sh.name,
            value: Number((Number(sh.share_percentage) * 100).toFixed(2)),
            color: colors[index % colors.length]
          })),
          summary: `Top shareholder is ${top3Shareholders[0]?.name || "-"} with ${(Number(top3Shareholders[0]?.share_percentage || 0) * 100).toFixed(1)}% ownership.`
        },
        news: mappedNews.length > 0 ? mappedNews : [
          { id: 99, date: "Hari ini", headline: `Tidak ada berita terbaru untuk ${cacheKey} saat ini.`, sentiment: "Neutral", tag: "Info" }
        ]
      };

      cache.current[cacheKey] = mappedData;
      setResearchData(mappedData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData("BBCA");
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      fetchCompanyData(tickerInput);
    }
  };

  const data = researchData;

  return (
    <div className="view-section animate-fade-in max-w-7xl mx-auto space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-dark-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="size-6 text-brand-500" />
            Fundamental & Valuation Center
          </h1>
          <p className="text-gray-400 text-sm mt-1">Deep-dive equity analysis and historical valuation tracking.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
          <input 
            type="text" 
            value={tickerInput}
            onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder="Search Ticker..." 
            className="w-full bg-dark-950 border border-dark-700 rounded-lg pl-9 pr-10 py-2 text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 uppercase font-bold" 
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      {/* TICKER OVERVIEW BAR */}
      <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-white tracking-tight">{data.ticker}</h2>
            <span className="text-xs font-medium px-2 py-1 bg-dark-800 text-gray-300 rounded border border-dark-700">{data.sector}</span>
          </div>
          <p className="text-sm text-gray-400 font-medium mt-1">{data.companyName}</p>
        </div>
        <div className="text-left md:text-right">
          <div className="text-3xl font-bold text-white">Rp {data.currentPrice.toLocaleString("id-ID")}</div>
          <div className="text-sm font-bold text-semantic-bull flex items-center md:justify-end gap-1 mt-1">
            <TrendingUp className="size-4" /> {data.priceChange}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: 8 cols */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. VALUATION DASHBOARD (Key Metrics) */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Activity className="size-4 text-brand-500" />
              Key Valuation Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-dark-950 border border-dark-800 rounded-lg p-3 flex flex-col justify-between">
                <div className="text-xs text-gray-500 font-medium mb-1">PER (x)</div>
                <div className="text-xl font-bold text-white mb-2">{data.valuation.per.value}</div>
                <StatusBadge status={data.valuation.per.status} />
              </div>
              <div className="bg-dark-950 border border-dark-800 rounded-lg p-3 flex flex-col justify-between">
                <div className="text-xs text-gray-500 font-medium mb-1">PBV (x)</div>
                <div className="text-xl font-bold text-white mb-2">{data.valuation.pbv.value}</div>
                <StatusBadge status={data.valuation.pbv.status} />
              </div>
              <div className="bg-dark-950 border border-dark-800 rounded-lg p-3 flex flex-col justify-between">
                <div className="text-xs text-gray-500 font-medium mb-1">ROE (%)</div>
                <div className="text-xl font-bold text-white mb-2">{data.valuation.roe.value}%</div>
                <StatusBadge status={data.valuation.roe.status} />
              </div>
              <div className="bg-dark-950 border border-dark-800 rounded-lg p-3 flex flex-col justify-between">
                <div className="text-xs text-gray-500 font-medium mb-1">Div Yield</div>
                <div className="text-xl font-bold text-white mb-2">{data.valuation.divYield.value}%</div>
                <StatusBadge status={data.valuation.divYield.status} />
              </div>
              <div className="bg-dark-950 border border-dark-800 rounded-lg p-3 flex flex-col justify-between">
                <div className="text-xs text-gray-500 font-medium mb-1">DER (x)</div>
                <div className="text-xl font-bold text-white mb-2">{data.valuation.der.value}</div>
                <StatusBadge status={data.valuation.der.status} />
              </div>
            </div>
          </div>

          {/* 2. HISTORICAL VALUATION BANDS */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <TrendingUp className="size-4 text-brand-500" />
                Historical Valuation Bands (5Y)
              </h3>
              <div className="flex gap-2">
                <span className="text-[10px] font-medium bg-brand-500/10 text-brand-500 border border-brand-500/30 px-2 py-1 rounded cursor-pointer">PER</span>
                <span className="text-[10px] font-medium bg-dark-800 text-gray-400 border border-dark-700 px-2 py-1 rounded cursor-pointer hover:text-white">PBV</span>
              </div>
            </div>
            
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.historicalBands} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="year" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                    itemStyle={{ color: '#FF7A00', fontWeight: 'bold' }}
                  />
                  {/* Mean Band Placeholder (simulated visually) */}
                  <Line type="monotone" dataKey="per" stroke="#FF7A00" strokeWidth={3} dot={{ r: 4, fill: '#09090b', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">Chart displays historical Price-to-Earnings Ratio. Compare current levels against the 5-year average to determine mean reversion probability.</p>
          </div>

          {/* 5. CONTEXTUAL COMPANY NEWS FEEDS */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Newspaper className="size-4 text-brand-500" />
              Latest Contextual News
            </h3>
            <div className="space-y-3">
              {data.news.map((item: any) => (
                <div key={item.id} className="group p-3 border border-dark-800 rounded-lg hover:bg-dark-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-dark-950/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-gray-500 font-medium">{item.date}</span>
                      <span className="w-1 h-1 rounded-full bg-dark-700"></span>
                      <span className="text-[10px] font-medium text-gray-400 bg-dark-800 px-1.5 py-0.5 rounded">{item.tag}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors cursor-pointer">{item.headline}</h4>
                  </div>
                  <div className="shrink-0 flex items-center sm:justify-end">
                    <SentimentBadge sentiment={item.sentiment} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 3. EARNINGS CALENDAR & TRACKER */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Calendar className="size-4 text-brand-500" />
              Earnings Tracker
            </h3>
            <div className="bg-dark-950 border border-brand-500/20 rounded-lg p-4 mb-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-xl -mr-10 -mt-10"></div>
              <p className="text-xs text-gray-400 mb-1">Next Expected Release</p>
              <div className="text-lg font-bold text-white mb-2">{data.earnings.nextRelease}</div>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-brand-500/10 border border-brand-500/20 rounded text-xs font-semibold text-brand-500">
                <Info className="size-3" /> In {data.earnings.daysLeft} Days
              </div>
            </div>
            
            <div>
              <h4 className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Recent EPS Growth (FY)</h4>
              <div className="space-y-2">
                {data.earnings.history.map((hist: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-dark-950 border border-dark-800 rounded-lg">
                    <span className="text-sm font-medium text-gray-300">{hist.quarter}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${hist.type === 'Growth' ? 'bg-semantic-bull/10 text-semantic-bull border border-semantic-bull/20' : 'bg-semantic-bear/10 text-semantic-bear border border-semantic-bear/20'}`}>
                        {hist.type}
                      </span>
                      <span className={`text-sm font-bold ${hist.type === 'Growth' ? 'text-semantic-bull' : 'text-semantic-bear'}`}>
                        {hist.surprisePct}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. OWNERSHIP STRUCTURE */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <PieChartIcon className="size-4 text-brand-500" />
              Ownership Structure
            </h3>
            
            <div className="flex justify-center mb-2">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.ownership.data}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {data.ownership.data.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-2 mb-5">
              {data.ownership.data.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-300">{item.name}</span>
                  </div>
                  <span className="font-bold text-white">{item.value}%</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-brand-500/5 border border-brand-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="size-4 text-brand-500 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400 leading-relaxed">
                  <strong className="text-gray-200">AI Insight:</strong> {data.ownership.summary}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
