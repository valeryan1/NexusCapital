import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { Key, Copy, Radio } from "lucide-react";

export const Route = createFileRoute("/_protected/api")({
  head: () => ({ meta: [{ title: `API Gateway | ${siteConfig.name}` }] }),
  component: ApiPage,
});

function ApiPage() {
  return (
    <div className="view-section animate-fade-in max-w-7xl mx-auto space-y-6">
      <div className="border-b border-dark-800 pb-4">
        <h2 className="text-2xl font-bold text-white">API Gateway</h2>
        <p className="text-gray-400 text-sm mt-1">Manage your B2B integration keys and webhooks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <Key className="size-4 text-brand-500" /> Production API Key
          </h3>
          <div className="bg-dark-950 border border-dark-700 rounded-lg p-3 flex justify-between items-center mb-4">
            <code className="text-brand-400 text-sm">nx_live_***********************89b2</code>
            <button 
              className="text-gray-400 hover:text-white transition-colors" 
              onClick={() => alert('Copied to clipboard!')}
              title="Copy to clipboard"
            >
              <Copy className="size-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-4">Keep this key secret. Do not expose it in frontend code.</p>
          <button className="text-sm text-white bg-dark-800 hover:bg-dark-700 px-4 py-2 rounded-lg border border-dark-700 transition-colors">
            Regenerate Key
          </button>
        </div>
        
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <Radio className="size-4 text-brand-500" /> Webhook Configuration
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Payload URL</label>
              <input 
                type="text" 
                defaultValue="https://api.yourcompany.com/nexus-webhook" 
                className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none" 
              />
            </div>
            <button className="text-sm text-dark-950 bg-brand-500 hover:bg-brand-400 font-bold px-4 py-2 rounded-lg transition-colors">
              Save Webhook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
