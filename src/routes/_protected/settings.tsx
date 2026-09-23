import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { Image } from "lucide-react";

export const Route = createFileRoute("/_protected/settings")({
  head: () => ({ meta: [{ title: `Settings | ${siteConfig.name}` }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="view-section animate-fade-in max-w-7xl mx-auto space-y-6">
      <div className="border-b border-dark-800 pb-4">
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-gray-400 text-sm mt-1">Manage your account and white-label preferences.</p>
      </div>
      
      <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 max-w-2xl">
        <h3 className="text-white font-medium mb-4">White-label PDF Branding</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-dark-950 border border-dashed border-dark-700 rounded-lg flex items-center justify-center">
              <Image className="size-6 text-gray-600" />
            </div>
            <div>
              <button className="text-sm text-white bg-dark-800 hover:bg-dark-700 px-3 py-1.5 rounded-lg border border-dark-700 transition-colors mb-1">
                Upload Company Logo
              </button>
              <p className="text-xs text-gray-500">Recommended size: 200x50px (PNG with transparent background)</p>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Company Name</label>
            <input 
              type="text" 
              defaultValue="Acme Investments" 
              className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none" 
            />
          </div>
          <button className="text-sm text-dark-950 bg-brand-500 hover:bg-brand-400 font-bold px-4 py-2 rounded-lg transition-colors mt-2">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
