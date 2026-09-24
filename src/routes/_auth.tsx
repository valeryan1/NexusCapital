import { createFileRoute, Outlet, redirect, Link } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/_auth")({
  beforeLoad: ({ context }) => {
    if (context.session) throw redirect({ to: siteConfig.homePath });
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden font-sans selection:bg-brand-500 selection:text-white">
      {/* Background Gradients & Patterns */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <header className="absolute top-0 left-0 right-0 z-10 flex h-24 items-center justify-center px-6">
        <Link to="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="w-16 h-16 flex shrink-0 items-center justify-center transition-all group-hover:scale-105">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow-xl" />
          </div>
          <span className="font-bold text-2xl text-white tracking-tight">Nexus<span className="text-brand-500">Capital</span></span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center relative z-10 px-4 py-20">
        <div className="w-full max-w-md bg-dark-900/80 backdrop-blur-xl border border-dark-800 rounded-2xl p-8 shadow-2xl animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 to-orange-300"></div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
