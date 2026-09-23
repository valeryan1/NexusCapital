import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/_protected/research")({
  head: () => ({ meta: [{ title: `Research Studio | ${siteConfig.name}` }] }),
  component: ResearchPage,
});

function ResearchPage() {
  return (
    <div className="view-section animate-fade-in max-w-7xl mx-auto space-y-6">
      <div className="border-b border-dark-800 pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white">Research Studio</h2>
          <p className="text-gray-400 text-sm mt-1">Deep-dive analysis configurator</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* Configuration Form */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
            <h3 className="text-white font-medium mb-4">New Analysis</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Target Ticker</label>
                <input type="text" placeholder="e.g. BBCA" className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none uppercase" />
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1">Analysis Focus</label>
                <select className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none appearance-none cursor-pointer">
                  <option>Balanced (Fundamental + Tech)</option>
                  <option>Value Investing (Fundamental Heavy)</option>
                  <option>Swing Trading (Tech & Volume Heavy)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-dark-800">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="checkbox" defaultChecked className="rounded border-dark-700 text-brand-500 focus:ring-brand-500 bg-dark-950 cursor-pointer" />
                  <span className="text-sm text-gray-300">Include Sector Peer Comparison</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-dark-700 text-brand-500 focus:ring-brand-500 bg-dark-950 cursor-pointer" />
                  <span className="text-sm text-gray-300">Generate PDF Export</span>
                </label>
              </div>

              <button className="w-full bg-brand-500 hover:bg-brand-400 text-dark-950 font-bold py-2.5 rounded-lg transition-colors mt-4">
                Generate Report (10 Credits)
              </button>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          {/* Empty State / Recent Reports */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl h-full flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
            <div className="w-16 h-16 bg-dark-950 border border-dark-800 rounded-full flex items-center justify-center mb-4">
              <FileText className="size-8 text-dark-700" />
            </div>
            <h3 className="text-white font-medium text-lg">No Report Selected</h3>
            <p className="text-gray-500 text-sm mt-2 max-w-sm">Generate a new report using the configurator on the left, or select one from your history to view details.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
