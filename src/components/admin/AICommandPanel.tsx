import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SEED_MESSAGES: Message[] = [
  {
    id: "m1",
    role: "user",
    content: "Which clients are based in Toronto?",
  },
  {
    id: "m2",
    role: "assistant",
    content:
      "Found **3 active clients** in Toronto:\n\n- **Northwind Studios** — $4,200/mo · Growth plan\n- **Lakeside Robotics** — $2,850/mo · Core plan\n- **Maple & Co.** — $1,500/mo · Starter plan\n\nCombined MRR: **$8,550/mo**. Want me to open the client list filtered to Toronto?",
  },
];

const STARTER_CHIPS = [
  "Check overdue invoices",
  "Summarize open tasks",
  "Top clients by MRR",
  "Recent change requests",
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export const AICommandPanel = ({ open, onClose }: Props) => {
  const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: trimmed },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Working on it… (mock response — live AI coming soon).",
      },
    ]);
    setInput("");
  };

  return (
    <>
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-[380px] max-w-[92vw] flex flex-col",
          "bg-[#1c1c26] border-l border-white/[0.08]",
          "shadow-[-12px_0_40px_-8px_rgba(0,0,0,0.85)] transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold tracking-tight">Vortura Command Assistant</h2>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">
                  System Sync Active
                </span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Starter chips */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {STARTER_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => send(chip)}
                className="px-2.5 py-1 text-[11px] rounded-full border border-white/[0.08] bg-white/[0.02] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-3.5 py-2 text-[13px] leading-relaxed">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex justify-start">
                <div className="max-w-[90%] text-[13px] leading-relaxed text-foreground/90 prose prose-invert prose-sm prose-p:my-1 prose-ul:my-1.5 prose-li:my-0.5 prose-strong:text-foreground">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            ),
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="border-t border-white/[0.06] p-3 flex items-center gap-2 bg-background/80"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about Vortura's operations..."
            className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/40"
          />
          <Button type="submit" size="icon" variant="hero" aria-label="Send">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </aside>
    </>
  );
};