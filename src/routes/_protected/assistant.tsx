import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { ArrowUp, Brain, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { createServerFn } from "@tanstack/react-start";
import { generateGeminiResponse } from "@/services/ai.service.server";
import ReactMarkdown from "react-markdown";

const askGeminiFn = createServerFn({ method: 'POST' })
  .validator((data: {role: string, content: string}[]) => data)
  .handler(async ({ data }) => {
    return await generateGeminiResponse(data);
  });

export const Route = createFileRoute("/_protected/assistant")({
  component: AssistantPage,
});

function AssistantPage() {
  const [value, setValue] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const handleSend = async () => {
    if (!value.trim() || thinking) return;
    
    const userMessage = value;
    const newMessages: {role: 'user' | 'assistant', content: string}[] = [...messages, { role: 'user', content: userMessage }];
    
    setMessages(newMessages);
    setValue("");
    setThinking(true);
    
    try {
      const response = await askGeminiFn({ data: newMessages });
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Maaf, terjadi kesalahan saat menghubungi AI. Pastikan API key sudah terkonfigurasi dengan benar." }]);
    } finally {
      setThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] w-full flex-col">
      {/* Chat History Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 pb-6 pt-10 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
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
        ) : (
          <div className="mx-auto w-full max-w-3xl space-y-8">
            {messages.map((msg, idx) => (
              <div key={idx} className={cn("flex gap-4 w-full animate-fade-in", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                {msg.role === 'assistant' && (
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-orange-600 text-white shadow-[0_0_20px_rgba(255,122,0,0.3)] mt-1">
                    <Sparkles className="size-5" />
                  </div>
                )}
                <div className={cn(
                  "flex flex-col max-w-[85%] sm:max-w-[75%]",
                  msg.role === 'user' ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "text-[15px] leading-relaxed",
                    msg.role === 'user'
                      ? "bg-dark-800/80 backdrop-blur-sm text-gray-100 rounded-3xl rounded-tr-md px-6 py-4 shadow-sm"
                      : "text-gray-300 py-2"
                  )}>
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown
                        /* eslint-disable @typescript-eslint/no-unused-vars */
                        components={{
                          strong: ({node: _node, ...props}) => <span className="font-semibold text-white" {...props} />,
                          em: ({node: _node, ...props}) => <span className="italic text-gray-400" {...props} />,
                          ul: ({node: _node, ...props}) => <ul className="list-disc pl-5 my-4 space-y-2 marker:text-brand-500/70" {...props} />,
                          ol: ({node: _node, ...props}) => <ol className="list-decimal pl-5 my-4 space-y-2 marker:text-brand-500/70" {...props} />,
                          li: ({node: _node, ...props}) => <li className="pl-1" {...props} />,
                          p: ({node: _node, ...props}) => <p className="mb-4 last:mb-0 leading-relaxed" {...props} />,
                          h1: ({node: _node, ...props}) => <h1 className="text-2xl font-bold text-white mt-6 mb-4" {...props} />,
                          h2: ({node: _node, ...props}) => <h2 className="text-xl font-bold text-white mt-6 mb-3" {...props} />,
                          h3: ({node: _node, ...props}) => <h3 className="text-lg font-semibold text-white mt-5 mb-2" {...props} />,
                          code: ({node: _node, inline, ...props}: {node?: unknown, inline?: boolean} & React.HTMLAttributes<HTMLElement>) => 
                            inline 
                              ? <code className="bg-dark-800/50 text-brand-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                              : <code className="block bg-dark-900 border border-dark-800 p-4 rounded-xl text-sm font-mono overflow-x-auto my-4 text-gray-300" {...props} />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {thinking && (
              <div className="flex gap-4 flex-row w-full animate-fade-in">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-orange-600 text-white shadow-[0_0_20px_rgba(255,122,0,0.3)] mt-1">
                  <Brain className="size-5 animate-pulse" />
                </div>
                <div className="flex items-center gap-2 py-4">
                  <div className="size-2.5 rounded-full bg-brand-500/80 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="size-2.5 rounded-full bg-brand-500/80 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="size-2.5 rounded-full bg-brand-500/80 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="mx-auto w-full max-w-3xl pb-4 px-4 sm:px-0 bg-transparent pt-4">
        <div className="flex items-center gap-2 rounded-2xl border border-dark-700 bg-dark-900/80 backdrop-blur-md px-3 py-2 shadow-xl transition-all focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
          <button
            type="button"
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-dark-800 hover:text-white"
            aria-label="Lampirkan"
          >
            <Plus className="size-5" />
          </button>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik prompt Anda di sini..."
            rows={1}
            className="flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white placeholder-gray-500 outline-none"
            style={{ minHeight: "36px", maxHeight: "200px" }}
          />
          <button
            type="button"
            disabled={!value.trim() || thinking}
            onClick={handleSend}
            className="rounded-full bg-brand-500 p-2 text-dark-950 transition-colors hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Kirim"
          >
            <ArrowUp className="size-5" />
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-gray-600">
          Nexus Assistant dapat membuat kesalahan. Harap verifikasi info penting.
        </p>
      </div>
    </div>
  );
}
