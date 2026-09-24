import { Link } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";

export function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-3 rounded-sm tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring group"
      aria-label={`${siteConfig.name} home`}
    >
      <div className="flex size-9 shrink-0 items-center justify-center transition-all duration-300">
        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
      </div>
      {!collapsed && (
        <span className="text-xl font-bold text-white tracking-tight animate-fade-in">
          Nexus<span className="text-brand-500">Capital</span>
        </span>
      )}
    </Link>
  );
}
