import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, ShieldAlert, Target, TrendingUp, BarChart3, Bot } from "lucide-react";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/_protected/report/$id")({
  head: () => ({ meta: [{ title: `Report Details | ${siteConfig.name}` }] }),
  component: ReportViewerPage,
});

function ReportViewerPage() {
  // const { id } = Route.useParams();
  
  // Placeholder data for the mockup
  const ticker = "PGEO";
  const companyName = "Pertamina Geothermal Energy Tbk";
  const nexusScore = 82;
  
  return (
    <div className="view-section animate-fade-in max-w-7xl mx-auto space-y-6 pb-20">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-dark-800">
        <div className="flex items-center gap-4">
          <Link to="/app" className="p-2 rounded-lg bg-dark-900 border border-dark-800 hover:border-brand-500 hover:text-brand-500 transition-colors text-gray-400">
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{ticker}</h1>
              <span className="bg-brand-500/10 text-brand-400 border border-brand-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                Full Report
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">{companyName}</p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-dark-900 border border-dark-700 hover:bg-dark-800 hover:border-brand-500 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
          <Download className="size-4 text-brand-500" /> Export PDF
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Score & Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Nexus Score Gauge */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 text-center shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-semantic-bull"></div>
            <h3 className="text-gray-400 font-medium mb-6">Nexus Score</h3>
            
            <div className="relative flex size-48 mx-auto items-center justify-center rounded-full border-[12px] border-dark-800">
              {/* Fake Gauge Progress */}
              <div 
                className="absolute inset-0 rounded-full border-[12px] border-semantic-bull border-t-transparent border-r-transparent -rotate-45"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
              ></div>
              <div className="flex flex-col items-center text-center z-10">
                <span className="text-5xl font-extrabold text-white font-mono">{nexusScore}</span>
                <span className="text-sm font-bold text-semantic-bull tracking-widest mt-1 uppercase">Strong Bull</span>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4 text-left">
              <div className="bg-dark-950 rounded-lg p-3 border border-dark-800">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Fundamental</p>
                <p className="text-white font-bold text-lg">85<span className="text-xs text-gray-500 font-normal">/100</span></p>
              </div>
              <div className="bg-dark-950 rounded-lg p-3 border border-dark-800">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Technical</p>
                <p className="text-white font-bold text-lg">78<span className="text-xs text-gray-500 font-normal">/100</span></p>
              </div>
            </div>
          </div>

          {/* Orchestrator Summary */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-dark-800 pb-3">
              <Bot className="size-5 text-brand-500" /> Executive Synthesis
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              PGEO is showing exceptional fundamental resilience with Q3 margins expanding by 240bps. The technical setup aligns with strong institutional accumulation (Bandarmologi) over the past 14 days, breaking the IDR 1,250 resistance.
            </p>
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <ShieldAlert className="size-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-200">
                <strong>Risk Warning:</strong> High dependency on upcoming regulatory tariff adjustments. A delay could trigger a short-term 8-10% correction.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Tabs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Fundamental Analysis */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-dark-800 pb-3">
              <BarChart3 className="size-5 text-emerald-400" /> Fundamental Analysis
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-dark-950 p-3 rounded-lg border border-dark-800">
                  <p className="text-xs text-gray-500 mb-1">P/E Ratio</p>
                  <p className="text-white font-mono font-medium">14.2x</p>
                </div>
                <div className="bg-dark-950 p-3 rounded-lg border border-dark-800">
                  <p className="text-xs text-gray-500 mb-1">PBV</p>
                  <p className="text-white font-mono font-medium">2.1x</p>
                </div>
                <div className="bg-dark-950 p-3 rounded-lg border border-dark-800">
                  <p className="text-xs text-gray-500 mb-1">ROE</p>
                  <p className="text-white font-mono font-medium">15.4%</p>
                </div>
                <div className="bg-dark-950 p-3 rounded-lg border border-dark-800">
                  <p className="text-xs text-gray-500 mb-1">DER</p>
                  <p className="text-white font-mono font-medium">0.8x</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                The company demonstrates robust cash flow generation. Valuation remains attractive compared to the sector average P/E of 18.5x. Revenue growth of 12% YoY is driven by capacity expansion at the Kamojang facility.
              </p>
            </div>
          </div>

          {/* Technical Analysis */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-dark-800 pb-3">
              <TrendingUp className="size-5 text-purple-400" /> Technical & Volume Profile
            </h3>
            <div className="h-48 w-full bg-dark-950 border border-dark-800 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>
              {/* Abstract Chart Placeholder */}
              <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                <path d="M0,100 Q100,80 200,90 T400,60 T600,40 T800,20 L800,200 L0,200 Z" fill="rgba(168, 85, 247, 0.1)" />
                <path d="M0,100 Q100,80 200,90 T400,60 T600,40 T800,20" fill="none" stroke="#A855F7" strokeWidth="3" />
              </svg>
              <div className="z-10 bg-dark-900/80 backdrop-blur border border-dark-700 px-3 py-1.5 rounded text-xs text-white">Interactive Chart View</div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Target className="size-3" /> Key Levels</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between items-center"><span className="text-gray-500">Resistance 2</span> <span className="text-white font-mono">1,450</span></li>
                  <li className="flex justify-between items-center"><span className="text-gray-500">Resistance 1</span> <span className="text-white font-mono">1,380</span></li>
                  <li className="flex justify-between items-center"><span className="text-brand-500 font-medium">Current Price</span> <span className="text-brand-500 font-mono font-bold">1,310</span></li>
                  <li className="flex justify-between items-center"><span className="text-gray-500">Support 1</span> <span className="text-white font-mono">1,250</span></li>
                </ul>
              </div>
              <div className="bg-dark-950 p-4 rounded-lg border border-dark-800">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bandarmologi (14D)</h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-semantic-bull">Accumulation</span>
                      <span className="text-gray-400">70%</span>
                    </div>
                    <div className="w-full bg-dark-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-semantic-bull h-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3">Foreign inflow detected: Net buy IDR 45B over the last 3 sessions.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
