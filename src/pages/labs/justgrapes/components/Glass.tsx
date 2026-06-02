import { cn } from "@/lib/utils";

export const Glass = ({ className, children, onClick }: { className?: string; children: React.ReactNode; onClick?: () => void }) => (
  <div
    onClick={onClick}
    className={cn(
      "rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)]",
      onClick && "cursor-pointer hover:bg-white/[0.07] transition-colors",
      className,
    )}
  >
    {children}
  </div>
);

export const Pill = ({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "violet" | "cyan" | "amber" | "emerald" }) => {
  const tones: Record<string, string> = {
    default: "bg-white/10 text-white/80",
    violet: "bg-violet-500/15 text-violet-200",
    cyan: "bg-cyan-500/15 text-cyan-200",
    amber: "bg-amber-500/15 text-amber-200",
    emerald: "bg-emerald-500/15 text-emerald-200",
  };
  return <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] tracking-wide", tones[tone])}>{children}</span>;
};

export const SectionTitle = ({ eyebrow, title }: { eyebrow?: string; title: string }) => (
  <div className="mb-4">
    {eyebrow && <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1.5">{eyebrow}</div>}
    <h2 className="text-2xl font-serif text-white" style={{ fontFamily: '"Instrument Serif", serif' }}>{title}</h2>
  </div>
);
