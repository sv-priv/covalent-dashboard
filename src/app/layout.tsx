import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "API Benchmark Dashboard | Covalent vs Competitors",
  description: "Benchmark and compare blockchain API providers across latency, completeness, reliability, throughput, pricing accuracy, and NFT coverage.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23FF4C3B'/><path d='M50 20L20 35l30 15 30-15-30-15zM20 65l30 15 30-15M20 50l30 15 30-15' stroke='white' stroke-width='6' stroke-linecap='round' stroke-linejoin='round' fill='none'/></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#FAFAF8] text-[#1a1a1a]`}
      >
        <Sidebar />
        <main className="ml-56 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
