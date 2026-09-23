import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { Plus, MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/_protected/alerts")({
  head: () => ({ meta: [{ title: `Micro-Alerts | ${siteConfig.name}` }] }),
  component: AlertsPage,
});

function AlertsPage() {
  return (
    <div className="view-section animate-fade-in max-w-7xl mx-auto space-y-6">
      <div className="border-b border-dark-800 pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white">Event-Triggered Alerts</h2>
          <p className="text-gray-400 text-sm mt-1">Autonomous market monitoring and micro-reports.</p>
        </div>
        <button className="bg-dark-900 border border-dark-700 hover:border-brand-500 text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2">
          <Plus className="size-4 text-brand-500" /> Create Rule
        </button>
      </div>

      <div className="bg-dark-900 rounded-xl border border-dark-800 overflow-hidden">
        <table className="min-w-full divide-y divide-dark-800">
          <thead className="bg-dark-950/50">
            <tr>
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase">Ticker</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase">Condition</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase">Last Triggered</th>
              <th className="px-6 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800">
            <tr className="hover:bg-dark-800/30 transition-colors">
              <td className="px-6 py-4"><div className="font-bold text-white">WIFI</div></td>
              <td className="px-6 py-4 text-sm text-gray-400 font-mono">Price Drops &gt; 5%</td>
              <td className="px-6 py-4"><span className="text-emerald-400 text-xs bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">Active</span></td>
              <td className="px-6 py-4 text-sm text-gray-500">Never</td>
              <td className="px-6 py-4 text-right"><button className="text-gray-500 hover:text-white transition-colors"><MoreHorizontal className="size-5" /></button></td>
            </tr>
            <tr className="hover:bg-dark-800/30 transition-colors">
              <td className="px-6 py-4"><div className="font-bold text-white">TOBA</div></td>
              <td className="px-6 py-4 text-sm text-gray-400 font-mono">Volume Spikes &gt; 200%</td>
              <td className="px-6 py-4"><span className="text-emerald-400 text-xs bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">Active</span></td>
              <td className="px-6 py-4 text-sm text-gray-500">2 days ago</td>
              <td className="px-6 py-4 text-right"><button className="text-gray-500 hover:text-white transition-colors"><MoreHorizontal className="size-5" /></button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
