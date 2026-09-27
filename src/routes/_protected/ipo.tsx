import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Info,
  Landmark,
  Network,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { siteConfig } from "@/config/site";
import { cn } from "cn";
import { getIdxIpoFeed } from "@/services/ipo.service.server";

const loadUpcomingIposFn = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      return { ...(await getIdxIpoFeed()), error: null };
    } catch {
      return {
        upcoming: [],
        recentListed: [],
        error:
          "Data upcoming IPO tidak dapat dimuat dari BEI. Silakan coba beberapa saat lagi.",
      };
    }
  },
);

export const Route = createFileRoute("/_protected/ipo")({
  head: () => ({
    meta: [
      { title: `Upcoming IPO Radar | ${siteConfig.name}` },
      {
        name: "description",
        content:
          "Jadwal IPO mendatang dan prospektus resmi dari Bursa Efek Indonesia.",
      },
    ],
  }),
  loader: () => loadUpcomingIposFn(),
  component: UpcomingIpoPage,
});

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatNumber(value: number | null) {
  if (value === null) return "Belum dipublikasikan";
  return new Intl.NumberFormat("id-ID").format(value);
}

function formatToday() {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date());
}

function UpcomingIpoPage() {
  const router = useRouter();
  const { upcoming, recentListed, error } = Route.useLoaderData();
  const [showLatestListed, setShowLatestListed] = useState(false);
  const isRefreshing = router.state.isLoading;
  const showingFallback = upcoming.length === 0 && showLatestListed;
  const visibleItems = upcoming.length
    ? upcoming
    : showingFallback
      ? recentListed
      : [];

  return (
    <div className="view-section animate-fade-in mx-auto max-w-7xl space-y-6 pb-12">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-brand-500/20 bg-brand-500/10 p-3 text-brand-500">
            <Network className="size-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Upcoming IPO Radar
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-400">
              Hanya menampilkan perusahaan dengan tanggal pencatatan resmi
              setelah hari ini. Sumber data langsung dari BEI.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-semantic-bull/20 bg-semantic-bull/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-semantic-bull uppercase">
            <span className="size-2 animate-pulse rounded-full bg-semantic-bull" />
            BEI Official Feed
          </span>
          <button
            type="button"
            onClick={() => router.invalidate()}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-full border border-dark-700 bg-dark-900 px-3 py-1.5 text-xs font-semibold text-gray-300 transition-colors hover:border-brand-500/40 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin")} />
            Muat ulang
          </button>
        </div>
      </header>

      {error ? (
        <section
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-semantic-bear/25 bg-semantic-bear/5 p-5"
        >
          <Info className="mt-0.5 size-5 shrink-0 text-semantic-bear" />
          <div>
            <h2 className="font-semibold text-white">Data BEI tidak tersedia</h2>
            <p className="mt-1 text-sm text-gray-400">{error}</p>
          </div>
        </section>
      ) : visibleItems.length === 0 ? (
        <section className="overflow-hidden rounded-2xl border border-dark-800 bg-dark-900 shadow-lg">
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-brand-500/20 blur-2xl" />
              <div className="relative rounded-2xl border border-brand-500/20 bg-brand-500/10 p-4 text-brand-500">
                <Landmark className="size-9" />
              </div>
            </div>
            <span className="mt-6 rounded-full border border-dark-700 bg-dark-950 px-3 py-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Status resmi per {formatToday()}
            </span>
            <h2 className="mt-4 text-xl font-bold text-white sm:text-2xl">
              Belum ada IPO mendatang
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
              BEI belum memublikasikan jadwal pencatatan baru setelah hari
              ini. Karena itu halaman tidak menampilkan perusahaan fiktif atau
              saham yang sudah listing.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {recentListed.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowLatestListed(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-dark-950 transition-colors hover:bg-brand-400"
                >
                  <Landmark className="size-4" />
                  Lihat 3 IPO Terakhir
                </button>
              )}
              <button
                type="button"
                onClick={() => router.invalidate()}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-dark-700 bg-dark-950 px-5 py-2.5 text-sm font-semibold text-gray-200 transition-colors hover:border-brand-500/40 hover:text-white"
              >
                <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
                Periksa BEI lagi
              </button>
            </div>
          </div>
          <div className="grid border-t border-dark-800 sm:grid-cols-3">
            <div className="flex items-center gap-3 border-b border-dark-800 p-4 sm:border-r sm:border-b-0">
              <ShieldCheck className="size-5 text-semantic-bull" />
              <div>
                <p className="text-xs font-semibold text-white">Tanpa data dummy</p>
                <p className="text-[10px] text-gray-500">Hanya jadwal resmi</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-b border-dark-800 p-4 sm:border-r sm:border-b-0">
              <Network className="size-5 text-brand-500" />
              <div>
                <p className="text-xs font-semibold text-white">BEI langsung</p>
                <p className="text-[10px] text-gray-500">Aktivitas pencatatan</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <FileText className="size-5 text-purple-400" />
              <div>
                <p className="text-xs font-semibold text-white">Prospektus asli</p>
                <p className="text-[10px] text-gray-500">Jika telah dipublikasikan</p>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="grid gap-6">
          {showingFallback && (
            <div className="flex flex-col justify-between gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 size-4 shrink-0 text-blue-400" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    Belum ada IPO mendatang
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Menampilkan tiga IPO resmi terbaru yang baru listing.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLatestListed(false)}
                className="text-xs font-semibold text-blue-400 transition-colors hover:text-blue-300"
              >
                Sembunyikan
              </button>
            </div>
          )}
          {visibleItems.map((ipo) => (
            <section
              key={ipo.symbol}
              className="overflow-hidden rounded-2xl border border-dark-800 bg-dark-900 shadow-lg"
            >
              <div className="flex flex-col justify-between gap-4 border-b border-dark-800 bg-dark-950/50 p-5 sm:flex-row sm:items-center lg:p-6">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-brand-500/25 bg-brand-500/10 px-2.5 py-1 font-mono text-sm font-bold text-brand-500">
                      {ipo.symbol}
                    </span>
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase",
                        ipo.isUpcoming
                          ? ipo.isRelisting
                            ? "border-purple-500/20 bg-purple-500/10 text-purple-400"
                            : "border-semantic-bull/20 bg-semantic-bull/10 text-semantic-bull"
                          : "border-blue-500/20 bg-blue-500/10 text-blue-400",
                      )}
                    >
                      {ipo.status}
                    </span>
                  </div>
                  <h2 className="break-words text-xl font-bold text-white">
                    {ipo.companyName}
                  </h2>
                </div>
                <a
                  href={ipo.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-fit items-center gap-2 text-xs font-semibold text-brand-400 transition-colors hover:text-brand-300"
                >
                  Verifikasi di BEI
                  <ExternalLink className="size-3.5" />
                </a>
              </div>

              <div className="grid gap-5 p-5 md:grid-cols-3 lg:p-6">
                <div className="rounded-xl border border-dark-800 bg-dark-950 p-4">
                  <p className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <CalendarDays className="size-4 text-brand-500" />
                    Tanggal Pencatatan
                  </p>
                  <p className="mt-2 font-semibold text-white">
                    {formatDate(ipo.listingDate)}
                  </p>
                </div>
                <div className="rounded-xl border border-dark-800 bg-dark-950 p-4">
                  <p className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <Building2 className="size-4 text-brand-500" />
                    Papan Pencatatan
                  </p>
                  <p className="mt-2 font-semibold text-white">
                    {ipo.board ?? "Belum dipublikasikan"}
                  </p>
                </div>
                <div className="rounded-xl border border-dark-800 bg-dark-950 p-4">
                  <p className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <FileText className="size-4 text-brand-500" />
                    Saham Ditawarkan
                  </p>
                  <p className="mt-2 font-semibold text-white">
                    {formatNumber(ipo.sharesOffered)}
                  </p>
                </div>
              </div>

              <div className="border-t border-dark-800 p-5 lg:p-6">
                {ipo.prospectusUrl ? (
                  <a
                    href={ipo.prospectusUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-bold text-dark-950 transition-all hover:bg-brand-400 sm:w-auto"
                  >
                    <Download className="size-4" />
                    Buka / Unduh Prospektus Resmi
                  </a>
                ) : (
                  <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-gray-300">
                    <Info className="mt-0.5 size-4 shrink-0 text-amber-400" />
                    BEI belum memublikasikan tautan prospektus untuk jadwal ini.
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      <p className="flex items-center justify-center gap-2 text-center text-xs text-gray-600">
        <CheckCircle2 className="size-3.5" />
        Tidak ada data simulasi. Jika upcoming kosong, maksimal tiga IPO resmi terbaru yang ditampilkan.
      </p>
    </div>
  );
}
