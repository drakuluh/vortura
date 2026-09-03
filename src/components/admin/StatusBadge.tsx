import { cn } from "@/lib/utils";

type Tone = "primary" | "secondary" | "success" | "warn" | "danger" | "muted";

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary/10 border-primary/30 text-primary",
  secondary: "bg-secondary/10 border-secondary/30 text-secondary",
  success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  warn: "bg-amber-500/10 border-amber-500/30 text-amber-300",
  danger: "bg-red-500/10 border-red-500/30 text-red-400",
  muted: "bg-white/[0.04] border-white/10 text-muted-foreground",
};

interface Props {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}

export const StatusBadge = ({ tone = "muted", children, className }: Props) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-[10px] uppercase tracking-widest border",
      toneClasses[tone],
      className
    )}
  >
    {children}
  </span>
);
