import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";

const ITEMS = [
  { href: "/", label: "Dashboard", icon: "home" },
  { href: "/profile", label: "Profile", icon: "user" },
  { href: "/land", label: "Land", icon: "mountain" },
  { href: "/water", label: "Water", icon: "droplet" },
  { href: "/solar", label: "Solar", icon: "sun" },
  { href: "/food", label: "Food", icon: "leaf" },
  { href: "/waste", label: "Waste", icon: "recycle" },
  { href: "/shelter", label: "Shelter", icon: "tent" },
  { href: "/budget", label: "Budget", icon: "wallet" },
  { href: "/skills", label: "Skills", icon: "wrench" },
  { href: "/report", label: "Reality Report", icon: "clipboard" },
  { href: "/settings", label: "Settings", icon: "settings" },
] as const satisfies readonly { href: Parameters<typeof Link>[0]["href"]; label: string; icon: IconName }[];

export function Nav() {
  return (
    <header className="border-b border-bark-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-5xl px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-semibold tracking-tight text-moss-900 hover:text-moss-700"
          >
            <span
              className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-moss-500 text-white shadow-sm"
              aria-hidden="true"
            >
              <Icon name="leaf" size={18} />
            </span>
            GroundTruth Homestead
          </Link>
          <span className="text-xs text-bark-700 italic">
            Practical planning, not fantasy.
          </span>
        </div>
        <nav className="flex flex-wrap gap-x-1 gap-y-1 text-sm">
          {ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-bark-800 hover:bg-bark-100 hover:text-moss-900"
            >
              <Icon name={item.icon} size={15} className="text-moss-700" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
