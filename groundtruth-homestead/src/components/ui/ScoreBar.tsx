export function ScoreBar({
  label,
  score,
  max = 100,
}: {
  label: string;
  score: number;
  max?: number;
}) {
  const pct = Math.max(0, Math.min(100, (score / max) * 100));
  const color =
    pct >= 75
      ? "bg-moss-500"
      : pct >= 50
        ? "bg-clay-300"
        : pct >= 25
          ? "bg-clay-500"
          : "bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-bark-800 font-medium">{label}</span>
        <span className="font-semibold text-bark-900">
          {Math.round(score)}
          <span className="text-bark-500 font-normal">/{max}</span>
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-bark-100 overflow-hidden">
        <div
          className={`h-full ${color} rounded-full`}
          style={{
            width: `${pct}%`,
            transition: "width 600ms ease",
          }}
        />
      </div>
    </div>
  );
}
