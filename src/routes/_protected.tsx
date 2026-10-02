import { useState, useEffect } from "react";
import { createFileRoute, Link, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { SignOutButton } from "@/components/sign-out-button";
import { 
  Bot,
  Coins,
  Menu, 
  PieChart, 
  Settings, 
  Zap,
  Bell,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Landmark,
  User,
  Sparkles,
  Activity,
  Star,
  FolderOpen,
} from "lucide-react";
import { cn } from "cn";
import { Brand } from "@/components/brand";

export const Route = createFileRoute("/_protected")({
  beforeLoad: ({ context }) => {
    if (!context.session) throw redirect({ to: "/sign-in" });
    return { session: context.session };
  },
  component: ProtectedLayout,
});

const navItemsWorkspace = [
  { id: "assistant", label: "Nexus Assistant", icon: Sparkles, path: "/assistant" },
  { id: "overview", label: "Overview", icon: PieChart, path: "/app" },
  { id: "research", label: "Research Studio", icon: Bot, path: "/research" },
  { id: "projects", label: "Project Saya", icon: FolderOpen, path: "/projects" },
  { id: "valuation", label: "Valuation Screener", icon: Calculator, path: "/valuation" },
  { id: "ipo", label: "IPO", icon: Landmark, path: "/ipo" },
  { id: "sectors", label: "Sectors Dashboard", icon: Activity, path: "/sectors/banks" },
  { id: "alerts", label: "Micro-Alerts", icon: Zap, path: "/alerts", badge: "3" },
];

const navItemsIntegration = [
  { id: "watchlist", label: "Watchlist", icon: Star, path: "/watchlist" },
  { id: "billing", label: "Billing", icon: Settings, path: "/billing" },
];

type WatchlistNotification = {
  id: string;
  kind: string;
  symbol: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

function ProtectedLayout() {
  const [notifications, setNotifications] = useState<WatchlistNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [recentProjects, setRecentProjects] = useState<
    { id: string; ticker: string; companyName?: string | null }[]
  >([]);
  const unreadCount = notifications.filter((item) => !item.readAt).length;

  useEffect(() => {
    let active = true;
    const loadRecentProjects = async () => {
      try {
        const response = await fetch("/api/research/history");
        const body = (await response.json().catch(() => null)) as {
          data?: { id: string; ticker: string; companyName?: string | null }[];
        } | null;
        if (response.ok && active && body?.data) setRecentProjects(body.data.slice(0, 8));
      } catch {
        return;
      }
    };
    const refreshRecents = () => void loadRecentProjects();
    void loadRecentProjects();
    window.addEventListener("nexus:recents-updated", refreshRecents);
    return () => {
      active = false;
      window.removeEventListener("nexus:recents-updated", refreshRecents);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch("/api/watchlist/notifications");
        const body = (await response.json().catch(() => null)) as {
          data?: WatchlistNotification[];
        } | null;
        if (response.ok && active && body?.data) setNotifications(body.data);
      } catch {
        return;
      }
    };
    const refreshNotifications = () => void load();
    void load();
    const interval = window.setInterval(load, 60_000);
    window.addEventListener("nexus:notifications-updated", refreshNotifications);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("nexus:notifications-updated", refreshNotifications);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch("/api/credits/");
        const body = (await response.json().catch(() => null)) as {
          data?: { credits?: number };
        } | null;
        if (response.ok && active && body?.data)
          setCredits(body.data.credits ?? 0);
      } catch {
        return;
      }
    };
    const refresh = () => void load();
    void load();
    window.addEventListener("nexus:credits-updated", refresh);
    return () => {
      active = false;
      window.removeEventListener("nexus:credits-updated", refresh);
    };
  }, []);

  const handleOpenNotifications = async () => {
    const opening = !showNotifications;
    setShowNotifications(opening);
    if (!opening) return;
    const readAt = new Date().toISOString();
    setNotifications((items) =>
      items.map((item) => ({ ...item, readAt: item.readAt ?? readAt })),
    );
    await fetch("/api/watchlist/notifications", { method: "PATCH" });
  };
  const { user } = Route.useRouteContext().session;
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-gray-300 font-sans antialiased selection:bg-brand-500 selection:text-white">
      {/* Sidebar */}
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <aside className={cn(
        "flex-shrink-0 border-r border-dark-800 bg-dark-900 flex-col z-40 relative transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
        mobileMenuOpen ? "flex fixed inset-y-0 left-0" : "hidden md:flex"
      )}>
        {/* Logo */}
        <div className="h-28 flex items-center justify-center px-4 border-b border-dark-800 bg-dark-900/50 backdrop-blur-sm z-10 w-full overflow-hidden">
          <Brand collapsed={isCollapsed} />
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 overflow-x-hidden">
          {!isCollapsed && <p className="px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Workspace</p>}
          {isCollapsed && <div className="h-4"></div>}
          
          {navItemsWorkspace.map((item) => {
            const isActive = item.path === '/' 
              ? location.pathname === '/' 
              : location.pathname === item.path || (item.path !== '/app' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "nav-item w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium border relative transition-colors group",
                  isActive ? "active text-brand-500 bg-brand-500/10 border-brand-500/20" : "text-gray-400 border-transparent hover:text-white hover:bg-dark-800",
                  isCollapsed ? "justify-center" : "text-left"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-500 rounded-r-full"></div>}
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-5 text-center transition-colors", isActive ? "text-brand-500" : "group-hover:text-brand-400")} />
                  {!isCollapsed && <span className="text-sm">{item.label}</span>}
                </div>
                {!isCollapsed && item.badge && (
                  <span className="bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{item.badge}</span>
                )}
                {isCollapsed && item.badge && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-500"></span>
                )}
              </Link>
            );
          })}

          {recentProjects.length > 0 && !isCollapsed && (
            <div className="mt-8 mb-4 px-3">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent</p>
              <div className="space-y-2">
                {recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    to="/research"
                    search={{ q: project.ticker, fromHistory: true, auto: false }}
                    className="block rounded-lg border border-dark-700 bg-dark-950/80 px-2.5 py-2 text-sm text-gray-300 transition-colors hover:border-brand-500/40 hover:text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-500">
                      {project.ticker}
                    </span>
                    <span className="mt-1 block truncate text-xs text-gray-400">
                      {project.companyName || project.ticker}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {!isCollapsed && <p className="px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-8">Integration</p>}
          {isCollapsed && <div className="h-8 border-t border-dark-800/50 mt-4 pt-4"></div>}
          
          {navItemsIntegration.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium border relative transition-colors group",
                  isActive ? "active text-brand-500 bg-brand-500/10 border-brand-500/20" : "text-gray-400 border-transparent hover:text-white hover:bg-dark-800",
                  isCollapsed ? "justify-center" : "text-left"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-500 rounded-r-full"></div>}
                <item.icon className={cn("w-5 text-center transition-colors", isActive ? "text-brand-500" : "group-hover:text-brand-400")} />
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Toggle Collapse Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-20 bg-dark-800 border border-dark-700 text-gray-400 hover:text-white rounded-full p-1 z-50 hidden md:block"
        >
          {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>

        {/* User Profile Bottom */}
        <div className="p-3 border-t border-dark-800 bg-dark-900">
          <div className="flex flex-col gap-2 relative">
            <div 
              className={cn(
                "flex items-center p-2 rounded-lg hover:bg-dark-800 transition-colors cursor-pointer border border-transparent hover:border-dark-700 group",
                isCollapsed ? "justify-center" : "gap-3"
              )}
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            >
              <img src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=27272A&color=FF7A00&bold=true`} alt="User" className="w-8 h-8 rounded-full border border-dark-700 shrink-0 object-cover" />
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-brand-500 truncate uppercase tracking-wider font-bold">Institutional Pro</p>
                  </div>
                  <MoreVertical className="text-gray-500 size-4 group-hover:text-white transition-colors" />
                </>
              )}
            </div>

            {/* Profile Dropdown Menu */}
            {profileMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setProfileMenuOpen(false)}
                />
                <div className={cn(
                  "absolute z-50 bottom-full mb-2 bg-dark-900 border border-dark-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2",
                  isCollapsed ? "left-full ml-2 w-48" : "left-0 w-full"
                )}>
                  <div className="px-3 py-2 border-b border-dark-800">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <div className="p-1">
                    <Link to="/profile" className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-dark-800 rounded-md transition-colors" onClick={() => setProfileMenuOpen(false)}>
                      <User className="size-4" />
                      Edit Profile
                    </Link>
                    <Link to="/preferences" className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-dark-800 rounded-md transition-colors" onClick={() => setProfileMenuOpen(false)}>
                      <Settings className="size-4" />
                      Preferences
                    </Link>
                  </div>
                  <div className="p-1 border-t border-dark-800">
                    <SignOutButton className="w-full justify-start text-sm px-2 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 h-auto font-normal rounded-md" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background relative">
        {/* Ambient Background Glow and Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,122,0,0.08)_0%,transparent_60%)] pointer-events-none"></div>
        <div className="absolute top-[-10%] left-[25%] w-[50%] h-[40%] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none"></div>

        {/* Header */}
        <header className="h-16 flex-shrink-0 glass border-b border-dark-800 flex items-center justify-between px-4 sm:px-6 z-40 transition-all">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-gray-400 hover:text-white focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="size-6" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {credits !== null && (
              <Link
                to="/billing"
                className={cn(
                  "hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold sm:inline-flex",
                  credits > 0
                    ? "border-brand-500/20 bg-brand-500/10 text-brand-400 hover:bg-brand-500/20"
                    : "border-semantic-bear/20 bg-semantic-bear/10 text-semantic-bear",
                )}
              >
                <Coins className="size-3.5" />
                {credits} credit
              </Link>
            )}
            {/* Status */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-semantic-bull/10 border border-semantic-bull/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
              <div className="w-2 h-2 rounded-full bg-semantic-bull animate-pulse"></div>
              <span className="text-xs font-medium text-semantic-bull/80">Sectors API Connected</span>
            </div>
            <div className="h-6 w-px bg-dark-800 hidden md:block"></div>
            <div className="relative">
              <button 
                onClick={handleOpenNotifications}
                className="relative text-gray-400 hover:text-brand-500 transition-colors p-1"
              >
              <Bell className="size-5" />
              {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-brand-500 rounded-full border-2 border-background animate-ping"></span>
                )}
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-brand-500 rounded-full border-2 border-background"></span>
                )}
            </button>

              {/* Dropdown Notifications */}
              {showNotifications && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-dark-900 border border-dark-800 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-dark-800 flex justify-between items-center bg-dark-950">
                      <h3 className="text-sm font-bold text-white">Notifikasi</h3>
                      <span className="text-[10px] text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-full">{notifications.length} Pesan</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">Tidak ada notifikasi</div>
                      ) : (
                        <div className="divide-y divide-dark-800">
                          {notifications.map((notification) => (
                            <Link
                              key={notification.id}
                              to="/research"
                              search={{ q: notification.symbol, fromHistory: true, auto: false }}
                              onClick={() => setShowNotifications(false)}
                              className={`block p-3 transition-colors hover:bg-dark-800/50 ${!notification.readAt ? "bg-brand-500/5" : ""}`}
                            >
                              <p className={`text-sm ${!notification.readAt ? "font-semibold text-white" : "text-gray-300"}`}>
                                {notification.title}
                              </p>
                              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-gray-400">
                                {notification.body}
                              </p>
                              <p className="mt-1 text-[10px] text-gray-600">
                                {new Intl.DateTimeFormat("id-ID", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                }).format(new Date(notification.createdAt))}
                              </p>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* <div className="border-t border-dark-800 bg-dark-950 p-2 text-center">
                      <Link
                        to="/watchlist"
                        onClick={() => setShowNotifications(false)}
                        className="text-xs text-brand-500 transition-colors hover:text-white"
                      >
                        Kelola Watchlist
                      </Link>
                    </div> */}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
