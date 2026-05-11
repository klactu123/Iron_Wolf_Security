import type { ReactNode } from "react";

export function Card({
  title,
  subtitle,
  children,
  footer,
  tone = "default",
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  tone?: "default" | "accent" | "good";
}) {
  const surface =
    tone === "accent"
      ? "bg-gradient-to-br from-clay-50 to-bark-50 border-clay-100"
      : tone === "good"
        ? "bg-gradient-to-br from-moss-50 to-bark-50 border-moss-100"
        : "bg-white/80 border-bark-200";
  return (
    <section
      className={`rounded-xl border shadow-sm overflow-hidden ${surface}`}
    >
      {(title || subtitle) && (
        <header className="px-5 py-4 border-b border-bark-200/60">
          {title && (
            <h2 className="text-lg font-semibold text-bark-900 leading-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm text-bark-700 mt-1 leading-snug">
              {subtitle}
            </p>
          )}
        </header>
      )}
      <div className="px-5 py-4">{children}</div>
      {footer && (
        <footer className="px-5 py-3 border-t border-bark-200/60 bg-bark-50/40">
          {footer}
        </footer>
      )}
    </section>
  );
}
