"use client";

import { useState, useEffect, useCallback } from "react";
import { ProviderName, PROVIDER_META, EnvKeyStatus } from "@/lib/types";
import ApiKeyModal from "@/components/ApiKeyModal";

const STORAGE_KEY = "covalent-benchmark-api-keys";

function loadKeys(): Record<ProviderName, string> {
  if (typeof window === "undefined") return { covalent: "", alchemy: "", moralis: "", mobula: "" };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { covalent: "", alchemy: "", moralis: "", mobula: "" };
}

function saveKeys(keys: Record<ProviderName, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<Record<ProviderName, string>>({
    covalent: "", alchemy: "", moralis: "", mobula: "",
  });
  const [envKeys, setEnvKeys] = useState<Record<ProviderName, EnvKeyStatus>>({
    covalent: { hasEnvKey: false, masked: "" },
    alchemy: { hasEnvKey: false, masked: "" },
    moralis: { hasEnvKey: false, masked: "" },
    mobula: { hasEnvKey: false, masked: "" },
  });
  const [showKeyModal, setShowKeyModal] = useState(false);

  useEffect(() => {
    setApiKeys(loadKeys());
    fetch("/api/keys").then((r) => r.json()).then(setEnvKeys).catch(() => {});
  }, []);

  const handleSaveKeys = useCallback((keys: Record<ProviderName, string>) => {
    setApiKeys(keys);
    saveKeys(keys);
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-[#1a1a1a]">Settings</h1>
        <p className="text-sm text-[#78716C] mt-0.5">Manage API keys and scheduled runs</p>
      </div>

      {/* API Keys */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-[#1a1a1a]">API Keys</h2>
            <p className="text-xs text-[#A8A29E] mt-0.5">Configure provider API keys</p>
          </div>
          <button
            onClick={() => setShowKeyModal(true)}
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-white text-[#1a1a1a] hover:bg-[#F5F3F0] transition-all border border-[#E8E5E0]"
          >
            Manage Keys
          </button>
        </div>
        <div className="bg-white border border-[#E8E5E0] rounded-xl divide-y divide-[#F0EDE8]">
          {(Object.keys(PROVIDER_META) as ProviderName[]).map((p) => {
            const hasEnv = envKeys[p]?.hasEnvKey;
            const hasLocal = apiKeys[p]?.trim().length > 0;
            return (
              <div key={p} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PROVIDER_META[p].color }} />
                  <span className="text-sm text-[#1a1a1a]">{PROVIDER_META[p].displayName}</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasEnv && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md border border-emerald-200 font-medium">.env</span>
                  )}
                  {hasLocal && !hasEnv && (
                    <span className="text-[10px] bg-[#FFF5F4] text-[#FF4C3B] px-1.5 py-0.5 rounded-md border border-[#FF4C3B]/15 font-medium">local</span>
                  )}
                  {!hasEnv && !hasLocal && (
                    <span className="text-[10px] text-[#D6D3CE]">not configured</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Scheduled Runs */}
      <section className="mb-10">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-[#1a1a1a]">Scheduled Runs</h2>
          <p className="text-xs text-[#A8A29E] mt-0.5">Automatic benchmark runs on a schedule</p>
        </div>
        <div className="bg-white border border-[#E8E5E0] rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F5F3F0] flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-[#78716C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[#1a1a1a] font-medium mb-1">Cron Endpoint</p>
              <p className="text-xs text-[#78716C] mb-3">
                Set up a cron job to hit your deployment URL with the secret to run benchmarks automatically.
              </p>
              <div className="bg-[#FAFAF8] border border-[#E8E5E0] rounded-lg p-3">
                <p className="text-[10px] text-[#A8A29E] uppercase tracking-wider mb-1.5">Endpoint</p>
                <code className="text-xs font-mono text-[#1a1a1a] break-all">
                  GET /api/cron?secret=YOUR_CRON_SECRET
                </code>
              </div>
              <p className="text-xs text-[#A8A29E] mt-3">
                Use <a href="https://cron-job.org" target="_blank" rel="noopener noreferrer" className="text-[#FF4C3B] hover:underline">cron-job.org</a> (free) or GitHub Actions to call this every 4 hours. Set <code className="text-[10px] bg-[#F5F3F0] px-1 py-0.5 rounded font-mono">CRON_SECRET</code> in your environment variables.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ApiKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onSave={handleSaveKeys}
        currentKeys={apiKeys}
        envKeys={envKeys}
      />
    </div>
  );
}
