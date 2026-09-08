import { useState } from "react";
import { Mail, ArrowRight, Check } from "lucide-react";

export const BlogSubscribe = ({
  compact,
  sidebar,
}: {
  compact?: boolean;
  sidebar?: boolean;
}) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      const stored = JSON.parse(localStorage.getItem("blog-subscribers") || "[]");
      if (!stored.includes(email.trim())) {
        stored.push(email.trim());
        localStorage.setItem("blog-subscribers", JSON.stringify(stored));
      }
    } catch {
      /* localStorage unavailable */
    }

    setSubmitted(true);
  };

  const pad = sidebar ? "p-4" : compact ? "p-5" : "p-6 md:p-8";

  if (submitted) {
    return (
      <div className={`glass-strong border-gradient rounded-2xl ${pad} text-center`}>
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 mb-3">
          <Check className="w-5 h-5 text-emerald-400" />
        </div>
        <p className="text-sm font-semibold text-depth">You're subscribed!</p>
        <p className="text-xs text-muted-foreground mt-1">
          We'll notify you when new posts go live.
        </p>
      </div>
    );
  }

  if (sidebar) {
    return (
      <div className={`glass-strong border-gradient rounded-2xl ${pad}`}>
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-4 h-4 text-primary" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
            Stay in the loop
          </span>
        </div>
        <p className="text-sm font-bold tracking-tight text-depth leading-tight mb-1.5">
          Get new posts in your inbox.
        </p>
        <p className="text-[11px] text-muted-foreground mb-4">
          No spam. Unsubscribe anytime.
        </p>
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="email"
            required
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors"
          />
          <button
            type="submit"
            className="btn-hero-glass w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Subscribe
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={`glass-strong border-gradient rounded-2xl ${pad}`}>
      <div className={compact ? "" : "flex flex-col md:flex-row md:items-center gap-4 md:gap-6"}>
        <div className={compact ? "mb-4" : "flex-1 mb-4 md:mb-0"}>
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-primary" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-primary">
              Stay in the loop
            </span>
          </div>
          <p className={`${compact ? "text-sm" : "text-base md:text-lg"} font-bold tracking-tight text-depth leading-tight`}>
            Get new posts delivered to your inbox.
          </p>
          {!compact && (
            <p className="text-xs text-muted-foreground mt-1">
              No spam. Unsubscribe anytime.
            </p>
          )}
        </div>
        <form onSubmit={handleSubmit} className={compact ? "" : "md:w-[340px]"}>
          <div className="flex gap-2">
            <input
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors"
            />
            <button
              type="submit"
              className="btn-hero-glass inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0"
            >
              Subscribe
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
