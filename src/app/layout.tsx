import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "GroupTrip – Holiday Flight Finder",
  description: "Compare return flight options from Sydney for a group holiday. Prototype using mock data.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-AU" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold text-sky-700">
              <span aria-hidden className="text-xl">✈</span>
              <span>GroupTrip</span>
            </Link>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
              Demo · mock fares
            </span>
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="border-t border-slate-200 bg-white">
          <p className="mx-auto max-w-5xl px-4 py-4 text-xs text-slate-500">
            GroupTrip is a personal planning prototype. All prices shown are generated mock data — not live fares,
            availability or bookable offers.
          </p>
        </footer>
      </body>
    </html>
  );
}
