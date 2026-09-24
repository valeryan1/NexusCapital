import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { Plus, BellRing, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export const Route = createFileRoute("/_protected/alerts")({
  head: () => ({ meta: [{ title: `Micro-Alerts | ${siteConfig.name}` }] }),
  component: AlertsPage,
});

type AlertType = {
  id: number;
  ticker: string;
  condition: string;
  status: string;
  lastTriggered: string;
  action: string;
  interval: string;
};

function AlertsPage() {
  const [alertsList, setAlertsList] = useState<AlertType[]>([
    { id: 1, ticker: "BBCA", condition: "Price Drops > 5%", status: "Active", lastTriggered: "Never", action: "AI Analysis to Email/Push", interval: "Every 30s" },
    { id: 2, ticker: "WIFI", condition: "Volume Spikes > 200%", status: "Active", lastTriggered: "2 days ago", action: "Push Notification", interval: "Every 5m" }
  ]);

  const [showCreate, setShowCreate] = useState(false);
  const [newRule, setNewRule] = useState({ ticker: "BBCA", condition: "Price Drops > 5%" });
  
  // In-App Toast State
  const [toastMessage, setToastMessage] = useState<{title: string, body: string} | null>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  const triggerAlert = (alertItem: AlertType) => {
    const title = `🚨 AI Alert: ${alertItem.ticker}`;
    const body = `Kondisi: ${alertItem.condition}. Analisis kilat: Oversold sesaat, fundamental tetap stabil.`;
    
    // 1. Munculkan Toast In-App agar PASTI terlihat meskipun OS memblokir notif
    setToastMessage({ title, body });
    setTimeout(() => setToastMessage(null), 6000);
    
    // 2. Kirim Notif OS Asli
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, { body, icon: "/logo.png" });
      } catch(e) {}
    } else {
      console.log("OS Notification blocked/not granted.");
    }
    
    const nowTime = new Date().toLocaleTimeString();
    setAlertsList(prev => prev.map(a => a.id === alertItem.id ? { ...a, lastTriggered: nowTime } : a));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        // Auto-trigger BBCA
        triggerAlert({ 
          id: 1, 
          ticker: "BBCA", 
          condition: "Price Drops > 5%", 
          status: "Active", 
          lastTriggered: "Never", 
          action: "AI Analysis to Email/Push", 
          interval: "Every 30s" 
        });
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateRule = () => {
    const newAlert: AlertType = {
      id: Date.now(),
      ticker: newRule.ticker,
      condition: newRule.condition,
      status: "Active",
      lastTriggered: "Never",
      action: "Push Notification",
      interval: "Every 1m"
    };
    setAlertsList([...alertsList, newAlert]);
    setShowCreate(false);
  };

  return (
    <div className="view-section animate-fade-in max-w-7xl mx-auto space-y-6">
      <div className="border-b border-dark-800 pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BellRing className="size-6 text-brand-500" /> Event-Triggered Alerts
          </h2>
          <p className="text-gray-400 text-sm mt-1">Autonomous market monitoring and micro-reports.</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="bg-dark-900 border border-dark-700 hover:border-brand-500 text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2"
        >
          <Plus className="size-4 text-brand-500" /> Create Rule
        </button>
      </div>

      {showCreate && (
        <div className="bg-dark-900 border border-dark-700 p-4 rounded-xl flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs text-gray-400 mb-1">Ticker</label>
            <select 
              value={newRule.ticker} 
              onChange={e => setNewRule({...newRule, ticker: e.target.value})}
              className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500"
            >
              <option value="BBCA">BBCA</option>
              <option value="BMRI">BMRI</option>
              <option value="ASII">ASII</option>
              <option value="TLKM">TLKM</option>
            </select>
          </div>
          <div className="flex-[2] min-w-[200px]">
            <label className="block text-xs text-gray-400 mb-1">Condition</label>
            <input 
              type="text" 
              value={newRule.condition} 
              onChange={e => setNewRule({...newRule, condition: e.target.value})}
              placeholder="e.g. Price Drops > 5%"
              className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button onClick={handleCreateRule} className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Save Rule
            </button>
          </div>
        </div>
      )}

      <div className="bg-dark-900 rounded-xl border border-dark-800 overflow-hidden">
        <table className="min-w-full divide-y divide-dark-800">
          <thead className="bg-dark-950/50">
            <tr>
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase">Ticker</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase">Condition</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase">Last Triggered</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase">Check Interval</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800">
            {alertsList.map(alertItem => (
              <tr key={alertItem.id} className="hover:bg-dark-800/30 transition-colors">
                <td className="px-6 py-4"><div className="font-bold text-white">{alertItem.ticker}</div></td>
                <td className="px-6 py-4 text-sm text-gray-400 font-mono">{alertItem.condition}</td>
                <td className="px-6 py-4"><span className="text-emerald-400 text-xs bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">{alertItem.status}</span></td>
                <td className="px-6 py-4 text-sm text-gray-500">{alertItem.lastTriggered}</td>
                <td className="px-6 py-4 text-sm text-gray-400 font-medium">{alertItem.interval}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* In-App Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 max-w-sm bg-dark-900 border border-brand-500/50 rounded-xl p-4 shadow-[0_10px_40px_rgba(255,122,0,0.2)] animate-in slide-in-from-right-8 fade-in duration-300 z-50">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-brand-500/10 rounded-lg flex-shrink-0">
              <BellRing className="size-5 text-brand-500" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">{toastMessage.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{toastMessage.body}</p>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-gray-500 hover:text-white absolute top-4 right-4">
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
