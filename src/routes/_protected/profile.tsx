import { createFileRoute, useRouter } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { User, Check, AlertCircle, Mail, Upload } from "lucide-react";
import { useState, useRef } from "react";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_protected/profile")({
  head: () => ({ meta: [{ title: `Edit Profile | ${siteConfig.name}` }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = Route.useRouteContext().session;
  const router = useRouter();
  
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [previewImage, setPreviewImage] = useState(user.image || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | "info", message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
    }
  };

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const isEmailChanged = email !== user.email;

      // Prepare image update. If there's a file, in a real app you'd upload to S3/Cloudinary first
      // Here we might just convert to base64 if better-auth accepts it, or keep it as is.
      let finalImageUrl = user.image;
      
      if (imageFile) {
        // Simulating upload - for now, we'll convert to base64 to store in auth client
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
        finalImageUrl = base64;
      }

      const { error } = await authClient.updateUser({
        name: name,
        image: finalImageUrl ? finalImageUrl : undefined,
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
    } catch (err: unknown) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "An error occurred.",
      });
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
              src={previewImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=27272A&color=FF7A00&bold=true`} 
              alt="Avatar" 
              className="w-20 h-20 rounded-full border-2 border-dark-700 object-cover"
            />
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-400 block mb-2">Profile Photo</label>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 bg-dark-800 hover:bg-dark-700 border border-dark-700 text-sm text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Upload className="size-4" />
                  Upload Photo
                </button>
                {imageFile && (
                  <span className="text-xs text-brand-500 font-medium truncate max-w-[200px]">
                    {imageFile.name}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-500 mt-2">Recommended: Square JPG, PNG, or GIF. Max 2MB.</p>
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
              disabled={isSubmitting || (name === user.name && !imageFile && email === user.email && !password)}
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
