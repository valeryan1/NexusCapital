import { createFileRoute, useRouter } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { Image, User, Check, AlertCircle } from "lucide-react";
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
    <div className="view-section animate-fade-in max-w-7xl mx-auto space-y-6">
      <div className="border-b border-dark-800 pb-4">
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-gray-400 text-sm mt-1">Manage your account and profile preferences.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <User className="size-4 text-brand-500" />
            Profile Settings
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
              className="text-sm text-dark-950 bg-brand-500 hover:bg-brand-400 font-bold px-4 py-2 rounded-lg transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>

        {/* White-label settings */}
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
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
              <label className="text-xs font-medium text-gray-400 block mb-1">Company Name</label>
              <input 
                type="text" 
                defaultValue="Acme Investments" 
                className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all" 
              />
            </div>
            <button className="text-sm text-dark-950 bg-brand-500 hover:bg-brand-400 font-bold px-4 py-2 rounded-lg transition-colors mt-2">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
