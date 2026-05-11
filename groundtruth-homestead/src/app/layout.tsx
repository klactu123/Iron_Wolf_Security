import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/layout/Nav";

export const metadata: Metadata = {
  title: "GroundTruth Homestead",
  description:
    "A practical homestead feasibility and transition planner. Calculators, readiness scoring, and a phased plan for moving toward off-grid living.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 py-10 text-xs text-bark-700 border-t border-bark-200 mt-12">
          GroundTruth Homestead is a planning aid. It does not replace professional
          legal, engineering, electrical, plumbing, septic, well, agricultural,
          medical, or financial advice. Always verify zoning, permits, and
          requirements with local authorities before acting on any output.
        </footer>
      </body>
    </html>
  );
}
