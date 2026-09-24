import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowUp,
  Bell,
  Bot,
  Brain,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Code,
  CreditCard,
  Menu,
  PieChart,
  Plus,
  Search,
  Settings,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const navItemsWorkspace = [
  { id: "overview", label: "Overview", icon: PieChart, path: "/app" },
  { id: "research", label: "Research Studio", icon: Bot, path: "/research" },
  { id: "valuation", label: "Valuation Screener", icon: Calculator, path: "/valuation" },
  { id: "alerts", label: "Micro-Alerts", icon: Zap, path: "/alerts", badge: "3" },
];

const navItemsIntegration = [
  { id: "api", label: "API Gateway", icon: Code, path: "/api" },
  { id: "billing", label: "Billing", icon: CreditCard, path: "/billing" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];

function LandingPage() {
  const [value, setValue] = useState("");
  const [thinking, setThinking] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-gray-300 font-sans antialiased selection:bg-brand-500 selection:text-white">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex-shrink-0 border-r border-dark-800 bg-dark-900 flex-col z-20 relative transition-all duration-300",
          isCollapsed ? "w-20" : "w-64",
          mobileMenuOpen ? "flex absolute inset-y-0 left-0" : "hidden md:flex"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center px-4 border-b border-dark-800 bg-dark-900/50 backdrop-blur-sm z-10 w-full overflow-hidden">
          <Link to="/" className="inline-flex items-center gap-3 rounded-sm tracking-tight group">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-orange-600 text-white font-bold text-xl shadow-[0_0_10px_rgba(255,122,0,0.3)]">
              N
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold text-white tracking-tight">
                Nexus<span className="text-brand-500">Capital</span>
              </span>
            )}
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 overflow-x-hidden">
          {!isCollapsed && <p className="px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Workspace</p>}
          {isCollapsed && <div className="h-4"></div>}

          {navItemsWorkspace.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "nav-item w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium border relative transition-colors group",
                "text-gray-400 border-transparent hover:text-white hover:bg-dark-800",
                isCollapsed ? "justify-center" : "text-left"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 text-center transition-colors group-hover:text-brand-400" />
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
              </div>
              {!isCollapsed && item.badge && (
                <span className="bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{item.badge}</span>
              )}
              {isCollapsed && item.badge && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-500"></span>
              )}
            </Link>
          ))}

          {!isCollapsed && <p className="px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-8">Integration</p>}
          {isCollapsed && <div className="h-8 border-t border-dark-800/50 mt-4 pt-4"></div>}

          {navItemsIntegration.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium border relative transition-colors group",
                "text-gray-400 border-transparent hover:text-white hover:bg-dark-800",
                isCollapsed ? "justify-center" : "text-left"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon className="w-5 text-center transition-colors group-hover:text-brand-400" />
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          ))}
        </div>

        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-20 bg-dark-800 border border-dark-700 text-gray-400 hover:text-white rounded-full p-1 z-50 hidden md:block"
        >
          {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-dark-800 bg-dark-900 space-y-2">
          <Button asChild variant="ghost" className="w-full text-gray-300 hover:text-white hover:bg-dark-800 justify-start">
            <Link to="/sign-in">Sign In</Link>
          </Button>
          <Button asChild className="w-full bg-brand-500 text-dark-950 font-bold hover:bg-brand-400">
            <Link to="/sign-up">Get Started</Link>
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gradient-to-br from-yellow-400/20 via-yellow-900/15 to-dark-950 relative">
        {/* Ambient Background Glow */}
        <div className="absolute top-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-brand-900/30 blur-[120px] pointer-events-none"></div>

        {/* Header */}
        <header className="h-16 flex-shrink-0 glass border-b border-dark-800 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-gray-400 hover:text-white focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="size-6" />
            </button>


          </div>

          <div className="flex items-center gap-4">
            <button className="relative text-gray-400 hover:text-brand-500 transition-colors">
              <Bell className="size-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-brand-500 rounded-full border-2 border-background animate-pulse-slow"></span>
            </button>
            <Button asChild variant="ghost" className="text-gray-300 hover:text-white hover:bg-dark-800 hidden sm:inline-flex">
              <Link to="/sign-in">Sign In</Link>
            </Button>
            <Button asChild className="bg-brand-500 text-dark-950 font-bold hover:bg-brand-400 hidden sm:inline-flex">
              <Link to="/sign-up">Get Started</Link>
            </Button>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 overflow-y-auto relative z-10 flex flex-col p-4 sm:p-6 lg:p-8">
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-6 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-orange-600 text-white shadow-[0_0_30px_rgba(255,122,0,0.35)]">
              <Sparkles className="size-7" />
            </div>
            <h1 className="max-w-2xl text-2xl font-bold text-white sm:text-3xl">
              Saya siap kapan pun Anda siap.
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Mulai dengan kode emiten atau pertanyaan analisis.
            </p>
          </div>

          <div className="mx-auto w-full max-w-2xl">
            <div className="flex items-center gap-1 rounded-2xl border border-dark-700 bg-dark-900 px-3 py-2 shadow-xl transition-all focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
              <button
                type="button"
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-dark-800 hover:text-white"
                aria-label="Lampirkan"
              >
                <Plus className="size-5" />
              </button>
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Tanyakan apa saja"
                className="flex-1 bg-transparent px-2 py-1.5 text-sm text-white placeholder-gray-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setThinking(!thinking)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  thinking
                    ? "border-brand-500/40 bg-brand-500/10 text-brand-500"
                    : "border-dark-700 text-gray-400 hover:border-dark-600 hover:text-white"
                )}
              >
                <Brain className="size-4" />
                Berpikir
              </button>
              <button
                type="button"
                className="rounded-full bg-brand-500 p-2 text-dark-950 transition-colors hover:bg-brand-400"
                aria-label="Kirim"
              >
                <ArrowUp className="size-5" />
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-gray-600">
              NexusCapital dapat membuat kesalahan. Verifikasi data penting.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
