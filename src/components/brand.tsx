import { Link } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";

export function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-0 rounded-sm tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring group justify-center ${collapsed ? 'w-full' : 'mt-2'}`}
      aria-label={`${siteConfig.name} home`}
    >
      <div className={`flex shrink-0 items-center justify-center transition-all duration-300 ${collapsed ? 'w-20 h-20' : 'w-[120px] h-[120px]'}`}>
        <img src="/logo.png" alt="NexusCapital" className={`w-full h-full object-contain drop-shadow-md group-hover:drop-shadow-lg group-hover:scale-105 transition-all object-center`} />
      </div>
    </Link>
  );
}
