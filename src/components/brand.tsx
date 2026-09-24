import { Link } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";

export function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      to="/"
      className="flex items-center justify-center w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring group px-2"
      aria-label={`${siteConfig.name} home`}
    >
      <div className={`flex items-center justify-center transition-all duration-300 ${collapsed ? 'w-12 h-12' : 'w-[200px] h-[60px]'}`}>
        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow-md group-hover:drop-shadow-lg transition-all" />
      </div>
    </Link>
  );
}
