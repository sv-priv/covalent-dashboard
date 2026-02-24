"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ProviderName, PROVIDER_META, EnvKeyStatus } from "@/lib/types";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/benchmark",
    label: "Run Benchmark",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: "/history",
    label: "History",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const STORAGE_KEY = "covalent-benchmark-api-keys";

export default function Sidebar() {
  const pathname = usePathname();
  const [configuredCount, setConfiguredCount] = useState(0);

  useEffect(() => {
    let count = 0;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const localKeys: Record<string, string> = stored ? JSON.parse(stored) : {};
      (Object.keys(PROVIDER_META) as ProviderName[]).forEach((p) => {
        if (localKeys[p]?.trim()) count++;
      });
    } catch {}

    fetch("/api/keys")
      .then((r) => r.json())
      .then((envKeys: Record<ProviderName, EnvKeyStatus>) => {
        (Object.keys(PROVIDER_META) as ProviderName[]).forEach((p) => {
          if (envKeys[p]?.hasEnvKey && !count) count++;
          else if (envKeys[p]?.hasEnvKey) {
            const stored = localStorage.getItem(STORAGE_KEY);
            const localKeys: Record<string, string> = stored ? JSON.parse(stored) : {};
            if (!localKeys[p]?.trim()) count++;
          }
        });
        setConfiguredCount(count);
      })
      .catch(() => setConfiguredCount(count));

    setConfiguredCount(count);
  }, []);

  useEffect(() => {
    const total = Object.keys(PROVIDER_META).length;
    let localCount = 0;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const localKeys: Record<string, string> = stored ? JSON.parse(stored) : {};
      (Object.keys(PROVIDER_META) as ProviderName[]).forEach((p) => {
        if (localKeys[p]?.trim()) localCount++;
      });
    } catch {}
    fetch("/api/keys")
      .then((r) => r.json())
      .then((envKeys: Record<ProviderName, EnvKeyStatus>) => {
        let c = 0;
        (Object.keys(PROVIDER_META) as ProviderName[]).forEach((p) => {
          const stored = localStorage.getItem(STORAGE_KEY);
          const localKeys: Record<string, string> = stored ? JSON.parse(stored) : {};
          if (envKeys[p]?.hasEnvKey || localKeys[p]?.trim()) c++;
        });
        setConfiguredCount(Math.min(c, total));
      })
      .catch(() => setConfiguredCount(Math.min(localCount, total)));
  }, [pathname]);

  const total = Object.keys(PROVIDER_META).length;
  const allConfigured = configuredCount === total;

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-white border-r border-[#E8E5E0] flex flex-col z-30 shadow-[1px_0_8px_rgba(0,0,0,0.03)]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#E8E5E0]">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-[#FF4C3B] flex items-center justify-center transition-transform group-hover:scale-105">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1a1a1a] leading-tight">Blockchain Data APIs</p>
            <p className="text-[10px] text-[#A8A29E] leading-tight tracking-wide">Benchmark</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? "bg-[#FFF5F4] text-[#FF4C3B] font-medium shadow-sm shadow-[#FF4C3B]/5"
                  : "text-[#78716C] hover:text-[#1a1a1a] hover:bg-[#F5F3F0]"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#E8E5E0]">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full transition-colors ${allConfigured ? "bg-emerald-400" : configuredCount > 0 ? "bg-amber-400" : "bg-[#D6D3CE]"}`} />
          <span className="text-[11px] text-[#A8A29E]">
            {configuredCount}/{total} providers ready
          </span>
        </div>
      </div>
    </aside>
  );
}
