import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { 
  BarChart2, 
  Search, 
  Activity,
  Globe,
  PieChart as PieChartIcon,
  ShieldAlert,
  Target,
  ArrowRightLeft,
  Briefcase,
  Download,
  BrainCircuit,
  FileText,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Leaf,
  Newspaper,
  Users,
  BarChart3,
  Scale,
  Ticket,
  Calendar
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
  Bar,
} from "recharts";
import { NexusScoreGauge } from "@/components/nexus-score-gauge";
import { Sparkles, Loader2 } from "lucide-react";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { AddToWatchlistButton } from "@/components/add-to-watchlist-button";
import { Badge } from "@/components/ui/badge";

const generateReportFn = createServerFn({ method: 'POST' })
  .validator((ticker: string) => ticker)
  .handler(async ({ data }) => {
    const [{ getSession }, { consumeCredit, refundCredit }, { generateResearchReport }] =
      await Promise.all([
        import("@/lib/session.server"),
        import("@/services/credit.service.server"),
        import("@/services/research.service.server"),
      ]);
    const session = await getSession(
      getRequestHeaders() as unknown as Headers,
    );
    if (!session) throw new Error("Unauthorized");
    const credits = await consumeCredit(session.user.id);
    try {
      const report = await generateResearchReport(data, session.user.id);
      return { report, credits };
    } catch (error) {
      await refundCredit(session.user.id);
      throw error;
    }
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
// INSTITUTIONAL MOCK DATA (Enhanced)
// ==========================================
const mockResearchData = {
  ticker: "BBCA",
  companyName: "PT Bank Central Asia Tbk",
  sector: "Financials",
  subsector: "Banks",
  exchange: "Main Board · IDX",
  currentPrice: 6250,
  previousClose: 6225,
  priceChange: "+25 (+0.40%)",
  priceChangePercent: 0.40,
  nexusScore: 82,
  valuation: {
    per: { value: 13.26, sectorAvg: 8.93, status: "Overvalued", threshold: "Sector avg 8.93x" },
    pbv: { value: 2.82, sectorAvg: 0.78, status: "Overvalued", threshold: "Sector avg 0.78x" },
    roe: { value: 22.5, sectorAvg: 16.2, status: "Healthy", threshold: "> 15% is Healthy" },
    divYield: { value: 6.10, sectorAvg: 4.94, status: "Healthy", threshold: "> 4% is High" },
    der: { value: 0.15, sectorAvg: 0.85, status: "Undervalued", threshold: "< 1 is Healthy" },
    ps: { value: 6.68, sectorAvg: 2.51, status: "Overvalued", threshold: "Sector avg 2.51x" },
    pcf: { value: 11.08, sectorAvg: 5.5, status: "Overvalued", threshold: "Sector avg 5.5x" },
    forwardPE: { value: 12.95, status: "Healthy", threshold: "Forward looking" },
  },
  priceRange: {
    low52w: 4820,
    high52w: 8750,
    low52wDate: "2026-06-09",
    high52wDate: "2025-10-30",
    allTimeHigh: 10950,
    allTimeHighDate: "2024-09-23",
    ytdHigh: 8175,
    ytdLow: 4820,
  },
  quantModels: {
    piotroski: { score: 8, max: 9, interpretation: "Exceptional Health", color: "text-semantic-bull" },
    altman: { score: 3.8, interpretation: "Safe Zone", color: "text-semantic-bull" }
  },
  intrinsicValue: {
    fairValue: 11500,
    marginOfSafety: 14.7, 
    model: "10Y Discounted Cash Flow",
    dcf: 9987,
    relative: 3573,
    ddm: 8447,
  },
  esgScore: {
    total: 21.71,
    rating: "Top ESG Performer",
    environmental: 18.5,
    social: 22.3,
    governance: 24.4,
  },
  foreignFlow: [
    { date: "D-4", flow: 150 },
    { date: "D-3", flow: -45 },
    { date: "D-2", flow: 320 },
    { date: "D-1", flow: 850 },
    { date: "Today", flow: 1200 },
  ],
  institutionalFlows: [
    { name: "Vanguard", change: 61979185 },
    { name: "Strategic Advisers LLC", change: 45428500 },
    { name: "BlackRock Fund Advisors", change: 23410540 },
    { name: "T. Rowe Price", change: -173075700 },
    { name: "Capital Research & Mgmt.", change: -203655628 },
    { name: "Fidelity Mgmt. & Research", change: -490522692 },
  ],
  bandarmologi: {
    status: "Massive Accumulation",
    topBrokers: "RX, YU, KZ",
    summary: "Foreign institutions are actively accumulating, creating strong price floors."
  },
  aiAnalysis: {
    executiveSummary: "BBCA remains a strong buy due to its unyielding CASA ratio, aggressive foreign accumulation, and resilient margins amidst macro headwinds. The stock trades at a premium but is justified by its fortress balance sheet.",
    fundamentalDeepDive: "The company's core earnings have grown steadily by 12% YoY, supported by loan growth in the corporate and consumer segments. Net Interest Margin (NIM) stands strong at 5.5%, benefiting from a low cost of funds (CASA ratio > 80%). The NPL ratio is well-maintained below 1.5%, showcasing prudent risk management.",
    technicalOutlook: "The stock has successfully broken out of its multi-month consolidation phase at 9,500. Accumulation by foreign brokers (KZ, YU, RX) over the past week indicates strong institutional backing. Immediate resistance is seen at 10,200, with strong support at 9,450.",
    riskFactors: [
      "Unexpected BI rate hikes increasing cost of funds.",
      "Deterioration in asset quality if macroeconomic conditions worsen.",
      "High foreign ownership makes it susceptible to global capital flight."
    ]
  },
  peers: [
    { subject: 'Value', BBCA: 67, SectorAvg: 50, fullMark: 100 },
    { subject: 'Growth', BBCA: 75, SectorAvg: 55, fullMark: 100 },
    { subject: 'Health', BBCA: 90, SectorAvg: 65, fullMark: 100 },
    { subject: 'Dividend', BBCA: 72, SectorAvg: 60, fullMark: 100 },
    { subject: 'Momentum', BBCA: 58, SectorAvg: 45, fullMark: 100 },
  ],
  peerComparison: [
    { ticker: "BBCA", name: "Bank Central Asia", perf12m: -22.19, marketCapFrom: 976.34, marketCapTo: 759.71, isSubject: true },
    { ticker: "BBRI", name: "Bank Rakyat Indonesia", perf12m: -21.11, marketCapFrom: 597.17, marketCapTo: 471.14, isSubject: false },
    { ticker: "BMRI", name: "Bank Mandiri", perf12m: -11.52, marketCapFrom: 425.04, marketCapTo: 376.07, isSubject: false },
    { ticker: "BBNI", name: "Bank Negara Indonesia", perf12m: -18.52, marketCapFrom: 159.51, marketCapTo: 129.97, isSubject: false },
    { ticker: "BRIS", name: "Bank Syariah Indonesia", perf12m: -42.01, marketCapFrom: 122.85, marketCapTo: 71.24, isSubject: false },
    { ticker: "MEGA", name: "Bank Mega", perf12m: 17.52, marketCapFrom: 38.47, marketCapTo: 45.22, isSubject: false },
    { ticker: "BNGA", name: "Bank CIMB Niaga", perf12m: 1.76, marketCapFrom: 42.31, marketCapTo: 43.06, isSubject: false },
    { ticker: "BDMN", name: "Bank Danamon", perf12m: 77.91, marketCapFrom: 24.09, marketCapTo: 42.86, isSubject: false },
  ],
  ownership: {
    data: [
      { name: "PT Dwimuria Investama Andalan", value: 54.94, color: "#FF7A00" },
      { name: "Foreign Institutional", value: 25.10, color: "#3B82F6" },
      { name: "Retail / Public Float", value: 19.96, color: "#10B981" },
    ],
  },
  faqInsights: [
    {
      question: "What are the insiders doing with BBCA?",
      iconName: "Briefcase",
      title: "Insiders and institutional owners have recently made significant moves",
      content: "BBCA has made 10 recent IDX filings, which are disclosures of significant events that have a material impact on the company's financial conditions or ownership structure, such as insider trading activity. The largest shareholder of BBCA is PT Dwimuria Investama Andalan with 54.94% ownership, which is significant enough to influence the company's strategic decisions.",
    },
    {
      question: "What should I know about BBCA market capitalization?",
      iconName: "BarChart3",
      title: "BBCA is a top 30 market cap stock",
      content: "Stocks of Bank Central Asia is among the top 30 stocks by market capitalization on the Indonesian Stock Exchange (IDX), making it a large-cap stock. Being a large-cap stock, BBCA is generally considered to be more stable and less volatile than smaller companies, making it a popular choice for conservative investors.",
    },
    {
      question: "Does BBCA pay dividends?",
      iconName: "Ticket",
      title: "BBCA is a dividend paying stock with a yield of 6.10%",
      content: "BBCA has a trailing twelve months (TTM) dividend yield of 6.10% (amounting to a total of IDR 381), indicating that the company is returning value to its shareholders through dividends. The dividend yield is computed based on the last closing price of IDR 6,250.",
    },
    {
      question: "What about BBCA's trading activity and liquidity?",
      iconName: "Activity",
      title: "BBCA is a top 30 traded stock on the IDX",
      content: "BBCA is among the top 30 stocks by transaction value on the IDX in the last 90 days, indicating strong investor interest and liquidity. The public float of BBCA is 44.64%, which is considered healthy for a stock of Bank Central Asia's size.",
    },
    {
      question: "Would BBCA be good for ESG-conscious investors?",
      iconName: "Leaf",
      title: "BBCA is a top ESG performer",
      content: "BBCA has an ESG score of 21.71 (the lower, the better), putting it above most companies on the Indonesia Stock Exchange on the Environmental, Social & Governance scale. This means that BBCA is committed to sustainable practices in its operations and is a leader in its corporate social responsibility.",
    },
  ],
  news: [
    { id: 1, date: "Sep 26, 2026", headline: "Bank Central Asia stock again draws investor focus", summary: "PT Bank Central Asia Tbk (BBCA) saw a foreign net buy of Rp 103.17 billion on 25 September 2026, lifting the share price 0.40% to Rp 6,250.", sentiment: "Bullish", tags: ["Analyst Ratings", "Bullish"] },
    { id: 2, date: "Sep 24, 2026", headline: "BRI Danareksa recommends buy for major Indonesian banks amid retail credit pressure", summary: "BRI Danareksa Sekuritas maintains buy recommendations for BBCA with a target price of Rp 8,600.", sentiment: "Bullish", tags: ["Analyst Ratings", "Credit", "Financial Metrics"] },
    { id: 3, date: "Sep 22, 2026", headline: "PT Bank Aladin Syariah strengthens its Islamic digital ecosystem", summary: "The broader banking sector sees continued innovation in digital banking services.", sentiment: "Neutral", tags: ["Digital Banking", "Industry"] },
  ]
};

// ==========================================
// HELPER COMPONENTS
// ==========================================

// Feature 2: Valuation Marker Bar
function MarkerBar({ value, min, max, sectorAvg, label }: { value: number; min: number; max: number; sectorAvg?: number; label: string }) {
  const range = max - min;
  const valuePos = Math.max(0, Math.min(100, ((value - min) / range) * 100));
  const avgPos = sectorAvg ? Math.max(0, Math.min(100, ((sectorAvg - min) / range) * 100)) : null;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
        <span className="text-lg font-black text-white">{value}x</span>
      </div>
      <div className="relative w-full h-2.5 bg-dark-800 rounded-full overflow-visible">
        {/* Sector Average Range */}
        {avgPos !== null && (
          <div 
            className="absolute h-full bg-gray-600/40 rounded-full" 
            style={{ left: `${Math.max(0, avgPos - 10)}%`, width: `${Math.min(20, 100 - Math.max(0, avgPos - 10))}%` }}
          />
        )}
        {/* Current Value Marker */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-5 bg-brand-500 rounded-full shadow-[0_0_8px_rgba(255,122,0,0.6)] z-10"
          style={{ left: `${valuePos}%` }}
        />
        {/* Sector Avg Marker */}
        {avgPos !== null && (
          <div 
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1 h-4 bg-blue-500/60 rounded-full"
            style={{ left: `${avgPos}%` }}
          />
        )}
      </div>
      <div className="flex justify-between text-[10px] text-gray-500">
        <span>{min}x</span>
        {sectorAvg && <span className="text-blue-400">Sector: {sectorAvg}x</span>}
        <span>{max}x</span>
      </div>
    </div>
  );
}

// Feature 4: Peer Delta Bar
function DeltaBar({ value }: { value: number }) {
  const absValue = Math.abs(value);
  const maxWidth = Math.min(absValue, 100);
  
  return (
    <div className="flex items-center gap-2 w-full">
      <span className={`font-bold text-sm w-16 text-right shrink-0 ${value >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
        {value >= 0 ? '+' : ''}{value.toFixed(1)}%
      </span>
      <div className="flex-1 h-2 bg-dark-800 rounded-full relative overflow-hidden">
        <div className="absolute inset-0 flex">
          <div className="w-1/2 flex justify-end">
            {value < 0 && (
              <div 
                className="h-full bg-rose-500 rounded-l-full"
                style={{ width: `${maxWidth}%` }}
              />
            )}
          </div>
          <div className="w-px bg-gray-500 h-full z-10" />
          <div className="w-1/2">
            {value >= 0 && (
              <div 
                className="h-full bg-emerald-500 rounded-r-full"
                style={{ width: `${maxWidth}%` }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Feature 6: 52-Week Price Range Bar
function PriceRangeBar({ low, high, current }: { low: number; high: number; current: number }) {
  const range = high - low;
  const position = ((current - low) / range) * 100;
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">52 Week Low</p>
          <p className="text-sm font-bold text-gray-300">IDR {low.toLocaleString('id-ID')}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">52 Week High</p>
          <p className="text-sm font-bold text-gray-300">IDR {high.toLocaleString('id-ID')}</p>
        </div>
      </div>
      <div className="relative w-full h-2.5 bg-dark-800 rounded-full">
        {/* Traded range (middle 60%) */}
        <div 
          className="absolute h-full bg-gray-600/50 rounded-full"
          style={{ left: '30%', width: '40%' }}
        />
        {/* Current price marker */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
          style={{ left: `${position}%` }}
        >
          <div className="w-1.5 h-5 bg-brand-500 rounded-full ring-2 ring-brand-500/30 shadow-[0_0_10px_rgba(255,122,0,0.5)]" />
        </div>
      </div>
      <p className="text-xs text-gray-500 text-center font-medium mt-3">
        Current: <span className="text-white font-bold">IDR {current.toLocaleString('id-ID')}</span>
        <span className="text-gray-600 mx-1">·</span>
        <span className="text-brand-500 font-bold">{((high - current) / high * 100).toFixed(1)}% off 52w high</span>
      </p>
    </div>
  );
}

// Feature 5: FAQ Accordion Item
import { HelpCircle } from "lucide-react";

function FaqAccordionItem({ question, iconName, title, content, isOpen, onToggle }: {
  question: string;
  iconName?: string;
  title: string;
  content: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const icons: Record<string, React.ElementType> = {
    'Briefcase': Briefcase,
    'BarChart3': BarChart3,
    'Ticket': Ticket,
    'Activity': Activity,
    'Leaf': Leaf,
  };
  const Icon = (iconName && icons[iconName]) ? icons[iconName] : HelpCircle;

  return (
    <div className="border-b border-dark-800 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-4 px-4 text-left text-sm font-medium text-white light:text-gray-700 light:hover:text-gray-900 transition-colors group"
      >
        <span className={`transition-colors ${isOpen ? 'text-white light:text-gray-900' : ''}`}>{question}</span>
        <ChevronDown className={`size-4 shrink-0 text-white light:text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-500' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-5 animate-in slide-in-from-top-2 duration-200">
          <h4 className="text-sm font-bold text-white light:text-gray-900 flex items-center gap-2 mb-2">
            <Icon className="size-4 text-brand-500" />
            {title}
          </h4>
          <p className="text-sm text-white light:text-gray-700 font-medium leading-relaxed">{content}</p>
        </div>
      )}
    </div>
  );
}

// Feature 9: ESG Score Ring
function EsgScoreRing({ score, label }: { score: number; label: string }) {
  // Lower is better: 0-20 = excellent, 20-30 = good, 30-40 = average, 40+ = poor
  const percentage = Math.max(0, 100 - score * 2);
  const color = score < 20 ? '#10B981' : score < 30 ? '#22c55e' : score < 40 ? '#eab308' : '#f43f5e';
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#1a1a1f"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${percentage}, 100`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-black text-white">{score}</span>
        </div>
      </div>
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-2">{label}</span>
    </div>
  );
}


// ==========================================
// AI SYNTHESIS PANEL (Kept from original)
// ==========================================
type AiAnalysis = {
  executiveSummary: string;
  fundamentalDeepDive: string;
  technicalOutlook: string;
  riskFactors: string[];
};

const AI_SECTIONS = [
  {
    id: "thesis",
    label: "Investment Thesis",
    icon: Sparkles,
    color: "text-brand-500",
    activeColor: "border-brand-500",
    bgActive: "bg-brand-500/10",
    getContent: (a: AiAnalysis) => a.executiveSummary,
    getSnippet: (a: AiAnalysis) => a.executiveSummary.substring(0, 60) + "...",
  },
  {
    id: "fundamentals",
    label: "Fundamentals",
    icon: FileText,
    color: "text-blue-400",
    activeColor: "border-blue-400",
    bgActive: "bg-blue-400/5",
    getContent: (a: AiAnalysis) => a.fundamentalDeepDive,
    getSnippet: (a: AiAnalysis) => a.fundamentalDeepDive.substring(0, 60) + "...",
  },
  {
    id: "technical",
    label: "Technical Flow",
    icon: BrainCircuit,
    color: "text-purple-400",
    activeColor: "border-purple-400",
    bgActive: "bg-purple-400/5",
    getContent: (a: AiAnalysis) => a.technicalOutlook,
    getSnippet: (a: AiAnalysis) => a.technicalOutlook.substring(0, 60) + "...",
  },
  {
    id: "risks",
    label: "Risks & Tailwinds",
    icon: AlertTriangle,
    color: "text-semantic-bear",
    activeColor: "border-semantic-bear",
    bgActive: "bg-semantic-bear/5",
    getContent: (a: AiAnalysis) => a.riskFactors.join(" • "),
    getSnippet: (a: AiAnalysis) => (a.riskFactors[0] || "").substring(0, 60) + "...",
  },
];

function AiSynthesisPanel({ aiAnalysis, ticker }: { aiAnalysis: AiAnalysis; ticker: string }) {
  const [activeId, setActiveId] = useState("thesis");
  const [animating, setAnimating] = useState(false);

  const handleSelect = (id: string) => {
    if (id === activeId) return;
    setAnimating(true);
    setTimeout(() => {
      setActiveId(id);
      setAnimating(false);
    }, 180);
  };

  const activeSection = AI_SECTIONS.find((s) => s.id === activeId)!;
  const ActiveIcon = activeSection.icon;

  return (
    <div className="border-t border-dark-800 pt-8 pb-2 print-mb">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs font-bold text-white light:text-gray-900 uppercase tracking-widest">AI Synthesis &amp; Deep Dive</h2>
        <span className="text-[10px] font-bold text-brand-500 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded uppercase tracking-widest">
          {ticker} · AI Orchestrator
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-0 rounded-xl overflow-hidden border border-dark-800">
        {/* LEFT: Navigation List */}
        <div className="md:col-span-4 bg-dark-950 border-r border-dark-800">
          {AI_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = section.id === activeId;
            return (
              <button
                key={section.id}
                onClick={() => handleSelect(section.id)}
                className={`w-full text-left p-4 border-b border-dark-800 last:border-b-0 transition-all duration-200 group flex items-start gap-3 relative ${isActive ? `${section.bgActive} border-l-2 ${section.activeColor}` : "hover:bg-dark-900 border-l-2 border-transparent"}`}
              >
                <Icon className={`size-4 mt-0.5 shrink-0 transition-colors ${isActive ? section.color : "text-gray-600 group-hover:text-gray-400"}`} />
                <div className="min-w-0 flex-1">
                  <p className={`text-[11px] font-bold uppercase tracking-widest mb-1 transition-colors ${isActive ? section.color : "text-gray-500 group-hover:text-gray-300"}`}>
                    {section.label}
                  </p>
                  <p className="text-[12px] text-white light:text-gray-700 light:group-hover:text-gray-800 truncate font-light transition-colors leading-relaxed">
                    {section.getSnippet(aiAnalysis)}
                  </p>
                </div>
                {isActive && <ChevronRight className={`size-3.5 shrink-0 mt-0.5 ${section.color}`} />}
              </button>
            );
          })}
        </div>

        {/* RIGHT: Content Pane */}
        <div className="md:col-span-8 bg-dark-900 p-8 flex flex-col justify-start min-h-[280px]">
          <div className={`transition-opacity duration-200 ${animating ? "opacity-0" : "opacity-100"}`}>
            <div className="flex items-center gap-2 mb-5">
              <ActiveIcon className={`size-4 ${activeSection.color}`} />
              <h3 className={`text-xs font-bold uppercase tracking-widest ${activeSection.color}`}>
                {activeSection.label}
              </h3>
            </div>

            {activeId === "risks" ? (
              <ul className="space-y-3">
                {aiAnalysis.riskFactors.map((risk, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-semantic-bear mt-1.5 text-xs">•</span>
                    <p className="text-[15px] text-white light:text-gray-800 leading-relaxed font-light">{risk}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[16px] text-white light:text-gray-800 leading-loose font-light">
                {activeSection.getContent(aiAnalysis)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// ==========================================
// MAIN COMPONENT
// ==========================================
function ResearchStudio() {
  const search = Route.useSearch();
  const [tickerInput, setTickerInput] = useState(search.q || "BBCA");
  const [data, setData] = useState<typeof mockResearchData>(mockResearchData); 
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const autoRunRef = useRef(search.auto);

  const handleGenerate = useCallback(async (targetTicker?: string) => {
    const t = typeof targetTicker === 'string' ? targetTicker : tickerInput;
    if (!t.trim() || isLoading) return;
    setIsLoading(true);
    setLoadingStep(1);
    setErrorMsg(null);

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 2000);

    try {
      const { report } = await generateReportFn({
        data: t.toUpperCase(),
      });
      setData(report);
      window.dispatchEvent(new Event("nexus:credits-updated"));
    } catch (error: unknown) {
      console.error(error);
      const msg = error instanceof Error ? error.message : "Gagal menghubungi AI Server (Kemungkinan Server Google Gemini sedang sibuk/overload). Silakan coba lagi.";
      setErrorMsg(msg);
    } finally {
      clearInterval(stepInterval);
      setIsLoading(false);
      setLoadingStep(0);
    }
  }, [isLoading, tickerInput]);

  useEffect(() => {
    if (autoRunRef.current && search.q) {
      handleGenerate(search.q);
      autoRunRef.current = false;
    }
  }, [handleGenerate, search.q]);

  // Feature 3: Process institutional flows for the chart
  const maxAbsFlow = Math.max(...data.institutionalFlows.map(f => Math.abs(f.change)));

  return (
    <div className="view-section animate-fade-in max-w-7xl mx-auto space-y-6 pb-12 relative print:bg-black print:text-white print:m-0 print:p-0">
      
      {/* PRINT STYLES */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4; margin: 10mm; }
          html, body, #root, [class*="h-screen"], [class*="overflow-hidden"], [class*="overflow-y-auto"] {
            height: auto !important; min-height: auto !important; max-height: none !important; overflow: visible !important; position: static !important;
          }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #000 !important; color: #fff !important; }
          aside, nav, header, .no-print { display: none !important; }
          .print-break-inside-avoid { break-inside: avoid; }
          .print-mb { margin-bottom: 20px !important; }
        }
      `}} />

      {/* PRINT ONLY HEADER */}
      <div className="hidden print:flex justify-between items-end border-b border-dark-700 pb-4 mb-4">
        <div>
          <h1 className="text-2xl font-black text-white">NEXUS<span className="text-brand-500">CAPITAL</span></h1>
          <p className="text-xs font-bold text-gray-400 mt-1">CONFIDENTIAL • INSTITUTIONAL RESEARCH REPORT</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-gray-400">Date: {new Date().toLocaleDateString('en-GB')}</p>
          <p className="text-xs font-bold text-brand-500">AI Orchestrator Engine v2.0</p>
        </div>
      </div>
      
      {/* LOADING OVERLAY */}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-background/90 backdrop-blur-md rounded-xl flex flex-col items-center justify-center border border-brand-500/20 shadow-[0_0_50px_rgba(255,122,0,0.15)]">
          <Loader2 className="size-14 text-brand-500 animate-spin mb-6 shadow-[0_0_15px_rgba(255,122,0,0.5)] rounded-full" />
          <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-wider">Multi-Agent Swarm Active</h3>
          <div className="w-80 space-y-3">
            <div className={`flex items-center gap-3 p-3 rounded-lg border ${loadingStep >= 1 ? 'bg-semantic-bull/10 border-semantic-bull/30' : 'bg-dark-900 border-dark-800 opacity-50'} transition-all duration-500`}>
              <div className={`w-2 h-2 rounded-full ${loadingStep >= 1 ? 'bg-semantic-bull shadow-[0_0_10px_#10B981] animate-pulse' : 'bg-gray-600'}`}></div>
              <p className="text-sm font-medium text-gray-200">Agent 1: Extracting Sectors API Data</p>
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-lg border ${loadingStep >= 2 ? 'bg-blue-500/10 border-blue-500/30' : 'bg-dark-900 border-dark-800 opacity-50'} transition-all duration-500`}>
              <div className={`w-2 h-2 rounded-full ${loadingStep >= 2 ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-pulse' : 'bg-gray-600'}`}></div>
              <p className="text-sm font-medium text-gray-200">Agent 2: Running Quant & Peer Analysis</p>
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-lg border ${loadingStep >= 3 ? 'bg-brand-500/10 border-brand-500/30' : 'bg-dark-900 border-dark-800 opacity-50'} transition-all duration-500`}>
              <div className={`w-2 h-2 rounded-full ${loadingStep >= 3 ? 'bg-brand-500 shadow-[0_0_10px_#FF7A00] animate-pulse' : 'bg-gray-600'}`}></div>
              <p className="text-sm font-medium text-gray-200">Orchestrator: Synthesizing Nexus Score</p>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-dark-800 pb-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="size-6 text-brand-500" />
            Research Studio
          </h1>
          <p className="text-gray-400 text-sm mt-1">Analisis ekuitas tingkat lanjut, model kuantitatif, dan pelacakan aliran dana asing.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
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
          <button 
            onClick={() => window.print()} 
            className="flex items-center justify-center gap-2 bg-dark-800 hover:bg-dark-700 text-white font-bold py-2 px-4 rounded-lg border border-dark-600 transition-colors shrink-0"
          >
            <Download className="size-4" /> Export PDF
          </button>
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
      <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg shadow-black/20 print-break-inside-avoid">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-white tracking-tight">{data.ticker}</h2>
            <span className="text-xs font-medium px-2 py-1 bg-dark-800 text-gray-300 rounded border border-dark-700">{data.sector}</span>
            <span className="text-xs font-medium px-2 py-1 bg-dark-800 text-gray-300 rounded border border-dark-700">{data.subsector}</span>
          </div>
          <p className="text-sm text-gray-400 font-medium mt-1">{data.companyName} · {data.exchange}</p>
        </div>
        <div className="text-left md:text-right">
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-gray-500">IDR</span>
            <div className="text-3xl font-bold text-white">{data.currentPrice.toLocaleString("id-ID")}</div>
            <span className={`text-sm font-bold ${data.priceChangePercent >= 0 ? 'text-semantic-bull' : 'text-semantic-bear'}`}>
              {data.priceChangePercent >= 0 ? '+' : ''}{data.priceChangePercent}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Closing Price on {new Date().toLocaleDateString('en-GB')}</p>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row ml-auto md:ml-4 no-print">
          <AddToWatchlistButton
            symbol={data.ticker}
            companyName={data.companyName}
            currentPrice={data.currentPrice}
          />
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

      {/* AI SYNTHESIS PANEL */}
      {data.aiAnalysis && (
        <AiSynthesisPanel aiAnalysis={data.aiAnalysis} ticker={data.ticker} />
      )}

      {/* ====== MAIN GRID: 2 COLUMNS ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: 8 cols */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* ROW 1: DCF + Quant Models */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-break-inside-avoid">
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
                <div className="bg-brand-500 h-2 rounded-full" style={{ width: `${(data.currentPrice / data.intrinsicValue.fairValue) * 100}%` }}></div>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-400">Current: {data.currentPrice.toLocaleString('id-ID')}</span>
                <span className="text-brand-500">Fair: {data.intrinsicValue.fairValue.toLocaleString('id-ID')}</span>
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
                    <div className="text-sm font-bold text-white light:text-gray-900">Piotroski F-Score</div>
                    <div className="text-[10px] text-white light:text-gray-700">Financial Trend Strength</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-semantic-bull">{data.quantModels.piotroski.score}<span className="text-sm text-white light:text-gray-700">/9</span></div>
                    <div className="text-[10px] font-bold text-semantic-bull uppercase">{data.quantModels.piotroski.interpretation}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-dark-950 p-3 rounded-lg border border-dark-800">
                  <div>
                    <div className="text-sm font-bold text-white light:text-gray-900">Altman Z-Score</div>
                    <div className="text-[10px] text-white light:text-gray-700">Bankruptcy Probability</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-semantic-bull">{data.quantModels.altman.score}</div>
                    <div className="text-[10px] font-bold text-semantic-bull uppercase">{data.quantModels.altman.interpretation}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 2: FEATURE 2 - VALUATION MARKER BARS */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 print-break-inside-avoid">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Scale className="size-4 text-brand-500" />
                Valuation vs Sector Peers
              </h3>
              <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-[10px] font-bold uppercase">Overvalued by P/E</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MarkerBar label="Price to Earnings" value={data.valuation.per.value} min={0} max={30} sectorAvg={data.valuation.per.sectorAvg} />
              <MarkerBar label="Price to Book" value={data.valuation.pbv.value} min={0} max={6} sectorAvg={data.valuation.pbv.sectorAvg} />
              <MarkerBar label="Price to Sales" value={data.valuation.ps.value} min={0} max={12} sectorAvg={data.valuation.ps.sectorAvg} />
            </div>
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-dark-800">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-brand-500 rounded-full"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">{data.ticker}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-3 bg-blue-500/60 rounded-full"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Sector Average</span>
              </div>
            </div>
          </div>

          {/* ROW 3: FEATURE 7 - INTRINSIC VALUE ESTIMATES */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 print-break-inside-avoid">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Target className="size-4 text-brand-500" />
              Intrinsic Value Estimates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'DCF Value', value: data.intrinsicValue.dcf, desc: 'Discounted Cash Flow' },
                { label: 'DDM Value', value: data.intrinsicValue.ddm, desc: 'Dividend Discount Model' },
                { label: 'Relative Value', value: data.intrinsicValue.relative, desc: 'Peer Comparison' },
              ].map((item) => {
                const upside = ((item.value - data.currentPrice) / data.currentPrice * 100);
                return (
                  <div key={item.label} className="bg-dark-950 border border-dark-800 rounded-lg p-4 hover:border-dark-700 transition-colors group">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-2xl font-black text-white mb-1">IDR {item.value.toLocaleString('id-ID')}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${upside >= 0 ? 'text-semantic-bull' : 'text-semantic-bear'}`}>
                        {upside >= 0 ? '▲' : '▼'} {Math.abs(upside).toFixed(1)}% {upside >= 0 ? 'upside' : 'downside'}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-600 mt-2">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ROW 4: FEATURE 1 - RADAR CHART */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 print-break-inside-avoid">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Globe className="size-4 text-brand-500" />
              Stock DNA: Multi-Dimensional Analysis
            </h3>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-[280px] w-full md:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.peers}>
                    <PolarGrid stroke="#27272a" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 'bold' }} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                    />
                    <Radar name={data.ticker} dataKey={data.ticker} stroke="#FF7A00" fill="#FF7A00" fillOpacity={0.4} />
                    <Radar name="Sector Avg" dataKey="SectorAvg" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 space-y-3">
                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                  <strong className="text-white">{data.ticker}</strong> scores highest on <strong className="text-brand-500">Health</strong> and <strong className="text-brand-500">Growth</strong>, outperforming the sector average significantly. Its <strong className="text-brand-500">Momentum</strong> score reflects recent price weakness due to broader market selloff.
                </p>
                <div className="space-y-2">
                  {data.peers.map((p) => (
                    <div key={p.subject} className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-400 w-20">{p.subject}</span>
                      <div className="flex-1 mx-3 h-1.5 bg-dark-800 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500/70 rounded-full" style={{ width: `${p.BBCA}%` }} />
                      </div>
                      <span className="text-xs font-bold text-white w-8 text-right">{p.BBCA}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 pt-3">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-brand-500 rounded-sm"></div><span className="text-[10px] font-bold text-gray-400">{data.ticker}</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-sm opacity-60"></div><span className="text-[10px] font-bold text-gray-400">Sector Avg</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 5: FEATURE 3 - INSTITUTIONAL FUND FLOWS */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 print-break-inside-avoid">
            <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
              <Users className="size-4 text-brand-500" />
              Institutional Fund Flows
            </h3>
            <p className="text-xs text-gray-500 mb-5">Net ownership change in {data.ticker} by large institutions in Q3 2026.</p>
            
            <div className="space-y-3">
              {data.institutionalFlows
                .sort((a, b) => b.change - a.change)
                .map((flow) => {
                  const barWidth = (Math.abs(flow.change) / maxAbsFlow) * 100;
                  const isBuyer = flow.change > 0;
                  return (
                    <div key={flow.name} className="flex items-center gap-3 group hover:bg-dark-800/30 p-2 rounded-lg transition-colors">
                      <span className="text-xs font-medium text-gray-300 w-44 shrink-0 truncate group-hover:text-white transition-colors">{flow.name}</span>
                      <div className="flex-1 flex items-center">
                        {!isBuyer && (
                          <div className="flex-1 flex justify-end">
                            <div 
                              className="h-6 bg-rose-500/30 border border-rose-500/40 rounded-l-md group-hover:bg-rose-500/50 transition-colors" 
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        )}
                        <div className="w-px h-8 bg-gray-600 shrink-0" />
                        {isBuyer && (
                          <div className="flex-1">
                            <div 
                              className="h-6 bg-emerald-500/30 border border-emerald-500/40 rounded-r-md group-hover:bg-emerald-500/50 transition-colors" 
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        )}
                      </div>
                      <span className={`text-xs font-bold w-20 text-right shrink-0 ${isBuyer ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isBuyer ? '+' : ''}{(flow.change / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  );
                })}
            </div>
            
            <div className="flex items-center gap-6 mt-4 pt-3 border-t border-dark-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500/50 rounded-sm border border-emerald-500/40"></div>
                <span className="text-[10px] font-bold text-gray-400">Institutional Buyer</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-rose-500/50 rounded-sm border border-rose-500/40"></div>
                <span className="text-[10px] font-bold text-gray-400">Institutional Seller</span>
              </div>
            </div>
          </div>

          {/* ROW 6: FEATURE 4 - PEER COMPARISON TABLE */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 print-break-inside-avoid">
            <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
              <ArrowRightLeft className="size-4 text-brand-500" />
              Peer Comparison — 12 Month Performance
            </h3>
            <p className="text-xs text-gray-500 mb-4">Comparing {data.ticker} against its peers in the {data.subsector} sector.</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-brand-500/30">
                    <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider pb-3 pr-4">Company</th>
                    <th className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider pb-3 px-2">12M Change</th>
                    <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-wider pb-3 pl-4">Market Cap (T IDR)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.peerComparison.map((peer) => (
                    <tr 
                      key={peer.ticker}
                      className={`border-b border-dark-800 hover:bg-dark-800/30 transition-colors ${peer.isSubject ? 'border-l-2 border-l-brand-500 bg-brand-500/5' : ''}`}
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${peer.isSubject ? 'text-brand-500' : 'text-white'}`}>{peer.ticker}</span>
                          <span className="text-xs text-gray-500 hidden md:inline">{peer.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <DeltaBar value={peer.perf12m} />
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <div className={`text-xs font-bold ${peer.marketCapTo < peer.marketCapFrom ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {peer.marketCapFrom.toFixed(1)}T → <span className="text-white">{peer.marketCapTo.toFixed(1)}T</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ROW 7: FEATURE 5 - FAQ ACCORDION */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden print-break-inside-avoid">
            <div className="p-5 border-b border-dark-800">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Sparkles className="size-4 text-brand-500" />
                Buying shares of {data.ticker}?
              </h3>
              <p className="text-xs text-gray-500 mt-1">What investors of {data.companyName} should know before investing.</p>
            </div>
            <div>
              {data.faqInsights.map((faq, idx) => (
                <FaqAccordionItem
                  key={idx}
                  question={faq.question}
                  iconName={faq.iconName}
                  title={faq.title}
                  content={faq.content}
                  isOpen={openFaqIndex === idx}
                  onToggle={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                />
              ))}
            </div>
          </div>

          {/* ROW 8: FEATURE 10 - SENTIMENT-TAGGED NEWS */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 print-break-inside-avoid">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Newspaper className="size-4 text-brand-500" />
              Related News & Sentiment
            </h3>
            <div className="space-y-4">
              {data.news.map((item) => (
                <div key={item.id} className="border-b border-dark-800 last:border-b-0 pb-4 last:pb-0 group">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                    <Calendar className="size-3" />
                    {item.date}
                  </p>
                  <h4 className="text-sm font-medium text-gray-200 group-hover:text-brand-400 transition-colors cursor-pointer mb-2">{item.headline}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">{item.summary}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <Badge 
                        key={tag}
                        variant="secondary" 
                        className={`text-[10px] px-2 py-0.5 cursor-pointer hover:opacity-80 transition-opacity ${
                          tag === 'Bullish' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' : 
                          tag === 'Bearish' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20' :
                          'bg-dark-800 text-gray-400 border border-dark-700'
                        }`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* NEXUS SCORE GAUGE */}
          <div className="bg-gradient-to-b from-dark-900 to-dark-950 border border-dark-800 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.5)] print-break-inside-avoid">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl -mr-16 -mt-16 print:hidden"></div>
            <NexusScoreGauge score={data.nexusScore} />
            <p className="text-xs text-center text-gray-400 mt-4 px-2">
              Based on fundamental valuation, historical trends, and institutional ownership structure.
            </p>
          </div>

          {/* FEATURE 6: 52-WEEK PRICE RANGE */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 print-break-inside-avoid">
            <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
              <Activity className="size-4 text-brand-500" />
              Price Range & Historical
            </h3>
            <PriceRangeBar 
              low={data.priceRange.low52w} 
              high={data.priceRange.high52w} 
              current={data.currentPrice} 
            />
            <div className="mt-4 space-y-2 border-t border-dark-800 pt-4">
              {[
                { label: 'Previous Close', value: `IDR ${data.previousClose.toLocaleString('id-ID')}` },
                { label: '52-Week Low', value: `IDR ${data.priceRange.low52w.toLocaleString('id-ID')}`, sub: data.priceRange.low52wDate },
                { label: '52-Week High', value: `IDR ${data.priceRange.high52w.toLocaleString('id-ID')}`, sub: data.priceRange.high52wDate },
                { label: 'All-time High', value: `IDR ${data.priceRange.allTimeHigh.toLocaleString('id-ID')}`, sub: data.priceRange.allTimeHighDate },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-dark-800/50 last:border-b-0">
                  <span className="text-xs font-medium text-gray-400">{row.label}</span>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white">{row.value}</span>
                    {row.sub && <p className="text-[10px] text-gray-600">{row.sub}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FEATURE 9: ESG SCORE */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 print-break-inside-avoid">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Leaf className="size-4 text-emerald-500" />
              ESG Rating
            </h3>
            <div className="flex justify-center gap-4 mb-4">
              <EsgScoreRing score={data.esgScore.environmental} label="Env." />
              <EsgScoreRing score={data.esgScore.social} label="Social" />
              <EsgScoreRing score={data.esgScore.governance} label="Gov." />
            </div>
            <div className="text-center mb-3">
              <p className="text-2xl font-black text-white">{data.esgScore.total}</p>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px] font-bold uppercase mt-1">
                {data.esgScore.rating}
              </Badge>
            </div>
            <p className="text-[10px] text-gray-500 text-center leading-relaxed">
              Lower score = better ESG practices. {data.ticker} ranks above most IDX companies.
            </p>
          </div>

          {/* FOREIGN FLOW */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 print-break-inside-avoid print-mb">
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
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  <strong className="text-white light:text-gray-900">AI Insight:</strong> {data.bandarmologi.summary}
                </p>
              </div>
            </div>
          </div>

          {/* FEATURE 8: OWNERSHIP STRUCTURE (Enhanced) */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 print-break-inside-avoid">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <PieChartIcon className="size-4 text-brand-500" />
              Major Shareholders
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
                <div key={idx} className="flex items-center justify-between text-sm py-1 border-b border-dark-800/50 last:border-b-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-300 text-xs">{item.name}</span>
                  </div>
                  <span className="font-bold text-white text-sm">{item.value}%</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-600 mt-3 text-center">Public float: 44.64% — considered healthy for this market cap</p>
          </div>

        </div>
      </div>
    </div>
  );
}
