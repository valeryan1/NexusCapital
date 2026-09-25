import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { 
  Plus, 
  MoreHorizontal, 
  BellRing, 
  Activity, 
  Terminal, 
  Zap, 
  Newspaper, 
  X,
  AlertTriangle,
  ChevronRight,
  Settings2
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_protected/alerts")({
  head: () => ({ meta: [{ title: `Algorithmic Alerts | ${siteConfig.name}` }] }),
  component: AlertsPage,
});

// Mock Data for Rules
const mockRules = [
  { id: 1, name: "Big Bank Distribution", ticker: "BBCA, BMRI", condition: "Price Drop > 3% AND Foreign Net Sell > 150B", type: "Price & Flow", status: "Active" },
  { id: 2, name: "Tech Sentiment Shock", ticker: "GOTO, BUKA", condition: "AI Sentiment == 'Bearish Shock' AND Vol > 200% MA20", type: "AI Sentiment", status: "Active" },
  { id: 3, name: "Energy Breakout", ticker: "ADRO, PGAS", condition: "Price Up > 5% AND Accumulation == 'Massive'", type: "Momentum", status: "Paused" },
];

// Mock Data for Live Pulse
const mockPulseFeed = [
  { id: 101, time: "14:32:05", ticker: "GOTO", event: "Sentiment Shock Detected", detail: "Negative news spike across 4 major outlets. Pre-emptive AI alert.", severity: "high" },
  { id: 102, time: "14:15:22", ticker: "BMRI", event: "Volume Anomaly", detail: "Volume exceeds 300% of 20-day average. Foreign accumulation detected.", severity: "low" },
  { id: 103, time: "13:45:10", ticker: "BBRI", event: "Heavy Distribution", detail: "Foreign net sell > 250B IDR in last 30 mins. Price breaking support.", severity: "high" },
  { id: 104, time: "11:20:00", ticker: "BREN", event: "Price Surge", detail: "Price up > 10% in single session. No significant news found.", severity: "medium" },
];

function AlertsPage() {
  const [selectedAlert, setSelectedAlert] = useState<typeof mockPulseFeed[0] | null>(null);

  return (
    <div className="view-section animate-fade-in max-w-[1400px] mx-auto space-y-6 pb-12 relative overflow-hidden">
      
      {/* HEADER */}
      <div className="border-b border-dark-800 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BellRing className="size-6 text-brand-500" />
            Algorithmic Alerts Engine
          </h1>
          <p className="text-gray-400 text-sm mt-1">Multi-variable triggers, AI sentiment detection, and live market pulse.</p>
        </div>
        <button className="bg-brand-500 hover:bg-brand-400 text-white font-bold px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(255,122,0,0.3)]">
          <Plus className="size-4" /> Create Complex Rule
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative">
        
        {/* LEFT COLUMN: RULES ENGINE */}
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-dark-900 rounded-xl border border-dark-800 overflow-hidden shadow-lg shadow-black/20">
            <div className="p-4 border-b border-dark-800 bg-dark-950/50 flex justify-between items-center">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Settings2 className="size-4 text-brand-500" />
                Active Monitor Rules
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-gray-500 uppercase bg-dark-950 border-b border-dark-800">
                  <tr>
                    <th className="px-5 py-3">Rule Name & Target</th>
                    <th className="px-5 py-3">Algorithmic Logic (Conditions)</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  {mockRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-dark-800/50 transition-colors group cursor-pointer">
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-200 group-hover:text-white">{rule.name}</div>
                        <div className="text-[10px] text-brand-500 font-mono mt-1">{rule.ticker}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-mono text-xs text-gray-300 bg-dark-950 p-2 rounded border border-dark-700">
                          {rule.condition.split(' AND ').map((c, i, arr) => (
                            <span key={i}>
                              <span className="text-emerald-400">{c}</span>
                              {i < arr.length - 1 && <span className="text-brand-500 font-bold mx-1">AND</span>}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[10px] font-bold text-gray-400 bg-dark-800 px-2 py-1 rounded">{rule.type}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {rule.status === "Active" ? (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-semantic-bull/10 text-semantic-bull border border-semantic-bull/20 rounded text-xs font-bold uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-semantic-bull animate-pulse"></span>
                              Active
                            </div>
                          ) : (
                            <div className="px-2 py-1 bg-dark-800 text-gray-500 border border-dark-700 rounded text-xs font-bold uppercase">
                              Paused
                            </div>
                          )}
                          <button className="p-1 hover:text-white text-gray-500"><MoreHorizontal className="size-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE PULSE TERMINAL */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-dark-950 border border-dark-800 rounded-xl flex flex-col h-[600px] overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.6)] relative">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50"></div>
            
            <div className="p-4 border-b border-dark-800 flex justify-between items-center bg-dark-900/50">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Terminal className="size-4 text-brand-500" />
                Live Market Pulse
              </h3>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-semantic-bull opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-semantic-bull"></span>
                </span>
                <span className="text-[10px] font-bold text-semantic-bull uppercase tracking-wider">Live</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
              {mockPulseFeed.map((pulse) => (
                <div 
                  key={pulse.id} 
                  onClick={() => setSelectedAlert(pulse)}
                  className={cn(
                    "p-3 rounded-lg border border-dark-800 bg-dark-900 cursor-pointer hover:border-dark-600 transition-all group relative overflow-hidden",
                    pulse.severity === 'high' && "border-semantic-bear/30 hover:border-semantic-bear/60"
                  )}
                >
                  {pulse.severity === 'high' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-semantic-bear"></div>
                  )}
                  {pulse.severity === 'low' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-semantic-bull"></div>
                  )}
                  {pulse.severity === 'medium' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500"></div>
                  )}
                  
                  <div className="flex justify-between items-start mb-1.5 pl-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-gray-500">{pulse.time}</span>
                      <span className="text-xs font-black text-white bg-dark-950 px-1.5 py-0.5 rounded">{pulse.ticker}</span>
                    </div>
                    <Zap className={cn("size-3", pulse.severity === 'high' ? 'text-semantic-bear' : 'text-brand-500')} />
                  </div>
                  <div className="pl-2">
                    <h4 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{pulse.event}</h4>
                    <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">{pulse.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* SLIDE-OVER DRAWER FOR INSTANT AI MICRO-REPORT */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-dark-950 border-l border-dark-800 h-full flex flex-col shadow-2xl transform transition-transform animate-slide-in-right">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-dark-800 flex justify-between items-start bg-dark-900">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-black text-white bg-dark-950 px-2 py-1 rounded border border-dark-700">{selectedAlert.ticker}</span>
                  <span className="text-[10px] font-mono text-gray-500">{selectedAlert.time}</span>
                </div>
                <h2 className="text-lg font-bold text-white leading-tight">{selectedAlert.event}</h2>
              </div>
              <button 
                onClick={() => setSelectedAlert(null)}
                className="p-2 hover:bg-dark-800 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Drawer Body (AI Report) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              <div className="bg-semantic-bear/5 border border-semantic-bear/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="size-4 text-semantic-bear" />
                  <h3 className="text-sm font-bold text-semantic-bear">Trigger Analysis</h3>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{selectedAlert.detail}</p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Activity className="size-4 text-brand-500" /> AI Impact Assessment
                </h3>
                <div className="space-y-3">
                  <div className="bg-dark-900 border border-dark-800 p-3 rounded-lg">
                    <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Short-Term Impact (1-3 Days)</div>
                    <p className="text-sm text-gray-200">High probability of continued selling pressure testing the Rp 4,500 support level due to institutional panic.</p>
                  </div>
                  <div className="bg-dark-900 border border-dark-800 p-3 rounded-lg">
                    <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Peer Reaction</div>
                    <p className="text-sm text-gray-200">Sector peers (ARTO, BBHI) are showing early signs of sympathy drops. Monitor liquidity closely.</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Newspaper className="size-4 text-brand-500" /> Related Catalysts
                </h3>
                <div className="space-y-2 border-l-2 border-dark-800 pl-3">
                  <p className="text-xs text-gray-300"><span className="text-brand-500 font-bold">14:05</span> - Global tech selloff accelerates following US inflation data.</p>
                  <p className="text-xs text-gray-300"><span className="text-brand-500 font-bold">13:30</span> - Broker RX and YU identified as primary net sellers.</p>
                </div>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-dark-800 bg-dark-900">
              <button className="w-full bg-dark-950 hover:bg-dark-800 border border-dark-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                Open Full Research Studio <ChevronRight className="size-4" />
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
