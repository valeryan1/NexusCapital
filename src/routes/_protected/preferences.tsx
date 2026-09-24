import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { Settings2, Moon, Sun, Monitor, Bell, Image } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_protected/preferences")({
  head: () => ({ meta: [{ title: `Preferences | ${siteConfig.name}` }] }),
  component: PreferencesPage,
});

function PreferencesPage() {
  // Theme state (mock)
  const [theme, setTheme] = useState<"system" | "dark" | "light">("dark");
  const [emailAlerts, setEmailAlerts] = useState(true);

  return (
    <div className="view-section animate-fade-in max-w-4xl mx-auto space-y-8 py-8">
      <div className="border-b border-dark-800 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings2 className="size-5 text-brand-500" />
          Preferences
        </h2>
        <p className="text-gray-400 text-sm mt-1">Customize your workspace appearance and application behavior.</p>
      </div>
      
      <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 shadow-xl space-y-8">

        {/* Appearance Section */}
        <div>
          <h4 className="text-base font-semibold text-white mb-2">Workspace Theme</h4>
          <p className="text-sm text-gray-500 mb-5">Choose how NexusCapital looks to you. This affects all dashboards and reports.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                theme === 'dark' 
                  ? 'border-brand-500 bg-brand-500/10 text-brand-500' 
                  : 'border-dark-700 bg-dark-950 text-gray-400 hover:border-dark-600 hover:text-gray-200'
              }`}
            >
              <Moon className="size-8 mb-3" />
              <span className="text-sm font-semibold">Dark Mode</span>
            </button>
            <button 
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                theme === 'light' 
                  ? 'border-brand-500 bg-brand-500/10 text-brand-500' 
                  : 'border-dark-700 bg-dark-950 text-gray-400 hover:border-dark-600 hover:text-gray-200'
              }`}
            >
              <Sun className="size-8 mb-3" />
              <span className="text-sm font-semibold">Light Mode</span>
            </button>
            <button 
              onClick={() => setTheme('system')}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                theme === 'system' 
                  ? 'border-brand-500 bg-brand-500/10 text-brand-500' 
                  : 'border-dark-700 bg-dark-950 text-gray-400 hover:border-dark-600 hover:text-gray-200'
              }`}
            >
              <Monitor className="size-8 mb-3" />
              <span className="text-sm font-semibold">System Match</span>
            </button>
          </div>
        </div>

        <hr className="border-dark-800" />

        {/* Notifications Section */}
        <div>
          <h4 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
            <Bell className="size-5" /> Notifications
          </h4>
          <p className="text-sm text-gray-500 mb-5">Manage how you receive alerts for your watchlist.</p>
          
          <div className="flex items-center justify-between p-5 bg-dark-950 rounded-xl border border-dark-800">
            <div>
              <p className="text-sm font-medium text-white mb-1">Email Alerts</p>
              <p className="text-xs text-gray-500 max-w-md">Receive breaking news and critical corporate actions for your watchlist directly to your inbox.</p>
            </div>
            <button 
              onClick={() => setEmailAlerts(!emailAlerts)}
              className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${emailAlerts ? 'bg-brand-500' : 'bg-dark-700'}`}
            >
              <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${emailAlerts ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        <hr className="border-dark-800" />

        {/* White-label settings */}
        <div>
          <h4 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
            <Image className="size-5" /> PDF Report Personalization
          </h4>
          <p className="text-sm text-gray-500 mb-5">Customize the branding for your exported PDF reports to match your company identity.</p>
          
          <div className="bg-dark-950 border border-dark-800 rounded-xl p-5 space-y-5">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-dark-900 border border-dashed border-dark-700 rounded-lg flex items-center justify-center">
                <Image className="size-8 text-gray-600" />
              </div>
              <div>
                <button className="text-sm font-medium text-white bg-dark-800 hover:bg-dark-700 px-4 py-2 rounded-lg border border-dark-700 transition-colors mb-2">
                  Upload Custom Logo
                </button>
                <p className="text-xs text-gray-500">PNG or JPG. Max size 2MB. Recommended 200x50px.</p>
              </div>
            </div>
            
            <div className="max-w-md">
              <label className="text-xs font-medium text-gray-400 block mb-2">Company / Agency Name</label>
              <input 
                type="text" 
                defaultValue="Acme Investments" 
                className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all" 
              />
            </div>
            
            <div className="pt-2">
              <button className="text-sm text-dark-950 bg-brand-500 hover:bg-brand-400 font-bold px-6 py-2.5 rounded-lg transition-colors">
                Save Personalization
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
