export type ProviderName = "covalent" | "alchemy" | "moralis" | "mobula" | "codex";

export interface ProviderConfig {
  name: ProviderName;
  displayName: string;
  color: string;
  apiKey: string;
}

export interface TokenBalance {
  token_address?: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  logo_url?: string;
  balance?: string;
  balance_usd?: number;
  price_usd?: number;
  price_24h_change?: number;
  contract_type?: string;
  is_spam?: boolean;
  last_transfer_date?: string;
}

export const COMPLETENESS_FIELDS: (keyof TokenBalance)[] = [
  "token_address",
  "name",
  "symbol",
  "decimals",
  "logo_url",
  "balance",
  "balance_usd",
  "price_usd",
  "price_24h_change",
  "contract_type",
  "is_spam",
  "last_transfer_date",
];

export interface LatencyStats {
  avg: number;
  min: number;
  max: number;
  p95: number;
  samples: number[];
}

export interface ProviderBenchmarkResult {
  provider: ProviderName;
  displayName: string;
  color: string;
  latency: LatencyStats;
  completeness: {
    score: number;
    totalFields: number;
    presentFields: number;
    fieldBreakdown: Record<string, boolean>;
    tokensReturned: number;
  };
  reliability: {
    successRate: number;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    errors: string[];
  };
  throughput: {
    requestsPerSecond: number;
    concurrentRequests: number;
    completedInWindow: number;
    windowMs: number;
  };
  rawDataSample: TokenBalance[];
}

export interface BenchmarkRun {
  id: string;
  timestamp: number;
  walletAddress: string;
  chain: string;
  results: ProviderBenchmarkResult[];
  status: "running" | "completed" | "error";
}

export interface BenchmarkRequest {
  walletAddress: string;
  chain: string;
  providers: {
    name: ProviderName;
    apiKey: string;
  }[];
  iterations: number;
  concurrency: number;
}

export interface ChainOption {
  id: string;
  name: string;
  covalentId: number;
  alchemySubdomain: string;
  moralisChain: string;
  mobulaChain: string;
  codexNetworkId: number;
}

export const SUPPORTED_CHAINS: ChainOption[] = [
  {
    id: "eth-mainnet",
    name: "Ethereum",
    covalentId: 1,
    alchemySubdomain: "eth-mainnet",
    moralisChain: "eth",
    mobulaChain: "ethereum",
    codexNetworkId: 1,
  },
  {
    id: "polygon-mainnet",
    name: "Polygon",
    covalentId: 137,
    alchemySubdomain: "polygon-mainnet",
    moralisChain: "polygon",
    mobulaChain: "polygon",
    codexNetworkId: 137,
  },
  {
    id: "bsc-mainnet",
    name: "BNB Chain (BSC)",
    covalentId: 56,
    alchemySubdomain: "bnb-mainnet",
    moralisChain: "bsc",
    mobulaChain: "bsc",
    codexNetworkId: 56,
  },
  {
    id: "arbitrum-mainnet",
    name: "Arbitrum",
    covalentId: 42161,
    alchemySubdomain: "arb-mainnet",
    moralisChain: "arbitrum",
    mobulaChain: "arbitrum",
    codexNetworkId: 42161,
  },
  {
    id: "optimism-mainnet",
    name: "Optimism",
    covalentId: 10,
    alchemySubdomain: "opt-mainnet",
    moralisChain: "optimism",
    mobulaChain: "optimism",
    codexNetworkId: 10,
  },
  {
    id: "base-mainnet",
    name: "Base",
    covalentId: 8453,
    alchemySubdomain: "base-mainnet",
    moralisChain: "base",
    mobulaChain: "base",
    codexNetworkId: 8453,
  },
  {
    id: "avalanche-mainnet",
    name: "Avalanche",
    covalentId: 43114,
    alchemySubdomain: "avax-mainnet",
    moralisChain: "avalanche",
    mobulaChain: "avalanche",
    codexNetworkId: 43114,
  },
];

export interface EnvKeyStatus {
  hasEnvKey: boolean;
  masked: string;
}

export const PROVIDER_META: Record<ProviderName, { displayName: string; color: string }> = {
  covalent: { displayName: "Covalent (GoldRush)", color: "#FF4C3B" },
  alchemy: { displayName: "Alchemy", color: "#5B8DEF" },
  moralis: { displayName: "Moralis", color: "#57C5B6" },
  mobula: { displayName: "Mobula", color: "#E5A93D" },
  codex: { displayName: "Codex", color: "#A78BFA" },
};
