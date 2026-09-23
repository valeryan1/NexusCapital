import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { Coins, CheckCircle2, History } from "lucide-react";

export const Route = createFileRoute("/_protected/billing")({
  head: () => ({ meta: [{ title: `Billing & Top-Up | ${siteConfig.name}` }] }),
  component: BillingPage,
});

function BillingPage() {
  return (
    <div className="view-section animate-fade-in max-w-7xl mx-auto space-y-6">
      <div className="border-b border-dark-800 pb-4">
        <h2 className="text-2xl font-bold text-white">Billing & Top-Up</h2>
        <p className="text-gray-400 text-sm mt-1">Manage your Nexus Score credits and view transaction history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Balance */}
        <div className="lg:col-span-1">
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 text-dark-800 opacity-20 transform group-hover:scale-110 transition-transform">
              <Coins className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-medium text-gray-400">Current Balance</p>
              <h3 className="text-4xl font-bold text-white mt-2">1,240 <span className="text-lg font-normal text-brand-500">Credits</span></h3>
              <p className="text-xs text-gray-500 mt-2">~124 Full Reports or 620 Micro-Reports</p>
            </div>
          </div>
        </div>

        {/* Top-up Packages */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Starter */}
            <div className="bg-dark-900 border border-dark-800 hover:border-brand-500/50 rounded-xl p-6 transition-colors flex flex-col">
              <h4 className="text-white font-bold mb-1">Starter</h4>
              <p className="text-brand-500 text-2xl font-extrabold mb-4">50 <span className="text-sm font-normal text-gray-400">CR</span></p>
              <div className="mb-6 space-y-2 flex-1">
                <p className="text-xs text-gray-400 flex items-center gap-2"><CheckCircle2 className="size-3 text-emerald-400" /> 5 Full Reports</p>
                <p className="text-xs text-gray-400 flex items-center gap-2"><CheckCircle2 className="size-3 text-emerald-400" /> 25 Micro-Reports</p>
              </div>
              <button className="w-full bg-dark-950 border border-dark-700 hover:bg-dark-800 text-white font-medium py-2 rounded-lg transition-colors text-sm">
                Rp 75.000
              </button>
            </div>

            {/* Pro */}
            <div className="bg-dark-900 border border-brand-500 rounded-xl p-6 transition-colors flex flex-col relative shadow-[0_0_15px_rgba(255,122,0,0.1)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-brand-500 text-dark-950 text-[10px] font-bold px-3 py-0.5 rounded-b-lg uppercase tracking-wider">Most Popular</div>
              <h4 className="text-white font-bold mb-1 mt-2">Pro</h4>
              <p className="text-brand-500 text-2xl font-extrabold mb-4">200 <span className="text-sm font-normal text-gray-400">CR</span></p>
              <div className="mb-6 space-y-2 flex-1">
                <p className="text-xs text-gray-400 flex items-center gap-2"><CheckCircle2 className="size-3 text-emerald-400" /> 20 Full Reports</p>
                <p className="text-xs text-gray-400 flex items-center gap-2"><CheckCircle2 className="size-3 text-emerald-400" /> 100 Micro-Reports</p>
                <p className="text-xs text-gray-400 flex items-center gap-2"><CheckCircle2 className="size-3 text-emerald-400" /> API Access</p>
              </div>
              <button className="w-full bg-brand-500 hover:bg-brand-400 text-dark-950 font-bold py-2 rounded-lg transition-colors text-sm shadow-[0_0_10px_rgba(255,122,0,0.3)]">
                Rp 275.000
              </button>
            </div>

            {/* Business */}
            <div className="bg-dark-900 border border-dark-800 hover:border-brand-500/50 rounded-xl p-6 transition-colors flex flex-col">
              <h4 className="text-white font-bold mb-1">Business</h4>
              <p className="text-brand-500 text-2xl font-extrabold mb-4">500 <span className="text-sm font-normal text-gray-400">CR</span></p>
              <div className="mb-6 space-y-2 flex-1">
                <p className="text-xs text-gray-400 flex items-center gap-2"><CheckCircle2 className="size-3 text-emerald-400" /> 50 Full Reports</p>
                <p className="text-xs text-gray-400 flex items-center gap-2"><CheckCircle2 className="size-3 text-emerald-400" /> 250 Micro-Reports</p>
                <p className="text-xs text-gray-400 flex items-center gap-2"><CheckCircle2 className="size-3 text-emerald-400" /> API Access</p>
              </div>
              <button className="w-full bg-dark-950 border border-dark-700 hover:bg-dark-800 text-white font-medium py-2 rounded-lg transition-colors text-sm">
                Rp 625.000
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-dark-800 flex justify-between items-center bg-dark-900/50">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <History className="size-4 text-brand-500" /> Transaction History
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-800">
            <thead className="bg-dark-950/30">
              <tr>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              <tr className="hover:bg-dark-800/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">Oct 24, 2026</td>
                <td className="px-6 py-4 text-sm text-white">Full Report Generated (PGEO)</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-400 font-mono">-10</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-300 font-mono">1,240</td>
              </tr>
              <tr className="hover:bg-dark-800/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">Oct 24, 2026</td>
                <td className="px-6 py-4 text-sm text-white">Micro-Report Triggered (WIFI)</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-400 font-mono">-2</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-300 font-mono">1,250</td>
              </tr>
              <tr className="hover:bg-dark-800/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">Oct 20, 2026</td>
                <td className="px-6 py-4 text-sm text-white">Top-up: Pro Package <span className="text-[10px] text-gray-500 border border-dark-700 bg-dark-950 px-1.5 py-0.5 rounded ml-2">Midtrans</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-emerald-400 font-mono">+200</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-300 font-mono">1,252</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
