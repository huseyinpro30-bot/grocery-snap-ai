type Props = { score: number; verdict: "buy" | "okay" | "skip" };

const TONE: Record<Props["verdict"], { ring: string; text: string; label: string }> = {
  buy: { ring: "text-leaf", text: "text-leaf", label: "Worth buying" },
  okay: { ring: "text-citrus", text: "text-citrus-foreground", label: "Decent pick" },
  skip: { ring: "text-berry", text: "text-berry", label: "Better options exist" },
};

export function ScoreDial({ score, verdict }: Props) {
  const tone = TONE[verdict];
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-28 w-28 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={r} className="stroke-muted" strokeWidth="8" fill="none" />
          <circle
            cx="50"
            cy="50"
            r={r}
            className={`${tone.ring} transition-[stroke-dashoffset] duration-1000 ease-out`}
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={c - (c * Math.max(0, Math.min(100, score))) / 100}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-semibold">{Math.round(score)}</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">/100</span>
        </div>
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Match score</p>
        <p className={`font-display text-xl font-semibold ${tone.text}`}>{tone.label}</p>
      </div>
    </div>
  );
}
