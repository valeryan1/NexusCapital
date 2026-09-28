import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bot, TrendingUp, Zap, Sparkles, Server, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans selection:bg-brand-500 selection:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-20 items-center border-b border-dark-800 glass px-6 transition-all duration-300">
        <div className="flex flex-1 items-center justify-between mx-auto max-w-7xl w-full">
          <Link to="/" className="flex items-center cursor-pointer group">
            <div className="w-[190px] h-[80px] flex items-center justify-center transition-all group-hover:scale-105">
              <img src="/logo.png" alt="NexusCapital" className="w-full h-full object-contain drop-shadow-md" />
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild className="text-gray-300 hover:text-white hover:bg-dark-800 hidden sm:inline-flex">
              <Link to="/sign-in">Sign In</Link>
            </Button>
            <Button asChild className="bg-brand-500 text-dark-950 font-bold hover:bg-brand-400 shadow-[0_0_15px_rgba(255,122,0,0.4)]">
              <Link to="/assistant">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-16 px-6 text-center relative overflow-hidden">
        {/* Background Gradients & Patterns */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80%] max-w-[800px] h-[500px] bg-brand-500/20 rounded-full blur-[120px] pointer-events-none animate-glow"></div>
        
        <div className="mx-auto max-w-5xl space-y-6 relative z-10 animate-fade-in">
          <div className="inline-flex items-center rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm font-medium text-brand-400 shadow-[0_0_15px_rgba(255,122,0,0.1)]">
            <span className="flex size-2 rounded-full bg-brand-500 mr-2 animate-pulse-slow shadow-[0_0_5px_#FF7A00]"></span>
            System v2.0 Operational
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl text-white drop-shadow-md leading-[1.05]">
            Riset Saham Institusional <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-orange-300">
              Bertenaga AI
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg leading-[1.6] text-gray-400 sm:text-xl">
            Mendemokratisasi intelijen finansial. Ubah data mentah IHSG menjadi riset mendalam, Skor Nexus eksklusif, dan <span className="italic">micro-report</span> otomatis hanya dalam <span className="text-white font-medium">~40 detik</span>.
          </p>
          
          {/* Guest Entry */}
          <div className="w-full max-w-3xl mx-auto pt-2 text-left">
            <Link
              to="/assistant"
              className="group relative block"
              aria-label="Buka Nexus Assistant tanpa login"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex flex-col sm:flex-row items-center gap-4 bg-dark-950 border border-dark-700 rounded-2xl p-4 sm:p-5 shadow-2xl group-hover:border-brand-500/40 transition-colors">
                <div className="size-12 shrink-0 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20 shadow-[0_0_15px_rgba(255,122,0,0.1)] group-hover:scale-110 transition-transform">
                  <Sparkles className="size-6" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <span className="block text-lg text-white font-bold">
                    Tanya Nexus AI tentang saham apa pun
                  </span>
                  <span className="block text-sm text-brand-400 mt-1 font-medium">
                    Coba 1x gratis sekarang tanpa perlu buat akun
                  </span>
                </div>
                <span className="flex items-center gap-2 rounded-xl bg-brand-500 text-dark-950 font-bold px-6 py-3.5 transition-colors group-hover:bg-brand-400 w-full sm:w-auto justify-center shadow-[0_0_15px_rgba(255,122,0,0.3)]">
                  Masuk Terminal <ArrowRight className="size-5" />
                </span>
              </div>
            </Link>
            <p className="mt-5 text-center text-xs leading-relaxed text-gray-500">
              Dapatkan 5 token gratis setiap hari dengan mendaftarkan akun.
            </p>
          </div>
        </div>

        {/* Multi-Agent Architecture Section */}
        <div id="architecture" className="mx-auto mt-32 max-w-7xl relative z-10 w-full animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Arsitektur Multi-Agent AI</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Agen AI khusus kami bekerja secara independen untuk menganalisis, menguji sentimen, dan menyintesis data pasar demi menghasilkan riset komprehensif tanpa bias.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left relative">
            {/* Connecting Lines for Desktop */}
            <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-emerald-500 via-dark-700 to-purple-500 -z-10 opacity-30 transform -translate-y-1/2"></div>
            
            {/* Agent 1 */}
            <div className="flex flex-col space-y-4 rounded-2xl border border-dark-800 bg-dark-900/80 backdrop-blur-sm p-8 shadow-sm transition-all hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] group">
              <div className="flex size-14 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                <Server className="size-7" />
              </div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Agent 1 <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">FUNDAMENTAL</span>
              </h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Menganalisis laporan keuangan, tren pendapatan, dan metrik valuasi via Sectors API untuk menentukan nilai intrinsik jangka panjang.
              </p>
            </div>
            
            {/* Agent 2 */}
            <div className="flex flex-col space-y-4 rounded-2xl border border-dark-800 bg-dark-900/80 backdrop-blur-sm p-8 shadow-sm transition-all hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] group md:-translate-y-4">
              <div className="flex size-14 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                <TrendingUp className="size-7" />
              </div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Agent 2 <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">TEKNIKAL & BANDAR</span>
              </h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Mengevaluasi aksi harga, support/resistance, lonjakan volume, serta metrik akumulasi/distribusi untuk *timing* masuk yang tepat.
              </p>
            </div>

            {/* Agent 3 (Orchestrator) */}
            <div className="flex flex-col space-y-4 rounded-2xl border border-brand-500/30 bg-dark-900/90 backdrop-blur-md p-8 shadow-[0_0_20px_rgba(255,122,0,0.1)] transition-all hover:border-brand-500 hover:shadow-[0_0_40px_rgba(255,122,0,0.2)] group md:translate-y-2">
              <div className="flex size-14 items-center justify-center rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-500 group-hover:scale-110 transition-transform">
                <Bot className="size-7" />
              </div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Agent 3 <span className="text-[10px] font-mono text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">ORCHESTRATOR</span>
              </h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Menyintesis temuan Agen 1 & 2, mengalkulasi Skor Nexus akhir, serta memproduksi laporan PDF terstruktur sekelas analis profesional.
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mx-auto mt-24 max-w-7xl grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left relative z-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-start gap-4 p-6 rounded-2xl border border-dark-800 bg-dark-950/50 hover:bg-dark-900 transition-colors">
            <div className="p-3 rounded-lg bg-dark-800 text-gray-300">
              <ShieldAlert className="size-6" />
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">Micro-Report Otomatis</h4>
              <p className="text-sm text-gray-500">Sistem terus memantau pergerakan pasar. Dapatkan notifikasi dan analisis instan saat indikator teknikal penting tersentuh.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-6 rounded-2xl border border-dark-800 bg-dark-950/50 hover:bg-dark-900 transition-colors">
            <div className="p-3 rounded-lg bg-dark-800 text-gray-300">
              <Sparkles className="size-6" />
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">Skor Nexus Eksklusif</h4>
              <p className="text-sm text-gray-500">Sistem skor 1-100 yang menggabungkan faktor Fundamental, Teknikal, dan Risiko. Bandingkan saham dengan mudah dan cepat.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 rounded-2xl border border-dark-800 bg-dark-950/50 hover:bg-dark-900 transition-colors">
            <div className="p-3 rounded-lg bg-dark-800 text-gray-300">
              <Zap className="size-6" />
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">Gateway API B2B</h4>
              <p className="text-sm text-gray-500">Bangun solusi White-label atau integrasikan data riset PDF AI kami langsung ke platform atau sekuritas milik Anda.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-800 bg-dark-950 py-8 text-center text-sm text-gray-500 relative z-10">
        <p>&copy; {new Date().getFullYear()} NexusCapital. All rights reserved.</p>
        <p className="mt-2 text-xs opacity-60">Disclaimer: This platform provides AI-generated analysis and is not financial advice.</p>
      </footer>
    </div>
  );
}
