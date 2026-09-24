import { createFileRoute, useRouter } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { Image, User, Check, AlertCircle, Settings2, Moon, Sun, Monitor, Bell } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_protected/settings")({
  head: () => ({ meta: [{ title: `Settings | ${siteConfig.name}` }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = Route.useRouteContext().session;
  const router = useRouter();
  
  const [name, setName] = useState(user.name || "");
  const [image, setImage] = useState(user.image || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error", message: string } | null>(null);

  // Theme state (mock)
  const [theme, setTheme] = useState<"system" | "dark" | "light">("dark");
  const [emailAlerts, setEmailAlerts] = useState(true);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const { data, error } = await authClient.updateUser({
        name: name,
        image: image ? image : undefined,
      });

      if (error) {
        throw new Error(error.message || "Failed to update profile");
      }

      await router.invalidate();
      setStatus({ type: "success", message: "Profile updated successfully." });
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "An error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="view-section animate-fade-in max-w-7xl mx-auto space-y-8">
      <div className="border-b border-dark-800 pb-4">
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-gray-400 text-sm mt-1">Manage your account profile and application preferences.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: PROFILE */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <User className="size-4 text-brand-500" />
              Edit Profile
            </h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1">Email (Cannot be changed)</label>
                <input 
                  type="email" 
                  value={user.email} 
                  disabled
                  className="w-full bg-dark-950 border border-dark-800 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed" 
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all" 
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1">Profile Image URL (Optional)</label>
                <input 
                  type="url" 
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                  className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all" 
                />
              </div>
              
              {status && (
                <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                  status.type === 'success' 
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}>
                  {status.type === 'success' ? <Check className="size-4" /> : <AlertCircle className="size-4" />}
                  {status.message}
                </div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting || (name === user.name && image === (user.image || ""))}
                className="w-full text-sm text-dark-950 bg-brand-500 hover:bg-brand-400 font-bold px-4 py-2.5 rounded-lg transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isSubmitting ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: PREFERENCES */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
            <h3 className="text-white font-medium mb-6 flex items-center gap-2">
              <Settings2 className="size-4 text-brand-500" />
              Settings & Preferences
            </h3>

            {/* Appearance Section */}
            <div className="mb-8">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Appearance</h4>
              <p className="text-xs text-gray-500 mb-4">Choose how NexusCapital looks to you.</p>
              
              <div className="grid grid-cols-3 gap-3">
                <button 
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                    theme === 'dark' 
                      ? 'border-brand-500 bg-brand-500/10 text-brand-500' 
                      : 'border-dark-700 bg-dark-950 text-gray-400 hover:border-dark-600 hover:text-gray-200'
                  }`}
                >
                  <Moon className="size-6 mb-2" />
                  <span className="text-xs font-medium">Dark Mode</span>
                </button>
                <button 
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                    theme === 'light' 
                      ? 'border-brand-500 bg-brand-500/10 text-brand-500' 
                      : 'border-dark-700 bg-dark-950 text-gray-400 hover:border-dark-600 hover:text-gray-200'
                  }`}
                >
                  <Sun className="size-6 mb-2" />
                  <span className="text-xs font-medium">Light Mode</span>
                </button>
                <button 
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                    theme === 'system' 
                      ? 'border-brand-500 bg-brand-500/10 text-brand-500' 
                      : 'border-dark-700 bg-dark-950 text-gray-400 hover:border-dark-600 hover:text-gray-200'
                  }`}
                >
                  <Monitor className="size-6 mb-2" />
                  <span className="text-xs font-medium">System</span>
                </button>
              </div>
            </div>

            <hr className="border-dark-800 my-6" />

            {/* Notifications Section */}
            <div className="mb-8">
              <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Bell className="size-4" /> Notifications
              </h4>
              <div className="flex items-center justify-between p-4 bg-dark-950 rounded-xl border border-dark-800">
                <div>
                  <p className="text-sm font-medium text-white">Email Alerts</p>
                  <p className="text-xs text-gray-500">Receive breaking news for your watchlist directly to your email.</p>
                </div>
                <button 
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${emailAlerts ? 'bg-brand-500' : 'bg-dark-700'}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${emailAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <hr className="border-dark-800 my-6" />

            {/* White-label settings */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Image className="size-4" /> PDF Report Branding
              </h4>
              <p className="text-xs text-gray-500 mb-4">Customize the appearance of your exported reports.</p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-dark-950 border border-dashed border-dark-700 rounded-lg flex items-center justify-center">
                    <Image className="size-6 text-gray-600" />
                  </div>
                  <div>
                    <button className="text-sm text-white bg-dark-800 hover:bg-dark-700 px-3 py-1.5 rounded-lg border border-dark-700 transition-colors mb-1">
                      Upload Logo
                    </button>
                    <p className="text-[10px] text-gray-500">PNG with transparent background</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 block mb-1">Company Name</label>
                  <input 
                    type="text" 
                    defaultValue="Acme Investments" 
                    className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all" 
                  />
                </div>
                <button className="text-sm text-white bg-dark-800 hover:bg-dark-700 px-4 py-2 rounded-lg transition-colors mt-2 border border-dark-700">
                  Save Branding Options
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
