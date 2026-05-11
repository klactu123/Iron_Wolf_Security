// Tiny inline-SVG icon set. No external dependency.
// Paths chosen to be readable at 16-24px and consistent in stroke weight.

type IconName =
  | "home"
  | "user"
  | "mountain"
  | "droplet"
  | "sun"
  | "leaf"
  | "recycle"
  | "tent"
  | "wallet"
  | "wrench"
  | "clipboard"
  | "settings"
  | "check"
  | "circle"
  | "chevron-right"
  | "sparkle";

const PATHS: Record<IconName, React.ReactNode> = {
  home: <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </>
  ),
  mountain: <path d="M3 20 9 9l4 6 2-3 6 8z" />,
  droplet: <path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
    </>
  ),
  leaf: <path d="M5 19c8 0 14-6 14-14 0 0-12-1-14 7-1 4 0 7 0 7zM5 19l8-8" />,
  recycle: (
    <>
      <path d="M7 7h4l-2 3M7 7l-3 5 3 2" />
      <path d="M17 7l3 5-3 2M13 14l-2 3h6l-3-5" />
      <path d="M10 17h7" />
    </>
  ),
  tent: <path d="M12 3 3 21h18zM12 3v18" />,
  wallet: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M16 13h2" />
      <path d="M7 6V4a1 1 0 0 1 1-1h9v3" />
    </>
  ),
  wrench: <path d="m14.7 6.3 3 3-9.6 9.6a2.1 2.1 0 1 1-3-3zM14.7 6.3 18 3l3 3-3.3 3.3M9.4 14.6l-2 2" />,
  clipboard: (
    <>
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M9 11h6M9 15h6" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </>
  ),
  check: <path d="m5 12 5 5L20 6" />,
  circle: <circle cx="12" cy="12" r="9" />,
  "chevron-right": <path d="m9 6 6 6-6 6" />,
  sparkle: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />,
};

export function Icon({
  name,
  size = 20,
  className = "",
  strokeWidth = 1.75,
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

export type { IconName };
