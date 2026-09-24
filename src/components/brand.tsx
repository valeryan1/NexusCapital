import { Link } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";

export function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-3 rounded-sm tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring group"
      aria-label={`${siteConfig.name} home`}
    >
      <div className={`flex shrink-0 items-center justify-center rounded-lg overflow-hidden shadow-[0_0_10px_rgba(255,122,0,0.3)] group-hover:shadow-[0_0_15px_rgba(255,122,0,0.5)] transition-all duration-300 ${collapsed ? 'w-10 h-10' : 'w-36 h-12'}`}>
        <img src="/logo.jpeg" alt="Logo" className={`w-full h-full ${collapsed ? 'object-cover' : 'object-contain'}`} />
      </div>
    </Link>
  );
}
