import { useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function SignOutButton({ collapsed = false }: { collapsed?: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();
  const navigate = useNavigate();
  async function signOut() {
    setPending(true);
    setError(false);
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Sign out failed");
      await router.invalidate();
      await navigate({ to: "/sign-in", replace: true });
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="flex flex-col w-full">
      {error && (
        <p role="alert" className="text-[10px] text-red-400 mb-1">
          Failed to sign out.
        </p>
      )}
      <button 
        onClick={signOut} 
        disabled={pending} 
        className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg border border-dark-700 bg-dark-950 text-gray-400 hover:text-white hover:bg-dark-800 transition-colors disabled:opacity-50"
        title="Sign out"
      >
        <LogOut className="size-4 shrink-0" aria-hidden="true" />
        {!collapsed && <span className="text-sm">{pending ? "Signing out..." : "Sign out"}</span>}
      </button>
    </div>
  );
}
