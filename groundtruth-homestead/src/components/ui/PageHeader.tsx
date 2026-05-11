import type { ReactNode } from "react";

export function PageHeader({
  title,
  blurb,
  children,
}: {
  title: string;
  blurb?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-bark-200/60 pb-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-bark-900 leading-tight">
          {title}
        </h1>
        {blurb && (
          <p className="text-sm text-bark-700 mt-1 max-w-3xl leading-snug">
            {blurb}
          </p>
        )}
      </div>
      {children && <div className="flex gap-2">{children}</div>}
    </header>
  );
}
