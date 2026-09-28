import { Link } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";

export function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-0 rounded-sm tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring group justify-center ${collapsed ? 'w-full' : 'mt-2'}`}
      aria-label={`${siteConfig.name} home`}
    >
      {/* logo.png is 767x325, so the box must stay wide or object-contain shrinks it */}
      <div className={`flex shrink-0 items-center justify-center transition-all duration-300 ${collapsed ? 'w-16 h-7' : 'w-[190px] h-[80px]'}`}>
        <img src="/logo.png" alt="NexusCapital" className={`w-full h-full object-contain drop-shadow-md group-hover:drop-shadow-lg group-hover:scale-105 transition-all object-center`} />
      </div>
    </Link>
  );
}
