import { useState, useRef, useEffect, type FormEvent } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { cn } from "cn";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "Halo! 👋 Saya NexusCapital AI Assistant. Ada yang bisa saya bantu seputar fitur atau layanan kami?",
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim pesan.");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Maaf, terjadi kesalahan. Silakan coba lagi atau hubungi tim kami.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-3 w-[360px] max-w-[calc(100vw-2.5rem)] rounded-2xl border border-dark-700 bg-dark-900 shadow-2xl shadow-black/40 overflow-hidden animate-fade-in flex flex-col"
          style={{ height: "480px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-brand-500/20 to-transparent border-b border-dark-700">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center size-8 rounded-full bg-brand-500/20">
                <Bot className="size-4 text-brand-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white light:text-gray-900">
                  NexusCapital AI
                </p>
                <p className="text-[10px] text-semantic-bull flex items-center gap-1">
                  <span className="inline-block size-1.5 rounded-full bg-semantic-bull animate-pulse" />
                  Online 24/7
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="size-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-dark-800 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2",
                  msg.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0 size-6 rounded-full bg-brand-500/20 flex items-center justify-center mt-0.5">
                    <Bot className="size-3 text-brand-500" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                    msg.role === "user"
                      ? "bg-brand-500 text-white rounded-br-md"
                      : "bg-dark-800 text-white light:text-gray-900 rounded-bl-md border border-dark-700",
                  )}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="flex-shrink-0 size-6 rounded-full bg-dark-700 flex items-center justify-center mt-0.5">
                    <User className="size-3 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="flex-shrink-0 size-6 rounded-full bg-brand-500/20 flex items-center justify-center">
                  <Bot className="size-3 text-brand-500" />
                </div>
                <div className="bg-dark-800 border border-dark-700 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                  <Loader2 className="size-3.5 text-brand-500 animate-spin" />
                  <span className="text-xs text-gray-400">Berpikir...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="px-3 py-3 border-t border-dark-700 bg-dark-900"
          >
            <div className="flex items-center gap-2 bg-dark-800 rounded-xl border border-dark-700 px-3 py-1.5 focus-within:border-brand-500/50 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ketik pesan Anda..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm text-white light:text-gray-900 placeholder:text-gray-500 outline-none py-1"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="size-8 flex items-center justify-center rounded-lg bg-brand-500 text-white hover:bg-brand-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                <Send className="size-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "ml-auto flex items-center justify-center size-14 rounded-full shadow-lg transition-all duration-300",
          isOpen
            ? "bg-dark-800 text-gray-400 hover:text-white border border-dark-700"
            : "bg-brand-500 text-white hover:bg-brand-400 hover:scale-105 shadow-brand-500/30 shadow-xl",
        )}
      >
        {isOpen ? (
          <X className="size-6" />
        ) : (
          <MessageCircle className="size-6" />
        )}
      </button>
    </div>
  );
}
