type StatTileTone = "brand" | "accent" | "neutral";

type StatTileProps = {
  label: string;
  value: number | string;
  tone?: StatTileTone;
};

const toneClasses: Record<StatTileTone, string> = {
  brand: "border-brand-200 bg-brand-50 text-brand-700",
  accent: "border-accent-400/40 bg-accent-400/10 text-accent-600",
  neutral: "border-neutral-200 bg-neutral-0 text-neutral-700",
};

export function StatTile({ label, value, tone = "neutral" }: StatTileProps) {
  return (
    <div className={`flex w-full flex-col items-center gap-1 rounded-xl border p-4 ${toneClasses[tone]}`}>
      <p className="text-sm font-medium uppercase tracking-wide">{label}</p>
      <p className="text-4xl font-bold">{value}</p>
    </div>
  );
}
