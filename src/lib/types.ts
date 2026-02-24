export type ProviderName = "covalent" | "alchemy" | "moralis" | "mobula";

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
}

export const SUPPORTED_CHAINS: ChainOption[] = [
  {
    id: "eth-mainnet",
    name: "Ethereum",
    covalentId: 1,
    alchemySubdomain: "eth-mainnet",
    moralisChain: "eth",
    mobulaChain: "ethereum",
  },
  {
    id: "polygon-mainnet",
    name: "Polygon",
    covalentId: 137,
    alchemySubdomain: "polygon-mainnet",
    moralisChain: "polygon",
    mobulaChain: "polygon",
  },
  {
    id: "bsc-mainnet",
    name: "BNB Chain (BSC)",
    covalentId: 56,
    alchemySubdomain: "bnb-mainnet",
    moralisChain: "bsc",
    mobulaChain: "bsc",
  },
  {
    id: "arbitrum-mainnet",
    name: "Arbitrum",
    covalentId: 42161,
    alchemySubdomain: "arb-mainnet",
    moralisChain: "arbitrum",
    mobulaChain: "arbitrum",
  },
  {
    id: "optimism-mainnet",
    name: "Optimism",
    covalentId: 10,
    alchemySubdomain: "opt-mainnet",
    moralisChain: "optimism",
    mobulaChain: "optimism",
  },
  {
    id: "base-mainnet",
    name: "Base",
    covalentId: 8453,
    alchemySubdomain: "base-mainnet",
    moralisChain: "base",
    mobulaChain: "base",
  },
  {
    id: "avalanche-mainnet",
    name: "Avalanche",
    covalentId: 43114,
    alchemySubdomain: "avax-mainnet",
    moralisChain: "avalanche",
    mobulaChain: "avalanche",
  },
];

export interface EnvKeyStatus {
  hasEnvKey: boolean;
  masked: string;
}

// --- Pricing Accuracy Types ---

export interface PricingToken {
  address: string;
  symbol: string;
  name: string;
  category: "blue-chip" | "defi" | "long-tail" | "stablecoin";
  chainId: number;
}

export const PRICING_TEST_TOKENS: PricingToken[] = [
  // Blue chips
  { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", symbol: "WETH", name: "Wrapped Ether", category: "blue-chip", chainId: 1 },
  { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", symbol: "WBTC", name: "Wrapped Bitcoin", category: "blue-chip", chainId: 1 },
  { address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", symbol: "LINK", name: "Chainlink", category: "blue-chip", chainId: 1 },
  // Stablecoins
  { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", name: "USD Coin", category: "stablecoin", chainId: 1 },
  { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", name: "Tether", category: "stablecoin", chainId: 1 },
  { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", symbol: "DAI", name: "Dai", category: "stablecoin", chainId: 1 },
  // DeFi tokens
  { address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", symbol: "UNI", name: "Uniswap", category: "defi", chainId: 1 },
  { address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", symbol: "AAVE", name: "Aave", category: "defi", chainId: 1 },
  { address: "0xD533a949740bb3306d119CC777fa900bA034cd52", symbol: "CRV", name: "Curve DAO", category: "defi", chainId: 1 },
  { address: "0xBAac2B4491727D78D2b78815144570b9f2Fe8899", symbol: "DOG", name: "The Doge NFT", category: "long-tail", chainId: 1 },
  // Long-tail / tricky tokens
  { address: "0x808507121B80c02388fAd14726482e061B8da827", symbol: "PENDLE", name: "Pendle", category: "long-tail", chainId: 1 },
  { address: "0xf951E335afb289353dc249e82926178EaC7DEd78", symbol: "swETH", name: "Swell Staked ETH", category: "long-tail", chainId: 1 },
  { address: "0xFe0c30065B384F05761f15d0CC899D4F9F9Cc0eB", symbol: "ether.fi", name: "ether.fi governance", category: "long-tail", chainId: 1 },
  { address: "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee", symbol: "weETH", name: "Wrapped eETH", category: "long-tail", chainId: 1 },
  { address: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0", symbol: "wstETH", name: "Wrapped stETH", category: "long-tail", chainId: 1 },
  { address: "0xae78736Cd615f374D3085123A210448E74Fc6393", symbol: "rETH", name: "Rocket Pool ETH", category: "long-tail", chainId: 1 },
  { address: "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", symbol: "LDO", name: "Lido DAO", category: "defi", chainId: 1 },
  { address: "0x18084fbA666a33d37592fA2633fD49a74DD93a88", symbol: "tBTC", name: "tBTC v2", category: "long-tail", chainId: 1 },
  { address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933", symbol: "PEPE", name: "Pepe", category: "long-tail", chainId: 1 },
  { address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE", symbol: "SHIB", name: "Shiba Inu", category: "long-tail", chainId: 1 },
];

export interface TokenPriceResult {
  token: PricingToken;
  prices: Record<ProviderName, number | null>;
  consensusPrice: number | null;
  deviations: Record<ProviderName, number | null>;
}

export interface PricingBenchmarkResult {
  provider: ProviderName;
  displayName: string;
  color: string;
  tokensCovered: number;
  totalTokens: number;
  coveragePercent: number;
  avgDeviation: number | null;
  maxDeviation: number | null;
  latencyMs: number;
  categoryBreakdown: Record<string, { covered: number; total: number; avgDev: number | null }>;
}

export interface PricingBenchmarkRun {
  id: string;
  timestamp: number;
  chain: string;
  tokenResults: TokenPriceResult[];
  providerResults: PricingBenchmarkResult[];
  status: "running" | "completed" | "error";
}

export type BenchmarkScenario = "balances" | "pricing";

export const PROVIDER_META: Record<ProviderName, { displayName: string; color: string }> = {
  covalent: { displayName: "Covalent (GoldRush)", color: "#FF4C3B" },
  alchemy: { displayName: "Alchemy", color: "#5B8DEF" },
  moralis: { displayName: "Moralis", color: "#57C5B6" },
  mobula: { displayName: "Mobula", color: "#E5A93D" },
};
