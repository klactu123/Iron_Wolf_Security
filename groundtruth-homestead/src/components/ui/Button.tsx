import type { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: Props) {
  const base =
    "inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-px";
  const styles = {
    primary:
      "bg-moss-700 text-white hover:bg-moss-900 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-moss-300",
    secondary:
      "bg-white text-bark-900 border border-bark-200 hover:bg-bark-100 hover:border-bark-300",
    ghost:
      "text-moss-700 hover:bg-bark-100 shadow-none",
  }[variant];
  return (
    <button {...rest} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}
