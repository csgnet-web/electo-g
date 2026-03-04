import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BreakingTicker from "@/components/BreakingTicker";

export const metadata: Metadata = {
  title: "ElectionGorilla — AI-Powered 24/7 U.S. Election Coverage",
  description: "Live AI-managed coverage of every U.S. House and Senate race in 2026. Per-district and per-precinct data. Powered by the Election Gorilla.",
  openGraph: {
    title: "ElectionGorilla",
    description: "24/7 AI election livestream — every House and Senate race in America.",
    siteName: "ElectionGorilla",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-gray-100 min-h-screen font-sans">
        <Navbar />
        <BreakingTicker />
        <main className="max-w-screen-2xl mx-auto px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-gray-800 mt-12 py-6 text-center text-xs text-gray-600">
          <p>ElectionGorilla © 2026 · AI-managed coverage of every U.S. House &amp; Senate race · Data refreshed every 60s</p>
          <p className="mt-1 text-gray-700">Not affiliated with any political party or candidate. All projections are AI estimates only.</p>
        </footer>
      </body>
    </html>
  );
}
