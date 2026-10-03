import { useState } from "react";
import {
  Check,
  MessageSquarePlus,
  MessageSquare,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConversationSummary } from "./use-assistant-chat";

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const minutes = Math.round((Date.now() - then) / 60_000);

  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;

  const days = Math.round(hours / 24);
  if (days === 1) return "Kemarin";
  if (days < 7) return `${days} hari lalu`;

  return new Date(then).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

type ChatHistoryPanelProps = {
  conversations: ConversationSummary[];
  activeId: string | null;
  isLoading: boolean;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
};

export function ChatHistoryPanel({
  conversations,
  activeId,
  isLoading,
  onSelect,
  onNewChat,
  onDelete,
}: ChatHistoryPanelProps) {
  const [search, setSearch] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const visible = search.trim()
    ? conversations.filter((item) =>
        item.title.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : conversations;

  return (
    <aside className="flex h-full w-full flex-col gap-4 border-dark-800 bg-dark-950/60 p-4">
      <button
        type="button"
        onClick={onNewChat}
        data-testid="assistant-new-chat"
        className="flex w-full items-center gap-2.5 rounded-xl border border-dark-700 bg-dark-900 px-4 py-3 text-left text-sm font-semibold text-white transition-colors hover:border-brand-500/60 hover:bg-dark-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <MessageSquarePlus className="size-4 text-brand-500" />
        Chat Baru
      </button>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari riwayat chat"
          aria-label="Cari riwayat chat"
          className="w-full rounded-xl border border-dark-800 bg-dark-900 py-2.5 pl-9 pr-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-brand-500/60"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          Riwayat
        </p>

        {isLoading ? (
          <p className="px-3 py-2 text-xs text-gray-500">Memuat riwayat…</p>
        ) : visible.length === 0 ? (
          <p className="px-3 py-2 text-xs text-gray-500">
            {search.trim()
              ? "Tidak ada chat yang cocok."
              : "Belum ada riwayat. Mulai chat pertama Anda."}
          </p>
        ) : (
          <ul className="space-y-1">
            {visible.map((item) => {
              const isActive = item.id === activeId;
              const isConfirming = item.id === confirmingId;

              return (
                <li key={item.id}>
                  <div
                    className={cn(
                      "group relative flex items-center gap-2 rounded-xl border transition-colors",
                      isActive
                        ? "border-brand-500/40 bg-brand-500/10"
                        : "border-transparent hover:border-dark-700 hover:bg-dark-900",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmingId(null);
                        onSelect(item.id);
                      }}
                      aria-current={isActive ? "true" : undefined}
                      className="flex min-w-0 flex-1 flex-col items-start gap-0.5 px-3 py-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      <span
                        className={cn(
                          "flex w-full items-center gap-2 truncate text-sm",
                          isActive
                            ? "text-white"
                            : "text-gray-300 group-hover:text-white",
                        )}
                      >
                        <MessageSquare className="size-3.5 shrink-0 text-gray-500" />
                        <span className="truncate">{item.title}</span>
                      </span>
                      <span className="pl-5 text-[11px] text-gray-500">
                        {formatRelativeTime(item.updatedAt)}
                      </span>
                    </button>

                    {isConfirming ? (
                      <span className="flex items-center gap-1 pr-2">
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmingId(null);
                            onDelete(item.id);
                          }}
                          aria-label={`Konfirmasi hapus ${item.title}`}
                          className="rounded-lg p-1.5 text-semantic-bear transition-colors hover:bg-semantic-bear/10"
                        >
                          <Check className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingId(null)}
                          aria-label="Batal hapus"
                          className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-dark-800 hover:text-white"
                        >
                          <X className="size-3.5" />
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmingId(item.id)}
                        aria-label={`Hapus ${item.title}`}
                        className="mr-2 rounded-lg p-1.5 text-gray-500 opacity-0 transition hover:bg-dark-800 hover:text-semantic-bear focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 group-hover:opacity-100"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
