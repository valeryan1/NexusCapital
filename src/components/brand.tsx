import { Link } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";

export function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-3 rounded-sm tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring group ${collapsed ? 'justify-center w-full' : ''}`}
      aria-label={`${siteConfig.name} home`}
    >
      <div className={`flex shrink-0 items-center justify-center transition-all duration-300 ${collapsed ? 'w-12 h-12' : 'w-[60px] h-[60px]'}`}>
        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow-md group-hover:drop-shadow-lg group-hover:scale-105 transition-all" />
      </div>
      {!collapsed && (
        <span className="text-xl font-bold text-white tracking-tight animate-fade-in">
          Nexus<span className="text-brand-500">Capital</span>
        </span>
      )}
    </Link>
  );
}
