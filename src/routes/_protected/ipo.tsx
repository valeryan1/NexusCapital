import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  CalendarDays,
  ExternalLink,
  FileText,
  Info,
  Landmark,
  LoaderCircle,
  Minus,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/config/site";
import { cn } from "cn";
import { ipoSymbols, type IpoPerformance } from "@/validators/ipo";

export const Route = createFileRoute("/_protected/ipo")({
  head: () => ({ meta: [{ title: `IPO | ${siteConfig.name}` }] }),
  component: IpoPage,
});

type RequestStatus = "idle" | "loading" | "success" | "error";

type ApiPayload = {
  data?: IpoPerformance;
  error?: { message?: string };
};

const supportedSymbols = new Set<string>(ipoSymbols);

const changeFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 5,
});
const integerFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});
const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const shareFormatter = new Intl.NumberFormat("id-ID", {
  style: "percent",
  maximumFractionDigits: 4,
});

function formatChange(value: number | null) {
  if (value === null) return "Belum tersedia";
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${changeFormatter.format(value)}%`;
}

function formatDate(value: string | null) {
  if (!value) return "Belum tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatDateRange(start: string | null, end: string | null) {
  if (!start || !end) return "Belum tersedia";
  return `${formatDate(start)} — ${formatDate(end)}`;
}

function formatPriceRange(lower: number | null, upper: number | null) {
  if (lower === null || upper === null) return "Belum tersedia";
  return `${currencyFormatter.format(lower)} — ${currencyFormatter.format(upper)}`;
}

function formatShares(value: number | null) {
  if (value === null) return "Belum tersedia";
  return `${integerFormatter.format(value)} saham`;
}

function getChangeTone(value: number | null) {
  if (value === null || value === 0)
    return {
      card: "border-dark-800 bg-dark-950",
      value: "text-gray-300",
      icon: "bg-dark-800 text-gray-400",
    };
  if (value > 0)
    return {
      card: "border-semantic-bull/25 bg-semantic-bull/5",
      value: "text-semantic-bull",
      icon: "bg-semantic-bull/10 text-semantic-bull",
    };
  return {
    card: "border-semantic-bear/25 bg-semantic-bear/5",
    value: "text-semantic-bear",
    icon: "bg-semantic-bear/10 text-semantic-bear",
  };
}

function PerformanceCard({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  const tone = getChangeTone(value);
  const Icon =
    value !== null && value > 0
      ? TrendingUp
      : value !== null && value < 0
        ? TrendingDown
        : Minus;

  return (
    <div className={cn("rounded-xl border p-4", tone.card)}>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-[0.16em] text-gray-500 uppercase">
          {label}
        </span>
        <span className={cn("rounded-lg p-2", tone.icon)}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className={cn("font-mono text-xl font-bold", tone.value)}>
        {formatChange(value)}
      </p>
      <p className="mt-1 text-[10px] text-gray-500">
        Perubahan sejak tanggal listing
      </p>
    </div>
  );
}

function DetailItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="border-b border-dark-800 py-3 last:border-0">
      <dt className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 break-words text-sm text-gray-200",
          mono && "font-mono",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function DocumentLink({ href, label }: { href: string | null; label: string }) {
  if (!href)
    return (
      <div className="flex items-center justify-between rounded-lg border border-dark-800 bg-dark-950 p-3 text-sm text-gray-500">
        <span>{label}</span>
        <span className="text-[10px] uppercase">Tidak tersedia</span>
      </div>
    );

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center justify-between rounded-lg border border-dark-800 bg-dark-950 p-3 text-sm text-gray-300 transition-colors hover:border-brand-500/40 hover:bg-brand-500/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <span className="flex items-center gap-2">
        <FileText className="size-4 text-gray-500 group-hover:text-brand-500" />
        {label}
      </span>
      <ExternalLink className="size-3.5 text-gray-600 group-hover:text-brand-500" />
    </a>
  );
}

function IpoPage() {
  const [symbol, setSymbol] = useState("BREN");
  const [data, setData] = useState<IpoPerformance | null>(null);
  const [status, setStatus] = useState<RequestStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedSymbol = symbol.trim().toUpperCase();
    if (!supportedSymbols.has(normalizedSymbol)) {
      setData(null);
      setStatus("error");
      setErrorMessage(`Pilih salah satu simbol: ${ipoSymbols.join(", ")}.`);
      return;
    }

    setSymbol(normalizedSymbol);
    setData(null);
    setErrorMessage("");
    setStatus("loading");

    try {
      const response = await fetch(
        `/api/ipo/?symbol=${encodeURIComponent(normalizedSymbol)}`,
        { headers: { Accept: "application/json" } },
      );
      const payload = (await response
        .json()
        .catch(() => null)) as ApiPayload | null;
      if (!response.ok) {
        setErrorMessage(
          payload?.error?.message ?? "Data IPO tidak dapat dimuat. Coba lagi.",
        );
        setStatus("error");
        return;
      }
      if (!payload?.data) {
        setErrorMessage("Respons data IPO tidak lengkap.");
        setStatus("error");
        return;
      }
      setData(payload.data);
      setStatus("success");
    } catch {
      setErrorMessage("Tidak dapat terhubung ke layanan data IPO.");
      setStatus("error");
    }
  };

  return (
    <div className="view-section animate-fade-in mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-brand-500/20 bg-brand-500/10 p-3 text-brand-500">
            <Landmark className="size-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">IPO Monitor</h1>
            <p className="text-sm text-gray-400">
              Data offering dan performa saham sejak listing dari Sectors API.
            </p>
          </div>
        </div>
        <span className="w-fit rounded-full border border-dark-700 bg-dark-900 px-3 py-1.5 font-mono text-[10px] tracking-wider text-gray-400 uppercase">
          IDX • Listing Performance
        </span>
      </header>

      <section className="rounded-xl border border-dark-800 bg-dark-900 p-5 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 border-b border-dark-800 pb-4">
            <Search className="size-4 text-brand-500" aria-hidden="true" />
            <h2 className="text-base font-semibold text-white">
              Cari Saham IPO
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <label
                htmlFor="ipo-symbol"
                className="mb-1.5 block text-xs font-medium text-gray-400"
              >
                Simbol IDX
              </label>
              <Input
                id="ipo-symbol"
                value={symbol}
                onChange={(event) =>
                  setSymbol(event.target.value.toUpperCase())
                }
                placeholder="BREN"
                maxLength={4}
                list="ipo-symbol-options"
                autoComplete="off"
                className="h-11 border-dark-700 bg-dark-950 font-mono uppercase text-white placeholder:text-gray-700 focus-visible:border-brand-500 focus-visible:ring-brand-500/20"
              />
              <datalist id="ipo-symbol-options">
                {ipoSymbols.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>
            <Button
              type="submit"
              disabled={status === "loading"}
              className="h-11 self-end bg-brand-500 px-5 font-bold text-dark-950 shadow-[0_0_15px_rgba(255,122,0,0.2)] hover:bg-brand-400 hover:shadow-[0_0_22px_rgba(255,122,0,0.35)]"
            >
              {status === "loading" ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              ) : (
                <Search aria-hidden="true" />
              )}
              {status === "loading" ? "Memuat Data" : "Muat Data IPO"}
            </Button>
          </div>
          <div className="space-y-3 border-t border-dark-800 pt-3">
            <div className="flex flex-col gap-1 text-[10px] text-gray-500 sm:flex-row sm:items-center sm:justify-between">
              <p>Pilih ticker dari daftar IPO yang tersedia.</p>
              <p>Setiap pencarian berhasil menggunakan 1 kredit API.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
                Pilihan cepat
              </span>
              {ipoSymbols.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={symbol === item}
                  onClick={() => {
                    setSymbol(item);
                    setErrorMessage("");
                    if (status === "error") setStatus("idle");
                  }}
                  className={cn(
                    "rounded-md border px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                    symbol === item
                      ? "border-brand-500/40 bg-brand-500/10 text-brand-500"
                      : "border-dark-700 bg-dark-950 text-gray-400 hover:border-brand-500/30 hover:text-white",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </form>
      </section>

      {status === "idle" && (
        <section className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-dark-800 bg-dark-900/30 px-6 text-center">
          <div className="mb-4 rounded-2xl border border-dark-800 bg-dark-900 p-4 text-gray-500">
            <Landmark className="size-8" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-semibold text-white">
            Mulai dengan simbol IDX
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-gray-500">
            Masukkan ticker untuk melihat jadwal book building, harga offering,
            jumlah saham, dan perubahan performa setelah IPO.
          </p>
        </section>
      )}

      {status === "loading" && (
        <section
          role="status"
          aria-live="polite"
          className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dark-800 bg-dark-900/30"
        >
          <LoaderCircle className="mb-4 size-8 animate-spin text-brand-500" />
          <p className="text-sm font-medium text-gray-300">
            Mengambil data dari Sectors API...
          </p>
          <p className="mt-1 text-xs text-gray-500">Mohon tunggu sebentar.</p>
        </section>
      )}

      {status === "error" && (
        <section
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-semantic-bear/25 bg-semantic-bear/5 p-5"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-semantic-bear" />
          <div>
            <h2 className="font-semibold text-white">
              Data IPO tidak dapat dimuat
            </h2>
            <p className="mt-1 text-sm text-gray-400">{errorMessage}</p>
          </div>
        </section>
      )}

      {status === "success" && data && (
        <div data-testid="ipo-result" className="space-y-6">
          <section className="overflow-hidden rounded-xl border border-dark-800 bg-dark-900">
            <div className="flex flex-col justify-between gap-4 border-b border-dark-800 p-5 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-brand-500/25 bg-brand-500/10 px-2.5 py-1 font-mono text-sm font-bold text-brand-500">
                    {data.symbol}
                  </span>
                  <span className="rounded-md border border-semantic-bull/20 bg-semantic-bull/5 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-semantic-bull uppercase">
                    Sectors API • 200
                  </span>
                </div>
                <h2 className="break-words text-xl font-bold text-white">
                  {data.company_name ?? "Nama perusahaan tidak tersedia"}
                </h2>
              </div>
              <div className="shrink-0 text-left sm:text-right">
                <p className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
                  Harga Offering
                </p>
                <p className="mt-1 font-mono text-2xl font-bold text-brand-500">
                  {data.offering_price === null
                    ? "Belum tersedia"
                    : currencyFormatter.format(data.offering_price)}
                </p>
              </div>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
              <PerformanceCard label="7 Hari" value={data.chg_7d} />
              <PerformanceCard label="30 Hari" value={data.chg_30d} />
              <PerformanceCard label="90 Hari" value={data.chg_90d} />
              <PerformanceCard label="365 Hari" value={data.chg_365d} />
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-12">
            <section className="rounded-xl border border-dark-800 bg-dark-900 p-5 lg:col-span-5">
              <div className="mb-4 flex items-center gap-2 border-b border-dark-800 pb-4">
                <Info className="size-4 text-brand-500" aria-hidden="true" />
                <h2 className="text-base font-semibold text-white">
                  Ringkasan Offering
                </h2>
              </div>
              <dl>
                <DetailItem label="Simbol" value={data.symbol} mono />
                <DetailItem
                  label="Jumlah Saham Offering"
                  value={formatShares(data.shares_offered)}
                  mono
                />
                <DetailItem
                  label="Porsi dari Total Saham"
                  value={
                    data.percent_total_shares === null
                      ? "Belum tersedia"
                      : `${shareFormatter.format(data.percent_total_shares)} (nilai API: ${changeFormatter.format(data.percent_total_shares)})`
                  }
                  mono
                />
                <DetailItem
                  label="Rentang Book Building"
                  value={formatPriceRange(
                    data.book_building_lower_bound,
                    data.book_building_upper_bound,
                  )}
                  mono
                />
                <DetailItem
                  label="Harga Offering"
                  value={
                    data.offering_price === null
                      ? "Belum tersedia"
                      : currencyFormatter.format(data.offering_price)
                  }
                  mono
                />
                <DetailItem
                  label="Tanggal Listing"
                  value={formatDate(data.listing_date)}
                />
                <DetailItem
                  label="Tanggal Distribusi"
                  value={formatDate(data.distribution_date)}
                />
              </dl>
            </section>

            <div className="space-y-6 lg:col-span-7">
              <section className="rounded-xl border border-dark-800 bg-dark-900 p-5">
                <div className="mb-5 flex items-center gap-2 border-b border-dark-800 pb-4">
                  <CalendarDays
                    className="size-4 text-brand-500"
                    aria-hidden="true"
                  />
                  <h2 className="text-base font-semibold text-white">
                    Timeline Penawaran
                  </h2>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      label: "Book Building",
                      value: formatDateRange(
                        data.book_building_start_date,
                        data.book_building_end_date,
                      ),
                    },
                    {
                      label: "Public Offering",
                      value: formatDateRange(
                        data.offering_start_date,
                        data.offering_end_date,
                      ),
                    },
                    {
                      label: "Distribusi Saham",
                      value: formatDate(data.distribution_date),
                    },
                    {
                      label: "Listing di IDX",
                      value: formatDate(data.listing_date),
                    },
                  ].map((item, index) => (
                    <div
                      key={item.label}
                      className="grid grid-cols-[auto_1fr] gap-3"
                    >
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            "mt-1 size-2.5 rounded-full ring-4",
                            index === 3
                              ? "bg-semantic-bull ring-semantic-bull/10"
                              : "bg-brand-500 ring-brand-500/10",
                          )}
                        />
                        {index < 3 && (
                          <span className="mt-1 h-full w-px bg-dark-700" />
                        )}
                      </div>
                      <div className="pb-2">
                        <p className="text-xs font-medium text-gray-500">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm text-gray-200">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-dark-800 bg-dark-900 p-5">
                <div className="mb-4 flex items-center gap-2 border-b border-dark-800 pb-4">
                  <FileText
                    className="size-4 text-brand-500"
                    aria-hidden="true"
                  />
                  <h2 className="text-base font-semibold text-white">
                    Dokumen IPO
                  </h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DocumentLink href={data.prospectus_url} label="Prospectus" />
                  <DocumentLink
                    href={data.additional_info_url}
                    label="Informasi Tambahan"
                  />
                </div>
              </section>
            </div>
          </div>

          <p className="flex items-start gap-2 rounded-lg border border-dark-800 bg-dark-900/50 p-3 text-[10px] leading-5 text-gray-500">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Sumber data: Sectors Financial API v2. Data listing tersedia untuk
            saham yang tercatat setelah Mei 2005. Nilai mengikuti respons API
            dan dapat berubah ketika penyedia memperbarui datanya.
          </p>
        </div>
      )}
    </div>
  );
}
