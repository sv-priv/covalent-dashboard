"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
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

  const configuredCount = (Object.keys(PROVIDER_META) as ProviderName[]).filter(
    (p) => envKeys[p]?.hasEnvKey || apiKeys[p]?.trim().length > 0
  ).length;
  const totalProviders = Object.keys(PROVIDER_META).length;

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-8">
        <h1 className="text-xl font-bold text-[#1a1a1a]">Settings</h1>
        <p className="text-sm text-[#78716C] mt-0.5">Manage API keys and configuration</p>
      </motion.div>

      {/* API Keys */}
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }} className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-[#1a1a1a]">API Keys</h2>
            <p className="text-xs text-[#A8A29E] mt-0.5">{configuredCount}/{totalProviders} providers configured</p>
          </div>
          <button
            onClick={() => setShowKeyModal(true)}
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-white text-[#1a1a1a] hover:bg-[#F5F3F0] active:scale-[0.97] transition-all border border-[#E8E5E0] shadow-sm"
          >
            Manage Keys
          </button>
        </div>
        <div className="bg-white border border-[#E8E5E0] rounded-xl divide-y divide-[#F0EDE8] shadow-sm">
          {(Object.keys(PROVIDER_META) as ProviderName[]).map((p) => {
            const hasEnv = envKeys[p]?.hasEnvKey;
            const hasLocal = apiKeys[p]?.trim().length > 0;
            return (
              <div key={p} className="flex items-center justify-between px-4 py-3.5 hover:bg-[#FAFAF8] transition-colors duration-150">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PROVIDER_META[p].color }} />
                  <span className="text-sm text-[#1a1a1a] font-medium">{PROVIDER_META[p].displayName}</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasEnv && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md border border-emerald-200 font-medium flex items-center gap-1">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      .env
                    </span>
                  )}
                  {hasLocal && !hasEnv && (
                    <span className="text-[10px] bg-[#FFF5F4] text-[#FF4C3B] px-2 py-0.5 rounded-md border border-[#FF4C3B]/15 font-medium">browser</span>
                  )}
                  {!hasEnv && !hasLocal && (
                    <span className="text-[10px] text-[#D6D3CE] font-medium">not configured</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* About */}
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }} className="mb-10">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-[#1a1a1a]">About</h2>
        </div>
        <div className="bg-white border border-[#E8E5E0] rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#FFF5F4] flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#FF4C3B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-sm text-[#1a1a1a] font-medium mb-1">GoldRush API Benchmark</p>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Internal benchmarking tool for comparing blockchain data API providers across latency, data completeness, reliability, throughput, pricing accuracy, and NFT endpoint coverage.
              </p>
              <div className="flex items-center gap-3 mt-3 text-xs text-[#A8A29E]">
                <span>4 providers</span>
                <span className="w-1 h-1 rounded-full bg-[#D6D3CE]" />
                <span>7 chains</span>
                <span className="w-1 h-1 rounded-full bg-[#D6D3CE]" />
                <span>3 benchmark scenarios</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

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
