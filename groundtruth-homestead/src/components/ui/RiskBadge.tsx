import type { RiskLevel } from "@/lib/types";

const styles: Record<RiskLevel, string> = {
  low: "bg-moss-100 text-moss-900 border-moss-300",
  medium: "bg-amber-100 text-amber-900 border-amber-300",
  high: "bg-orange-100 text-orange-900 border-orange-300",
  critical: "bg-red-100 text-red-900 border-red-300",
};

const labels: Record<RiskLevel, string> = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
  critical: "Critical risk",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${styles[level]}`}
    >
      {labels[level]}
    </span>
  );
}
