import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { MessageSquare, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import vorturaLogo from "@/assets/vortura-logo.png";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(24); // 24px = bottom-6
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  // Lift the widget just enough to clear the footer as it scrolls into view.
  // The lift is capped so that on short pages (login, contact) — where the
  // footer is visible near the top — the orb stays anchored in the bottom-right
  // corner instead of drifting up over form fields and card content.
  useEffect(() => {
    const updateOffset = () => {
      const footer = document.querySelector("footer");
      if (!footer) return;
      const rect = footer.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const base = 24;
      const gap = 16;
      const maxLift = 96; // never rise more than this above the resting corner
      const orbBaseline = viewportH - base; // orb's bottom edge at rest
      const intrusion = orbBaseline - rect.top; // >0 once the footer reaches the orb
      const lift = Math.max(0, Math.min(intrusion + gap, maxLift));
      setBottomOffset(base + lift);
    };
    updateOffset();
    window.addEventListener("scroll", updateOffset, { passive: true });
    window.addEventListener("resize", updateOffset);
    return () => {
      window.removeEventListener("scroll", updateOffset);
      window.removeEventListener("resize", updateOffset);
    };
  }, []);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Msg = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m,
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (resp.status === 429) {
        toast.error("Too many requests. Please wait a moment.");
        setIsLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast.error("AI credits exhausted. Please add funds.");
        setIsLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error("Failed to start stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            /* ignore */
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
      setMessages((prev) => prev.filter((_, i) => i !== prev.length - 1 || prev[i].role !== "assistant" || prev[i].content !== ""));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating orb button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={() => setOpen(true)}
            aria-label="Open AI chat"
            style={{ bottom: `${bottomOffset}px` }}
            className="fixed right-4 sm:right-5 z-50 group transition-[bottom] duration-300 ease-out"
          >
            {/* Outer pulsing glow */}
            <span className="absolute inset-0 rounded-full bg-gradient-primary blur-2xl opacity-70 animate-glow-pulse" />
            <span className="absolute -inset-2 rounded-full bg-gradient-primary blur-xl opacity-40 group-hover:opacity-70 transition-opacity" />
            {/* Orb */}
            <span className="relative flex items-center justify-center w-14 h-14 sm:w-12 sm:h-12 rounded-full bg-gradient-primary shadow-glow-blue group-hover:scale-110 transition-transform duration-300">
              <span className="absolute inset-0.5 rounded-full bg-background/20 backdrop-blur-sm" />
              <Sparkles className="relative w-6 h-6 sm:w-5 sm:h-5 text-white" strokeWidth={2.2} />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ bottom: `${bottomOffset}px` }}
            className="fixed right-3 left-3 sm:left-auto sm:right-5 z-50 w-auto sm:w-[340px] h-[70vh] max-h-[calc(100vh-2.5rem)] sm:h-[480px] flex flex-col transition-[bottom] duration-300 ease-out"
          >
            <div className="absolute -inset-px rounded-3xl bg-gradient-primary opacity-40 blur-md pointer-events-none" />
            <div className="relative flex flex-col flex-1 glass-strong rounded-3xl overflow-hidden border-2 border-white/15">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="absolute inset-0 rounded-full bg-gradient-primary blur-md opacity-60" />
                    <img src={vorturaLogo} alt="VORTURA logo" className="relative w-7 h-7 rounded-md" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs tracking-tight">VORTURA<span className="text-primary">.</span>ai</p>
                    <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">AI Assistant · Online</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="relative mb-3">
                      <span className="absolute inset-0 rounded-full bg-gradient-primary blur-xl opacity-50 animate-glow-pulse" />
                      <div className="relative w-11 h-11 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-blue">
                        <MessageSquare className="w-5 h-5 text-primary-foreground" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm mb-1.5 text-depth">How can I help?</h3>
                    <p className="text-xs text-muted-foreground mb-4 max-w-[240px]">
                      Ask me anything about VORTURA.ai, AI automation, or your business.
                    </p>
                    <div className="flex flex-col gap-1.5 w-full max-w-[260px]">
                      {[
                        "What services do you offer?",
                        "How does the process work?",
                        "Can AI really save me time?",
                      ].map((s) => (
                        <button
                          key={s}
                          onClick={() => setInput(s)}
                          className="text-[11px] text-left px-3 py-2 rounded-lg glass hover:border-primary/40 hover:bg-white/[0.06] transition-colors text-muted-foreground hover:text-foreground"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                        m.role === "user"
                          ? "bg-gradient-primary text-white rounded-br-md"
                          : "glass rounded-bl-md text-foreground"
                      }`}
                    >
                      {m.role === "assistant" ? (
                        <div className="prose prose-sm prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0 prose-headings:my-2 prose-pre:my-2 prose-a:text-primary">
                          <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                        </div>
                      ) : (
                        m.content
                      )}
                    </div>
                  </motion.div>
                ))}

                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex justify-start">
                    <div className="glass rounded-2xl rounded-bl-md px-3 py-2.5">
                      <div className="flex gap-1">
                        <span className="w-1 h-1 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1 h-1 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1 h-1 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <form onSubmit={send} className="p-2.5 border-t border-white/10 flex gap-1.5">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  disabled={isLoading}
                  className="flex-1 min-w-0 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-base sm:text-xs focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60 disabled:opacity-50 transition-all"
                />
                <Button
                  type="submit"
                  variant="hero"
                  size="default"
                  disabled={!input.trim() || isLoading}
                  className="rounded-lg flex-shrink-0 px-3.5 h-11 sm:h-9"
                  aria-label="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};