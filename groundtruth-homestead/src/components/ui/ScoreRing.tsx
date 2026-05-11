export function ScoreRing({
  score,
  label,
  size = 160,
}: {
  score: number;
  label?: string;
  size?: number;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;

  // Tier-coded color
  const ringColor =
    clamped >= 75
      ? "var(--color-moss-500)"
      : clamped >= 50
        ? "var(--color-clay-300)"
        : clamped >= 25
          ? "var(--color-clay-500)"
          : "#dc2626"; // red-600

  const tierLabel =
    clamped >= 75
      ? "Solid"
      : clamped >= 50
        ? "Workable"
        : clamped >= 25
          ? "Significant gaps"
          : "Very early";

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--color-bark-200)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms ease, stroke 600ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-semibold text-bark-900 leading-none">{clamped}</div>
        <div className="text-xs text-bark-700 mt-1">{label ?? "of 100"}</div>
        <div className="text-xs mt-1 font-medium" style={{ color: ringColor }}>
          {tierLabel}
        </div>
      </div>
    </div>
  );
}
