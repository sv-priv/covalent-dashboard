"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProviderName, PROVIDER_META, BenchmarkRun, ProviderBenchmarkResult, EnvKeyStatus, SUPPORTED_CHAINS, BenchmarkScenario, PricingBenchmarkRun, NftBenchmarkRun, getPricingTokensForChain } from "@/lib/types";
import ApiKeyModal from "@/components/ApiKeyModal";
import ProviderCard from "@/components/ProviderCard";
import SummaryTable from "@/components/SummaryTable";
import LatencyChart from "@/components/charts/LatencyChart";
import ThroughputChart from "@/components/charts/ThroughputChart";
import ReliabilityChart from "@/components/charts/ReliabilityChart";
import PricingAccuracyChart from "@/components/charts/PricingAccuracyChart";
import PricingTable from "@/components/PricingTable";

const DEFAULT_WALLET = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
const STORAGE_KEY = "covalent-benchmark-api-keys";

function loadKeys(): Record<ProviderName, string> {
  if (typeof window === "undefined") {
    return { covalent: "", alchemy: "", moralis: "", mobula: "" };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { covalent: "", alchemy: "", moralis: "", mobula: "" };
}

function saveKeys(keys: Record<ProviderName, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function BenchmarkPage() {
  const [apiKeys, setApiKeys] = useState<Record<ProviderName, string>>({
    covalent: "", alchemy: "", moralis: "", mobula: "",
  });
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [walletAddress, setWalletAddress] = useState(DEFAULT_WALLET);
  const [chain, setChain] = useState(SUPPORTED_CHAINS[0].id);
  const [iterations, setIterations] = useState(3);
  const [concurrency, setConcurrency] = useState(2);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState("");
  const [currentRun, setCurrentRun] = useState<BenchmarkRun | null>(null);
  const [selectedTab, setSelectedTab] = useState<"overview" | "latency" | "reliability" | "throughput" | "pricing" | "nfts">("overview");
  const [envKeys, setEnvKeys] = useState<Record<ProviderName, EnvKeyStatus>>({
    covalent: { hasEnvKey: false, masked: "" },
    alchemy: { hasEnvKey: false, masked: "" },
    moralis: { hasEnvKey: false, masked: "" },
    mobula: { hasEnvKey: false, masked: "" },
  });
  const [scenarios, setScenarios] = useState<Record<BenchmarkScenario, boolean>>({
    balances: true,
    pricing: true,
    nfts: true,
  });
  const [pricingRun, setPricingRun] = useState<PricingBenchmarkRun | null>(null);
  const [nftRun, setNftRun] = useState<NftBenchmarkRun | null>(null);

  useEffect(() => {
    setApiKeys(loadKeys());
    fetch("/api/keys")
      .then((res) => res.json())
      .then((data) => setEnvKeys(data))
      .catch(() => {});
  }, []);

  const configuredProviders = (Object.keys(PROVIDER_META) as ProviderName[]).filter(
    (p) => envKeys[p]?.hasEnvKey || apiKeys[p]?.trim().length > 0
  );

  const handleSaveKeys = useCallback((keys: Record<ProviderName, string>) => {
    setApiKeys(keys);
    saveKeys(keys);
  }, []);

  const runBenchmark = useCallback(async () => {
    if (configuredProviders.length === 0) {
      setShowKeyModal(true);
      return;
    }

    setIsRunning(true);
    setProgress("Initializing benchmark...");
    setSelectedTab(scenarios.balances ? "overview" : scenarios.pricing ? "pricing" : "nfts");
    setCurrentRun(null);
    setPricingRun(null);
    setNftRun(null);

    try {
      const providerPayload = configuredProviders.map((name) => ({
        name,
        apiKey: envKeys[name]?.hasEnvKey ? "" : apiKeys[name],
      }));

      const activeScenarios = Object.entries(scenarios).filter(([, v]) => v).map(([k]) => k);
      const totalSteps = activeScenarios.length;
      let step = 0;

      if (scenarios.balances) {
        step++;
        setProgress(`[${step}/${totalSteps}] Testing token balances across ${configuredProviders.length} providers...`);

        const response = await fetch("/api/benchmark", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress, chain, providers: providerPayload, iterations, concurrency }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Balance benchmark failed");
        }

        const run: BenchmarkRun = await response.json();
        setCurrentRun(run);
      }

      if (scenarios.pricing) {
        step++;
        setProgress(`[${step}/${totalSteps}] Testing pricing accuracy for ${getPricingTokensForChain(chain).length} tokens...`);

        const pricingResponse = await fetch("/api/pricing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chain, providers: providerPayload }),
        });

        if (!pricingResponse.ok) {
          const errorData = await pricingResponse.json();
          throw new Error(errorData.error || "Pricing benchmark failed");
        }

        const pricingData: PricingBenchmarkRun = await pricingResponse.json();
        setPricingRun(pricingData);
      }

      if (scenarios.nfts) {
        step++;
        setProgress(`[${step}/${totalSteps}] Testing NFT endpoints across ${configuredProviders.length} providers...`);

        const nftResponse = await fetch("/api/nfts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress, chain, providers: providerPayload }),
        });

        if (!nftResponse.ok) {
          const errorData = await nftResponse.json();
          throw new Error(errorData.error || "NFT benchmark failed");
        }

        const nftData: NftBenchmarkRun = await nftResponse.json();
        setNftRun(nftData);
      }

      setProgress("All benchmarks complete!");
    } catch (err) {
      setProgress(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsRunning(false);
    }
  }, [configuredProviders, apiKeys, walletAddress, chain, iterations, concurrency, scenarios, envKeys]);

  const results: ProviderBenchmarkResult[] = currentRun?.results || [];
  const selectedChain = SUPPORTED_CHAINS.find((c) => c.id === chain) || SUPPORTED_CHAINS[0];

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1a1a1a]">Run Benchmark</h1>
            <p className="text-sm text-[#78716C] mt-0.5">Configure and execute a new benchmark run</p>
          </div>
          <button
            onClick={() => setShowKeyModal(true)}
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-white text-[#1a1a1a] hover:bg-[#F5F3F0] active:scale-[0.97] transition-all border border-[#E8E5E0] shadow-sm"
          >
            API Keys
            <span className="ml-1.5 text-[10px] bg-[#F5F3F0] text-[#78716C] px-1.5 py-0.5 rounded-md">
              {configuredProviders.length}/{Object.keys(PROVIDER_META).length}
            </span>
          </button>
        </div>
      </motion.div>

      {/* Benchmark Controls */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }} className="bg-white border border-[#E8E5E0] rounded-2xl p-5 mb-8 shadow-sm">
        <div className="flex flex-col gap-4">
          {/* Scenario Selection */}
          <div>
            <label className="text-xs text-[#78716C] font-medium mb-2 block uppercase tracking-wider">
              Scenarios
            </label>
            <div className="flex flex-wrap gap-3">
              {([
                { key: "balances" as BenchmarkScenario, label: "Token Balances", desc: "Speed, uptime, throughput" },
                { key: "pricing" as BenchmarkScenario, label: "Pricing Accuracy", desc: "Token prices across categories" },
                { key: "nfts" as BenchmarkScenario, label: "NFT Balances", desc: "NFT endpoint latency and count" },
              ]).map(({ key, label, desc }) => (
                <button
                  key={key}
                  onClick={() => setScenarios((s) => ({ ...s, [key]: !s[key] }))}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150 text-left ${
                    scenarios[key]
                      ? "bg-[#FFF5F4] border-[#FF4C3B]/20 text-[#1a1a1a] shadow-sm shadow-[#FF4C3B]/5"
                      : "bg-[#FAFAF8] border-[#E8E5E0] text-[#A8A29E] hover:border-[#D6D3CE]"
                  }`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-150 ${
                    scenarios[key] ? "bg-[#FF4C3B] border-[#FF4C3B]" : "border-[#D6D3CE]"
                  }`}>
                    {scenarios[key] && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{label}</div>
                    <div className="text-xs text-[#A8A29E]">{desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Row 1: Wallet + Chain */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <label className="text-xs text-[#78716C] font-medium mb-1.5 block uppercase tracking-wider">Wallet address</label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="w-full bg-[#FAFAF8] border border-[#E8E5E0] rounded-lg px-3.5 py-2.5 text-sm text-[#1a1a1a] font-mono placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#FF4C3B]/15 focus:border-[#FF4C3B]/30 transition-all"
                placeholder="0x..."
              />
            </div>
            <div className="w-full md:w-48">
              <label className="text-xs text-[#78716C] font-medium mb-1.5 block uppercase tracking-wider">Network</label>
              <div className="relative">
                <select
                  value={chain}
                  onChange={(e) => setChain(e.target.value)}
                  className="w-full bg-[#FAFAF8] border border-[#E8E5E0] rounded-lg px-3.5 py-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#FF4C3B]/15 focus:border-[#FF4C3B]/30 transition-all appearance-none cursor-pointer pr-8"
                >
                  {SUPPORTED_CHAINS.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <svg className="w-4 h-4 text-[#A8A29E] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Row 2: Settings + Run */}
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex gap-3 flex-1">
              <div className="flex-1 sm:flex-initial sm:w-32">
                <label className="text-xs text-[#78716C] font-medium mb-1.5 block uppercase tracking-wider">Iterations</label>
                <input
                  type="number"
                  value={iterations}
                  onChange={(e) => setIterations(Math.max(1, Math.min(20, Number(e.target.value))))}
                  className="w-full bg-[#FAFAF8] border border-[#E8E5E0] rounded-lg px-3.5 py-2.5 text-sm text-[#1a1a1a] font-mono focus:outline-none focus:ring-2 focus:ring-[#FF4C3B]/15 focus:border-[#FF4C3B]/30 transition-all"
                  min={1}
                  max={20}
                />
              </div>
              <div className="flex-1 sm:flex-initial sm:w-32">
                <label className="text-xs text-[#78716C] font-medium mb-1.5 block uppercase tracking-wider">Concurrency</label>
                <input
                  type="number"
                  value={concurrency}
                  onChange={(e) => setConcurrency(Math.max(1, Math.min(10, Number(e.target.value))))}
                  className="w-full bg-[#FAFAF8] border border-[#E8E5E0] rounded-lg px-3.5 py-2.5 text-sm text-[#1a1a1a] font-mono focus:outline-none focus:ring-2 focus:ring-[#FF4C3B]/15 focus:border-[#FF4C3B]/30 transition-all"
                  min={1}
                  max={10}
                />
              </div>
            </div>
            <button
              onClick={runBenchmark}
              disabled={isRunning || !Object.values(scenarios).some(Boolean)}
              className={`w-full sm:w-auto px-8 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 shrink-0 ${
                isRunning || !Object.values(scenarios).some(Boolean)
                  ? "bg-[#E8E5E0] text-[#A8A29E] cursor-not-allowed"
                  : "bg-[#1a1a1a] text-white hover:bg-[#333] active:scale-[0.97] shadow-sm"
              }`}
            >
              {isRunning ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Running...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Run Benchmark
                </span>
              )}
            </button>
          </div>

          {/* Context */}
          <div className="flex items-center gap-2 text-xs text-[#A8A29E] flex-wrap">
            <span>Testing on <strong className="text-[#78716C]">{selectedChain.name}</strong></span>
            <span className="w-1 h-1 rounded-full bg-[#D6D3CE]" />
            <span>{Object.values(scenarios).filter(Boolean).length} scenario{Object.values(scenarios).filter(Boolean).length !== 1 ? "s" : ""}</span>
            {scenarios.balances && (
              <>
                <span className="w-1 h-1 rounded-full bg-[#D6D3CE]" />
                <span>{iterations} iter &times; {concurrency} parallel</span>
              </>
            )}
            {scenarios.pricing && (
              <>
                <span className="w-1 h-1 rounded-full bg-[#D6D3CE]" />
                <span>{getPricingTokensForChain(chain).length} tokens</span>
              </>
            )}
          </div>
        </div>

        {progress && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 pt-4 border-t border-[#E8E5E0]"
          >
            <div className="flex items-center gap-2">
              {isRunning && (
                <div className="w-2 h-2 rounded-full bg-[#FF4C3B] pulse-soft shrink-0" />
              )}
              {!isRunning && !progress.startsWith("Error") && (
                <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {progress.startsWith("Error") && (
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <p className={`text-sm ${progress.startsWith("Error") ? "text-red-500" : "text-[#78716C]"}`}>
                {progress}
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Empty State */}
      {results.length === 0 && !pricingRun && !nftRun && !isRunning && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-[#F5F3F0] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <svg className="w-7 h-7 text-[#A8A29E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[#1a1a1a] mb-1">Ready to benchmark</p>
          <p className="text-xs text-[#A8A29E]">
            {configuredProviders.length === 0
              ? "Add your API keys to get started."
              : `${configuredProviders.length} provider${configuredProviders.length > 1 ? "s" : ""} configured. Hit Run Benchmark above.`
            }
          </p>
        </motion.div>
      )}

      {/* Loading Skeleton */}
      {isRunning && results.length === 0 && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-[#E8E5E0] rounded-2xl p-6 shimmer h-32" />
          ))}
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {(results.length > 0 || pricingRun || nftRun) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Run Context */}
            {results.length > 0 && (
              <div className="flex items-center gap-2.5 text-xs text-[#78716C] mb-4 bg-[#F5F3F0] border border-[#E8E5E0] rounded-lg px-3.5 py-2 w-fit">
                <span className="text-[#A8A29E]">EOA</span>
                <span className="font-mono text-[#1a1a1a]">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                <span className="w-px h-3 bg-[#E8E5E0]" />
                <span>{selectedChain.name}</span>
                <span className="w-px h-3 bg-[#E8E5E0]" />
                <span>{iterations} iter &times; {concurrency} conc</span>
              </div>
            )}
            {/* Tab Navigation */}
            <div className="flex gap-1 mb-6 bg-[#F5F3F0] border border-[#E8E5E0] rounded-xl p-1 w-fit flex-wrap">
              {([
                { key: "overview" as const, label: "Overview" },
                { key: "latency" as const, label: "Speed" },
                { key: "reliability" as const, label: "Uptime" },
                { key: "throughput" as const, label: "Capacity" },
                ...(pricingRun ? [{ key: "pricing" as const, label: "Pricing" }] : []),
                ...(nftRun ? [{ key: "nfts" as const, label: "NFTs" }] : []),
              ]).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSelectedTab(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    selectedTab === key
                      ? "bg-white text-[#1a1a1a] shadow-sm border border-[#E8E5E0]"
                      : "text-[#78716C] hover:text-[#1a1a1a]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {selectedTab === "overview" && (
              <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
                {results.length > 0 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {results.map((r) => <ProviderCard key={r.provider} result={r} />)}
                    </div>
                    <SummaryTable results={results} />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <LatencyChart results={results} />
                      <ReliabilityChart results={results} />
                    </div>
                    <ThroughputChart results={results} />
                  </>
                )}
                {pricingRun && (
                  <div className="bg-white border border-[#E8E5E0] rounded-2xl p-6 hover:shadow-sm transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[#1a1a1a]">Pricing Accuracy Summary</h3>
                        <p className="text-sm text-[#78716C]">
                          Tested {pricingRun?.tokenResults?.length || getPricingTokensForChain(chain).length} tokens across Major Tokens, Stablecoins, DeFi, and Niche Tokens.
                        </p>
                      </div>
                      <button onClick={() => setSelectedTab("pricing")} className="text-xs text-[#FF4C3B] hover:text-[#E0392A] font-medium transition-colors flex items-center gap-1">
                        View details
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {pricingRun.providerResults.map((pr) => (
                        <div key={pr.provider} className="bg-[#FAFAF8] border border-[#F0EDE8] rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pr.color }} />
                            <span className="text-xs font-medium text-[#1a1a1a]">{pr.displayName}</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold font-mono" style={{ color: pr.color }}>{pr.coveragePercent}%</span>
                            <span className="text-[10px] text-[#A8A29E]">coverage</span>
                          </div>
                          {pr.avgDeviation !== null && (
                            <p className={`text-xs font-mono mt-0.5 ${pr.avgDeviation < 1 ? "text-emerald-600" : pr.avgDeviation < 5 ? "text-amber-600" : "text-red-500"}`}>
                              {pr.avgDeviation}% avg deviation
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {nftRun && (
                  <div className="bg-white border border-[#E8E5E0] rounded-2xl p-6 hover:shadow-sm transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[#1a1a1a]">NFT Balances Summary</h3>
                        <p className="text-sm text-[#78716C]">
                          Queried each provider&apos;s NFT endpoint for the same wallet.
                        </p>
                      </div>
                      <button onClick={() => setSelectedTab("nfts")} className="text-xs text-[#FF4C3B] hover:text-[#E0392A] font-medium transition-colors flex items-center gap-1">
                        View details
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {nftRun.results.map((nr) => (
                        <div key={nr.provider} className="bg-[#FAFAF8] border border-[#F0EDE8] rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: nr.color }} />
                            <span className="text-xs font-medium text-[#1a1a1a]">{nr.displayName}</span>
                          </div>
                          {nr.success ? (
                            <>
                              <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold font-mono" style={{ color: nr.color }}>{nr.nftCount}</span>
                                <span className="text-[10px] text-[#A8A29E]">items</span>
                              </div>
                              <p className="text-xs font-mono text-[#78716C] mt-0.5">{nr.latencyMs}ms</p>
                            </>
                          ) : (
                            <p className="text-xs text-red-500 mt-1">{nr.error || "Failed"}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {selectedTab === "latency" && results.length > 0 && (
              <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
                <LatencyChart results={results} />
                <div className="bg-white border border-[#E8E5E0] rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-[#1a1a1a] mb-1">Speed Breakdown</h3>
                  <p className="text-sm text-[#78716C] mb-4">Sorted fastest to slowest. All times in milliseconds.</p>
                  <div className="space-y-2.5">
                    {[...results].sort((a, b) => a.latency.avg - b.latency.avg).map((r, i) => (
                      <div key={r.provider} className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all duration-150 ${i === 0 ? "bg-[#FFF5F4]/50 border-[#FF4C3B]/10" : "bg-[#FAFAF8] border-[#F0EDE8] hover:border-[#E8E5E0]"}`}>
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                        <span className="text-sm text-[#1a1a1a] font-medium w-40">{r.displayName}</span>
                        <div className="flex-1 grid grid-cols-4 gap-4 text-right">
                          <div><p className="text-xs text-[#A8A29E]">Typical</p><p className="text-sm font-mono text-[#1a1a1a]">{r.latency.avg}ms</p></div>
                          <div><p className="text-xs text-[#A8A29E]">Best</p><p className="text-sm font-mono text-emerald-600">{r.latency.min}ms</p></div>
                          <div><p className="text-xs text-[#A8A29E]">Worst</p><p className="text-sm font-mono text-red-500">{r.latency.max}ms</p></div>
                          <div><p className="text-xs text-[#A8A29E]">P95</p><p className="text-sm font-mono text-amber-600">{r.latency.p95}ms</p></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === "reliability" && results.length > 0 && (
              <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
                <ReliabilityChart results={results} />
                <div className="bg-white border border-[#E8E5E0] rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-[#1a1a1a] mb-1">Request Reliability</h3>
                  <p className="text-sm text-[#78716C] mb-4">Error details per provider.</p>
                  <div className="space-y-2.5">
                    {results.map((r) => (
                      <div key={r.provider} className="p-4 bg-[#FAFAF8] rounded-xl border border-[#F0EDE8] hover:border-[#E8E5E0] transition-all duration-150">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                          <span className="text-[#1a1a1a] font-medium">{r.displayName}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            r.reliability.successRate === 100 ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : r.reliability.successRate >= 80 ? "bg-amber-50 text-amber-600 border border-amber-200"
                              : "bg-red-50 text-red-600 border border-red-200"
                          }`}>
                            {r.reliability.successRate}% success
                          </span>
                        </div>
                        <p className="text-sm text-[#78716C]">{r.reliability.successfulRequests} of {r.reliability.totalRequests} requests succeeded</p>
                        {r.reliability.errors.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {r.reliability.errors.map((err, i) => (
                              <p key={i} className="text-xs text-red-400 font-mono truncate">{err}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === "throughput" && results.length > 0 && (
              <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
                <ThroughputChart results={results} />
                <div className="bg-white border border-[#E8E5E0] rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-[#1a1a1a] mb-1">Throughput Under Load</h3>
                  <p className="text-sm text-[#78716C] mb-4">Requests per second when sending concurrent calls.</p>
                  <div className="space-y-2.5">
                    {[...results].sort((a, b) => b.throughput.requestsPerSecond - a.throughput.requestsPerSecond).map((r, i) => (
                      <div key={r.provider} className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all duration-150 ${i === 0 ? "bg-[#FFF5F4]/50 border-[#FF4C3B]/10" : "bg-[#FAFAF8] border-[#F0EDE8] hover:border-[#E8E5E0]"}`}>
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                        <span className="text-sm text-[#1a1a1a] font-medium w-40">{r.displayName}</span>
                        <div className="flex-1">
                          <div className="h-2 bg-[#F0EDE8] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, (r.throughput.requestsPerSecond / Math.max(...results.map((x) => x.throughput.requestsPerSecond))) * 100)}%` }}
                              transition={{ duration: 0.8, delay: 0.1 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: r.color }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-mono text-[#1a1a1a] w-24 text-right">{r.throughput.requestsPerSecond} rps</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === "pricing" && pricingRun && (
              <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
                <PricingAccuracyChart results={pricingRun.providerResults} />
                <PricingTable tokenResults={pricingRun.tokenResults} providerResults={pricingRun.providerResults} />
              </motion.div>
            )}

            {selectedTab === "nfts" && nftRun && (
              <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
                <div className="bg-white border border-[#E8E5E0] rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-[#1a1a1a] mb-1">NFT Endpoint Comparison</h3>
                  <p className="text-sm text-[#78716C] mb-2">
                    Each provider was asked for NFTs held by the same wallet. Sorted by response time.
                  </p>
                  <p className="text-xs text-[#A8A29E] mb-6 leading-relaxed">
                    Item counts may differ: some providers return individual NFTs, others return NFT collections (grouped by contract).
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[#78716C] border-b border-[#E8E5E0]">
                          <th className="text-left py-3 px-4 font-medium">Provider</th>
                          <th className="text-left py-3 px-4 font-medium">Endpoint</th>
                          <th className="text-center py-3 px-4 font-medium">Status</th>
                          <th className="text-right py-3 px-4 font-medium">
                            <div>Items Returned</div>
                            <div className="text-[10px] text-[#A8A29E] font-normal">varies by provider</div>
                          </th>
                          <th className="text-right py-3 px-4 font-medium">Latency</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...nftRun.results].sort((a, b) => a.latencyMs - b.latencyMs).map((nr) => (
                          <tr key={nr.provider} className="border-b border-[#F0EDE8] hover:bg-[#FAFAF8] transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: nr.color }} />
                                <span className="text-[#1a1a1a] font-medium">{nr.displayName}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="text-[10px] font-mono text-[#A8A29E]">
                                {PROVIDER_META[nr.provider]?.endpoints?.nfts}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {nr.success ? (
                                <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">OK</span>
                              ) : (
                                <span className="text-xs text-red-500 font-medium bg-red-50 px-2.5 py-1 rounded-full border border-red-200">FAIL</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-[#1a1a1a]">
                              {nr.success ? nr.nftCount : "—"}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-[#1a1a1a]">
                              {nr.latencyMs}ms
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
