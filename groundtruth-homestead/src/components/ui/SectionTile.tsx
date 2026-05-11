import Link from "next/link";
import { Icon, type IconName } from "./Icon";

export function SectionTile({
  href,
  icon,
  label,
  description,
  complete,
}: {
  href: Parameters<typeof Link>[0]["href"];
  icon: IconName;
  label: string;
  description: string;
  complete: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative block rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${
        complete
          ? "border-moss-300 bg-moss-50/60"
          : "border-bark-200 bg-white/70 hover:border-clay-300 hover:bg-clay-50/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${
            complete
              ? "bg-moss-500 text-white"
              : "bg-bark-100 text-moss-700 group-hover:bg-clay-100 group-hover:text-clay-700"
          }`}
          aria-hidden="true"
        >
          <Icon name={icon} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-bark-900">{label}</div>
            {complete ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-moss-700">
                <Icon name="check" size={12} strokeWidth={2.5} />
                Done
              </span>
            ) : (
              <span className="text-[10px] font-medium uppercase tracking-wide text-bark-500">
                Not yet
              </span>
            )}
          </div>
          <div className="text-xs text-bark-700 mt-0.5">{description}</div>
        </div>
        <Icon
          name="chevron-right"
          size={18}
          className="text-bark-300 group-hover:text-moss-700 shrink-0"
        />
      </div>
    </Link>
  );
}
