import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { 
  BarChart2, 
  Search, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Globe,
  PieChart as PieChartIcon,
  CheckCircle2,
  ShieldAlert,
  Target,
  ArrowRightLeft,
  Briefcase
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis,
  BarChart,
  Bar
} from "recharts";
import { NexusScoreGauge } from "@/components/nexus-score-gauge";
import { Sparkles, Loader2 } from "lucide-react";
import { createServerFn } from "@tanstack/react-start";
import { generateResearchReport } from "@/services/research.service.server";

const generateReportFn = createServerFn({ method: 'POST' })
  .validator((ticker: string) => ticker)
  .handler(async ({ data }) => {
    return await generateResearchReport(data);
  });

export const Route = createFileRoute("/_protected/research")({
  head: () => ({ meta: [{ title: `Research Studio | ${siteConfig.name}` }] }),
  validateSearch: (search: Record<string, unknown>): { q?: string; auto?: boolean } => {
    return {
      q: typeof search.q === 'string' ? search.q : undefined,
      auto: search.auto === true || search.auto === 'true'
    }
  },
  component: ResearchStudio,
});

// ==========================================
// INSTITUTIONAL MOCK DATA
// ==========================================
const mockResearchData = {
  ticker: "BBCA",
  companyName: "Bank Central Asia Tbk.",
  sector: "Financials",
  currentPrice: 9800,
  priceChange: "+150 (+1.55%)",
  nexusScore: 82,
  valuation: {
    per: { value: 15.2, status: "Healthy", threshold: "< 15 is Undervalued" },
    pbv: { value: 4.8, status: "Overvalued", threshold: "< 1.5 is Undervalued" },
    roe: { value: 22.5, status: "Healthy", threshold: "> 15% is Healthy" },
    divYield: { value: 2.1, status: "Healthy", threshold: "> 4% is High" },
    der: { value: 0.15, status: "Undervalued", threshold: "< 1 is Healthy" },
  },
  quantModels: {
    piotroski: { score: 8, max: 9, interpretation: "Exceptional Health", color: "text-semantic-bull" },
    altman: { score: 3.8, interpretation: "Safe Zone", color: "text-semantic-bull" }
  },
  intrinsicValue: {
    fairValue: 11500,
    marginOfSafety: 14.7, 
    model: "10Y Discounted Cash Flow"
  },
  foreignFlow: [
    { date: "D-4", flow: 150 },
    { date: "D-3", flow: -45 },
    { date: "D-2", flow: 320 },
    { date: "D-1", flow: 850 },
    { date: "Today", flow: 1200 },
  ],
  bandarmologi: {
    status: "Massive Accumulation",
    topBrokers: "RX, YU, KZ",
    summary: "Foreign institutions are actively accumulating, creating strong price floors."
  },
  peers: [
    { subject: 'ROE', BBCA: 22.5, SectorAvg: 16.2, fullMark: 25 },
    { subject: 'NPM', BBCA: 48.2, SectorAvg: 30.1, fullMark: 50 },
    { subject: 'CAR', BBCA: 28.5, SectorAvg: 22.0, fullMark: 30 },
    { subject: 'CASA', BBCA: 81.0, SectorAvg: 60.5, fullMark: 100 },
    { subject: 'Efficiency', BBCA: 85, SectorAvg: 60, fullMark: 100 },
  ],
  historicalBands: [
    { year: "2019", per: 18, pbv: 4.2 },
    { year: "2020", per: 14, pbv: 3.5 },
    { year: "2021", per: 19, pbv: 4.5 },
    { year: "2022", per: 21, pbv: 5.0 },
    { year: "2023", per: 16, pbv: 4.7 },
    { year: "2024", per: 15.2, pbv: 4.8 },
  ],
  ownership: {
    data: [
      { name: "Conglomerate", value: 54.94, color: "#FF7A00" },
      { name: "Foreign Inst.", value: 25.10, color: "#3B82F6" },
      { name: "Retail / Public", value: 19.96, color: "#10B981" },
    ],
  },
  news: [
    { id: 1, date: "2 Hrs Ago", headline: "BBCA Reports Record Breaking Q3 Loan Growth", sentiment: "Bullish", tag: "Earnings" },
    { id: 2, date: "5 Hrs Ago", headline: "Foreign Net Buy Surges on Top Big Banks", sentiment: "Bullish", tag: "Macro" },
    { id: 3, date: "1 Day Ago", headline: "BI Holds Interest Rate, Positive for Credit Demand", sentiment: "Neutral", tag: "Macro" },
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

function ResearchStudio() {
  const search = Route.useSearch();
  const [tickerInput, setTickerInput] = useState(search.q || "BBCA");
  const [data, setData] = useState<typeof mockResearchData>(mockResearchData); 
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const autoRunRef = useRef(search.auto);

  const handleGenerate = async (targetTicker?: string) => {
    const t = typeof targetTicker === 'string' ? targetTicker : tickerInput;
    if (!t.trim() || isLoading) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await generateReportFn({ data: t.toUpperCase() });
      setData(result);
    } catch (error: unknown) {
      console.error(error);
      const msg = error instanceof Error ? error.message : "Gagal menghubungi AI Server (Kemungkinan Server Google Gemini sedang sibuk/overload). Silakan coba lagi.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoRunRef.current && search.q) {
      handleGenerate(search.q);
      autoRunRef.current = false;
    }
  }, [search.q]);

  return (
    <div className="view-section animate-fade-in max-w-7xl mx-auto space-y-6 pb-12 relative">
      
      {/* LOADING OVERLAY */}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center">
          <Loader2 className="size-12 text-brand-500 animate-spin mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Multi-Agent Swarm is analyzing...</h3>
          <p className="text-gray-400 text-sm">Agent 1 fetching Sectors API data. Agent 2 running quant models.</p>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-dark-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="size-6 text-brand-500" />
            Institutional Research Studio
          </h1>
          <p className="text-gray-400 text-sm mt-1">Advanced equity analysis, quant models, and foreign flow tracking.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
          <input 
            type="text" 
            value={tickerInput}
            onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
            placeholder="Search Ticker..." 
            className="w-full bg-dark-950 border border-dark-700 rounded-lg pl-9 pr-4 py-2 text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 uppercase font-bold" 
          />
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {errorMsg && (
        <div className="bg-semantic-bear/10 border border-semantic-bear/30 rounded-lg p-4 flex items-start gap-3">
          <ShieldAlert className="size-5 text-semantic-bear shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-semantic-bear">Error Generating Report</h4>
            <p className="text-sm text-gray-300 mt-1">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* TICKER OVERVIEW BAR */}
      <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg shadow-black/20">
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
        <div className="shrink-0 ml-auto md:ml-4">
          <button 
            onClick={() => handleGenerate()}
            disabled={isLoading}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 disabled:bg-dark-800 disabled:text-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-[0_0_15px_rgba(255,122,0,0.3)]"
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            Generate AI Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: 8 cols */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. ELITE: DCF & QUANT MODELS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DCF Fair Value */}
            <div className="bg-gradient-to-br from-dark-900 to-dark-950 border border-dark-800 rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Target className="size-20" />
              </div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Target className="size-4 text-brand-500" />
                Intrinsic Value (Fair Price)
              </h3>
              <div className="flex items-end gap-3 mb-2">
                <div className="text-3xl font-black text-white">Rp {data.intrinsicValue.fairValue.toLocaleString('id-ID')}</div>
                <div className="text-sm font-bold text-semantic-bull mb-1 bg-semantic-bull/10 px-2 py-0.5 rounded border border-semantic-bull/20">
                  {data.intrinsicValue.marginOfSafety}% Discount
                </div>
              </div>
              <div className="w-full bg-dark-800 rounded-full h-2 mt-4 mb-2">
                <div className="bg-brand-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-400">Current: {data.currentPrice}</span>
                <span className="text-brand-500">Fair: {data.intrinsicValue.fairValue}</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-4 border-t border-dark-800 pt-3">
                Model: {data.intrinsicValue.model}
              </p>
            </div>

            {/* Quant Models */}
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <ShieldAlert className="size-4 text-brand-500" />
                Institutional Quant Models
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-dark-950 p-3 rounded-lg border border-dark-800">
                  <div>
                    <div className="text-sm font-bold text-gray-200">Piotroski F-Score</div>
                    <div className="text-[10px] text-gray-500">Financial Trend Strength</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-semantic-bull">{data.quantModels.piotroski.score}<span className="text-sm text-gray-500">/9</span></div>
                    <div className="text-[10px] font-bold text-semantic-bull uppercase">{data.quantModels.piotroski.interpretation}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-dark-950 p-3 rounded-lg border border-dark-800">
                  <div>
                    <div className="text-sm font-bold text-gray-200">Altman Z-Score</div>
                    <div className="text-[10px] text-gray-500">Bankruptcy Probability</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-semantic-bull">{data.quantModels.altman.score}</div>
                    <div className="text-[10px] font-bold text-semantic-bull uppercase">{data.quantModels.altman.interpretation}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. VALUATION DASHBOARD (Key Metrics) */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Activity className="size-4 text-brand-500" />
              Key Valuation Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-dark-950 border border-dark-800 rounded-lg p-3 flex flex-col justify-between hover:border-dark-700 transition-colors">
                <div className="text-xs text-gray-500 font-medium mb-1">PER (x)</div>
                <div className="text-xl font-bold text-white mb-2">{data.valuation.per.value}</div>
                <StatusBadge status={data.valuation.per.status} />
              </div>
              <div className="bg-dark-950 border border-dark-800 rounded-lg p-3 flex flex-col justify-between hover:border-dark-700 transition-colors">
                <div className="text-xs text-gray-500 font-medium mb-1">PBV (x)</div>
                <div className="text-xl font-bold text-white mb-2">{data.valuation.pbv.value}</div>
                <StatusBadge status={data.valuation.pbv.status} />
              </div>
              <div className="bg-dark-950 border border-dark-800 rounded-lg p-3 flex flex-col justify-between hover:border-dark-700 transition-colors">
                <div className="text-xs text-gray-500 font-medium mb-1">ROE (%)</div>
                <div className="text-xl font-bold text-white mb-2">{data.valuation.roe.value}%</div>
                <StatusBadge status={data.valuation.roe.status} />
              </div>
              <div className="bg-dark-950 border border-dark-800 rounded-lg p-3 flex flex-col justify-between hover:border-dark-700 transition-colors">
                <div className="text-xs text-gray-500 font-medium mb-1">Div Yield</div>
                <div className="text-xl font-bold text-white mb-2">{data.valuation.divYield.value}%</div>
                <StatusBadge status={data.valuation.divYield.status} />
              </div>
              <div className="bg-dark-950 border border-dark-800 rounded-lg p-3 flex flex-col justify-between hover:border-dark-700 transition-colors">
                <div className="text-xs text-gray-500 font-medium mb-1">DER (x)</div>
                <div className="text-xl font-bold text-white mb-2">{data.valuation.der.value}</div>
                <StatusBadge status={data.valuation.der.status} />
              </div>
            </div>
          </div>

          {/* 3. PEER COMPARISON (Radar Chart) */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Globe className="size-4 text-brand-500" />
              Sector Peer Comparison (vs Banking Average)
            </h3>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-[250px] w-full md:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.peers}>
                    <PolarGrid stroke="#27272a" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                    />
                    <Radar name={data.ticker} dataKey={data.ticker} stroke="#FF7A00" fill="#FF7A00" fillOpacity={0.4} />
                    <Radar name="Sector Avg" dataKey="SectorAvg" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 space-y-3">
                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                  <strong className="text-white">BBCA</strong> heavily outperforms the sector average in <strong className="text-brand-500">ROE</strong>, <strong className="text-brand-500">CASA Ratio</strong>, and <strong className="text-brand-500">Efficiency</strong> (BOPO), justifying its premium valuation against peers like BMRI and BBNI.
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-brand-500 rounded-sm"></div>
                  <span className="text-xs font-bold text-gray-300">{data.ticker} Metrics</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-sm opacity-60"></div>
                  <span className="text-xs font-bold text-gray-300">Sector Average</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 0. NEXUS SCORE GAUGE */}
          <div className="bg-gradient-to-b from-dark-900 to-dark-950 border border-dark-800 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <NexusScoreGauge score={data.nexusScore} />
            <p className="text-xs text-center text-gray-400 mt-4 px-2">
              Based on fundamental valuation, historical trends, and institutional ownership structure.
            </p>
          </div>

          {/* 4. FOREIGN FLOW & BANDARMOLOGI */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <ArrowRightLeft className="size-4 text-brand-500" />
              Foreign Flow & Accumulation
            </h3>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 font-medium">Status</span>
                <span className="text-xs font-bold text-semantic-bull bg-semantic-bull/10 px-2 py-0.5 rounded border border-semantic-bull/20">{data.bandarmologi.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">Top Brokers</span>
                <span className="text-xs font-bold text-white">{data.bandarmologi.topBrokers}</span>
              </div>
            </div>

            <div className="h-[120px] w-full mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.foreignFlow} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <RechartsTooltip 
                    cursor={{fill: '#27272a'}}
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="flow" radius={[4, 4, 4, 4]}>
                    {
                      data.foreignFlow.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.flow > 0 ? '#10B981' : '#F43F5E'} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="p-3 bg-brand-500/5 border border-brand-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Briefcase className="size-4 text-brand-500 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400 leading-relaxed">
                  <strong className="text-gray-200">AI Insight:</strong> {data.bandarmologi.summary}
                </p>
              </div>
            </div>
          </div>

          {/* 5. OWNERSHIP STRUCTURE */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <PieChartIcon className="size-4 text-brand-500" />
              Ownership Structure
            </h3>
            
            <div className="flex justify-center mb-2">
              <div className="h-[160px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.ownership.data}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {data.ownership.data.map((entry, index) => (
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

            <div className="space-y-2">
              {data.ownership.data.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-300">{item.name}</span>
                  </div>
                  <span className="font-bold text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
