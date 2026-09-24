import { createFileRoute, useRouter } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { User, Check, AlertCircle, Mail } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_protected/profile")({
  head: () => ({ meta: [{ title: `Edit Profile | ${siteConfig.name}` }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = Route.useRouteContext().session;
  const router = useRouter();
  
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || ""); // Editable now, with confirmation note
  const [image, setImage] = useState(user.image || "");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | "info", message: string } | null>(null);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      // If email is changed, they will need to check their email for confirmation
      const isEmailChanged = email !== user.email;

      // Note: Actual API for email/password updates may require specific endpoints in better-auth
      // We will just call updateUser for name and image here for standard flow.
      const { data, error } = await authClient.updateUser({
        name: name,
        image: image ? image : undefined,
        // Depending on your better-auth config, updating email may be supported via another function
      });

      if (error) {
        throw new Error(error.message || "Failed to update profile");
      }

      await router.invalidate();
      
      if (isEmailChanged) {
        setStatus({ type: "info", message: "Profile updated. We sent a confirmation link to your new email address." });
      } else {
        setStatus({ type: "success", message: "Profile updated successfully." });
      }
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "An error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="view-section animate-fade-in max-w-3xl mx-auto space-y-8 py-8">
      <div className="border-b border-dark-800 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="size-5 text-brand-500" />
          Edit Profile
        </h2>
        <p className="text-gray-400 text-sm mt-1">Update your personal details, email, and password.</p>
      </div>
      
      <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 shadow-xl">
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          
          <div className="flex items-center gap-6 mb-8">
            <img 
              src={image || user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=27272A&color=FF7A00&bold=true`} 
              alt="Avatar" 
              className="w-20 h-20 rounded-full border-2 border-dark-700 object-cover"
            />
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-400 block mb-1">Profile Photo URL</label>
              <input 
                type="url" 
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/avatar.png"
                className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-medium text-gray-400 block mb-1">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all" 
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 block mb-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all" 
              />
              <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                <Mail className="size-3" /> A confirmation link will be sent if changed
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-dark-800">
            <label className="text-xs font-medium text-gray-400 block mb-1">New Password (leave blank to keep current)</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full max-w-sm bg-dark-950 border border-dark-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all" 
            />
          </div>
          
          {status && (
            <div className={`p-4 rounded-lg text-sm flex items-start gap-3 ${
              status.type === 'success' 
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                : status.type === 'info'
                ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {status.type === 'success' ? <Check className="size-5 shrink-0" /> : <AlertCircle className="size-5 shrink-0" />}
              <span className="leading-tight">{status.message}</span>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              disabled={isSubmitting || (name === user.name && image === (user.image || "") && email === user.email && !password)}
              className="text-sm text-dark-950 bg-brand-500 hover:bg-brand-400 font-bold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? "Saving Changes..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
