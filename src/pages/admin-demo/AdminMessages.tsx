import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPage } from "@/components/admin/AdminPage";
import { adminThreads } from "@/data/admin";
import { cn } from "@/lib/utils";

export default function AdminMessages() {
  const [activeId, setActiveId] = useState(adminThreads[0]?.id);
  const active = adminThreads.find((t) => t.id === activeId);

  return (
    <AdminPage
      eyebrow="Messages"
      title="Conversations"
      description="Every active client thread, assigned to your team."
    >
      <div className="glass rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-[320px_1fr] min-h-[520px]">
        <ul className="border-b lg:border-b-0 lg:border-r border-white/[0.06] divide-y divide-white/[0.04] max-h-[520px] overflow-y-auto">
          {adminThreads.map((t) => {
            const isActive = t.id === activeId;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(t.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 transition-colors",
                    isActive ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"
                  )}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-medium truncate">{t.client}</p>
                    <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                      {t.lastAt}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{t.subject}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                      {t.assigned}
                    </p>
                    {t.unread > 0 && (
                      <span className="px-1.5 h-4 rounded-md font-mono text-[11px] flex items-center bg-secondary/20 border border-secondary/30 text-secondary">
                        {t.unread}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col">
          {active ? (
            <>
              <div className="px-5 py-4 border-b border-white/[0.06]">
                <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-1">
                  // {active.client}
                </p>
                <h2 className="text-base font-semibold">{active.subject}</h2>
              </div>
              <div className="flex-1 px-5 py-4 space-y-4 overflow-y-auto">
                <Bubble side="them" name={active.client} time={active.lastAt}>
                  {active.preview}
                </Bubble>
                <Bubble side="us" name={active.assigned} time="just now">
                  Thanks — taking a look now and I'll have a fix shortly.
                </Bubble>
              </div>
              <div className="p-4 border-t border-white/[0.06] flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a reply…"
                  className="flex-1 h-10 px-3 rounded-md bg-white/[0.03] border border-white/[0.06] text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
                />
                <Button variant="hero" size="sm">
                  <Send className="w-3.5 h-3.5" />
                  Send
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              Select a thread
            </div>
          )}
        </div>
      </div>
    </AdminPage>
  );
}

const Bubble = ({
  side,
  name,
  time,
  children,
}: {
  side: "us" | "them";
  name: string;
  time: string;
  children: React.ReactNode;
}) => (
  <div className={cn("flex flex-col", side === "us" ? "items-end" : "items-start")}>
    <div
      className={cn(
        "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm",
        side === "us"
          ? "bg-primary/10 border border-primary/20 text-foreground"
          : "bg-white/[0.04] border border-white/[0.06]"
      )}
    >
      {children}
    </div>
    <p className="font-mono text-[11px] text-muted-foreground mt-1">
      {name} · {time}
    </p>
  </div>
);
