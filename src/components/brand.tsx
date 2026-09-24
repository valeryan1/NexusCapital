import { Link } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";

export function Brand({ collapsed = false }: { collapsed?: boolean }) {
  // Jika sidebar dikecilkan (collapsed), kita tampilkan logo dalam bentuk yang terpotong rapi (sebelah kiri/tengah)
  // atau cukup perbesar ruangnya di dalam sidebar kecil agar tidak sekecil debu.
  return (
    <Link
      to="/"
      className="flex items-center justify-center w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring group px-2"
      aria-label={`${siteConfig.name} home`}
    >
      {collapsed ? (
        <div className="flex items-center justify-center w-16 h-16 transition-all duration-300 rounded-lg overflow-hidden bg-white/5 border border-white/10">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-cover object-center drop-shadow-md" />
        </div>
      ) : (
        <div className="flex items-center justify-center w-[200px] h-[60px] transition-all duration-300">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow-md group-hover:drop-shadow-lg transition-all" />
        </div>
      )}
    </Link>
  );
}
