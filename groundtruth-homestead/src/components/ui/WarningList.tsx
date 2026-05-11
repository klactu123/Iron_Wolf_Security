import { Icon } from "./Icon";

export function WarningList({
  warnings,
  title = "Reality checks",
}: {
  warnings: string[];
  title?: string;
}) {
  if (!warnings || warnings.length === 0) return null;
  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-bark-900 mb-2 flex items-center gap-1.5">
        <Icon name="sparkle" size={14} className="text-clay-500" />
        {title}
      </h3>
      <ul className="space-y-2">
        {warnings.map((w, i) => (
          <li
            key={i}
            className="text-sm text-bark-800 bg-clay-50 border border-clay-100 rounded-lg px-3 py-2 flex gap-2"
          >
            <span className="text-clay-500 mt-0.5 shrink-0" aria-hidden="true">
              <Icon name="sparkle" size={12} />
            </span>
            <span>{w}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
