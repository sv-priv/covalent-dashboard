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

const PRICING_TOKENS_BY_CHAIN: Record<string, PricingToken[]> = {
  "eth-mainnet": [
    { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", symbol: "WETH", name: "Wrapped Ether", category: "blue-chip", chainId: 1 },
    { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", symbol: "WBTC", name: "Wrapped Bitcoin", category: "blue-chip", chainId: 1 },
    { address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", symbol: "LINK", name: "Chainlink", category: "blue-chip", chainId: 1 },
    { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", name: "USD Coin", category: "stablecoin", chainId: 1 },
    { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", name: "Tether", category: "stablecoin", chainId: 1 },
    { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", symbol: "DAI", name: "Dai", category: "stablecoin", chainId: 1 },
    { address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", symbol: "UNI", name: "Uniswap", category: "defi", chainId: 1 },
    { address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", symbol: "AAVE", name: "Aave", category: "defi", chainId: 1 },
    { address: "0xD533a949740bb3306d119CC777fa900bA034cd52", symbol: "CRV", name: "Curve DAO", category: "defi", chainId: 1 },
    { address: "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", symbol: "LDO", name: "Lido DAO", category: "defi", chainId: 1 },
    { address: "0x808507121B80c02388fAd14726482e061B8da827", symbol: "PENDLE", name: "Pendle", category: "long-tail", chainId: 1 },
    { address: "0xf951E335afb289353dc249e82926178EaC7DEd78", symbol: "swETH", name: "Swell Staked ETH", category: "long-tail", chainId: 1 },
    { address: "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee", symbol: "weETH", name: "Wrapped eETH", category: "long-tail", chainId: 1 },
    { address: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0", symbol: "wstETH", name: "Wrapped stETH", category: "long-tail", chainId: 1 },
    { address: "0xae78736Cd615f374D3085123A210448E74Fc6393", symbol: "rETH", name: "Rocket Pool ETH", category: "long-tail", chainId: 1 },
    { address: "0x18084fbA666a33d37592fA2633fD49a74DD93a88", symbol: "tBTC", name: "tBTC v2", category: "long-tail", chainId: 1 },
    { address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933", symbol: "PEPE", name: "Pepe", category: "long-tail", chainId: 1 },
    { address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE", symbol: "SHIB", name: "Shiba Inu", category: "long-tail", chainId: 1 },
  ],
  "polygon-mainnet": [
    { address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", symbol: "WETH", name: "Wrapped Ether", category: "blue-chip", chainId: 137 },
    { address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6", symbol: "WBTC", name: "Wrapped Bitcoin", category: "blue-chip", chainId: 137 },
    { address: "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39", symbol: "LINK", name: "Chainlink", category: "blue-chip", chainId: 137 },
    { address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", symbol: "USDC", name: "USD Coin", category: "stablecoin", chainId: 137 },
    { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", symbol: "USDT", name: "Tether", category: "stablecoin", chainId: 137 },
    { address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", symbol: "DAI", name: "Dai", category: "stablecoin", chainId: 137 },
    { address: "0xb33EaAd8d922B1083446DC23f610c2567fB5180f", symbol: "UNI", name: "Uniswap", category: "defi", chainId: 137 },
    { address: "0xD6DF932A45C0f255f85145f286eA0b292B21C90B", symbol: "AAVE", name: "Aave", category: "defi", chainId: 137 },
    { address: "0x172370d5Cd63279eFa6d502DAB29171933a610AF", symbol: "CRV", name: "Curve DAO", category: "defi", chainId: 137 },
    { address: "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1", symbol: "miMATIC", name: "MAI Stablecoin", category: "long-tail", chainId: 137 },
    { address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", symbol: "WMATIC", name: "Wrapped Matic", category: "blue-chip", chainId: 137 },
    { address: "0x2C89bbc92BD86F8075d1DEcc58C7F4E0107f286b", symbol: "AVAX", name: "Avalanche Token", category: "long-tail", chainId: 137 },
  ],
  "bsc-mainnet": [
    { address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", symbol: "WBNB", name: "Wrapped BNB", category: "blue-chip", chainId: 56 },
    { address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", symbol: "ETH", name: "Binance-Peg Ethereum", category: "blue-chip", chainId: 56 },
    { address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", symbol: "BTCB", name: "Binance-Peg BTCB", category: "blue-chip", chainId: 56 },
    { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", symbol: "USDC", name: "USD Coin", category: "stablecoin", chainId: 56 },
    { address: "0x55d398326f99059fF775485246999027B3197955", symbol: "USDT", name: "Tether", category: "stablecoin", chainId: 56 },
    { address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", symbol: "DAI", name: "Dai", category: "stablecoin", chainId: 56 },
    { address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", symbol: "CAKE", name: "PancakeSwap", category: "defi", chainId: 56 },
    { address: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1", symbol: "UNI", name: "Uniswap", category: "defi", chainId: 56 },
    { address: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD", symbol: "LINK", name: "Chainlink", category: "defi", chainId: 56 },
    { address: "0xfb6115445Bff7b52FeB98650C87f44907E58f802", symbol: "AAVE", name: "Aave", category: "defi", chainId: 56 },
    { address: "0xBA2aE424d960c26247Dd6c32edC70B295c744C43", symbol: "DOGE", name: "Binance-Peg Dogecoin", category: "long-tail", chainId: 56 },
    { address: "0x2859e4544C4bB03966803b044A93563Bd2D0DD4D", symbol: "SHIB", name: "Shiba Inu", category: "long-tail", chainId: 56 },
  ],
  "arbitrum-mainnet": [
    { address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", symbol: "WETH", name: "Wrapped Ether", category: "blue-chip", chainId: 42161 },
    { address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", symbol: "WBTC", name: "Wrapped Bitcoin", category: "blue-chip", chainId: 42161 },
    { address: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4", symbol: "LINK", name: "Chainlink", category: "blue-chip", chainId: 42161 },
    { address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", symbol: "USDC", name: "USD Coin", category: "stablecoin", chainId: 42161 },
    { address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", symbol: "USDT", name: "Tether", category: "stablecoin", chainId: 42161 },
    { address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", symbol: "DAI", name: "Dai", category: "stablecoin", chainId: 42161 },
    { address: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0", symbol: "UNI", name: "Uniswap", category: "defi", chainId: 42161 },
    { address: "0x912CE59144191C1204E64559FE8253a0e49E6548", symbol: "ARB", name: "Arbitrum", category: "defi", chainId: 42161 },
    { address: "0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8", symbol: "PENDLE", name: "Pendle", category: "long-tail", chainId: 42161 },
    { address: "0x5979D7b546E38E9Ab8ED1aF6C66fc9395e7b3A36", symbol: "wstETH", name: "Wrapped stETH", category: "long-tail", chainId: 42161 },
    { address: "0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe", symbol: "weETH", name: "Wrapped eETH", category: "long-tail", chainId: 42161 },
    { address: "0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8", symbol: "rETH", name: "Rocket Pool ETH", category: "long-tail", chainId: 42161 },
  ],
  "optimism-mainnet": [
    { address: "0x4200000000000000000000000000000000000006", symbol: "WETH", name: "Wrapped Ether", category: "blue-chip", chainId: 10 },
    { address: "0x68f180fcCe6836688e9084f035309E29Bf0A2095", symbol: "WBTC", name: "Wrapped Bitcoin", category: "blue-chip", chainId: 10 },
    { address: "0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6", symbol: "LINK", name: "Chainlink", category: "blue-chip", chainId: 10 },
    { address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", symbol: "USDC", name: "USD Coin", category: "stablecoin", chainId: 10 },
    { address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", symbol: "USDT", name: "Tether", category: "stablecoin", chainId: 10 },
    { address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", symbol: "DAI", name: "Dai", category: "stablecoin", chainId: 10 },
    { address: "0x4200000000000000000000000000000000000042", symbol: "OP", name: "Optimism", category: "defi", chainId: 10 },
    { address: "0x76FB31fb4af56892A25e32cFC43De717950c9278", symbol: "AAVE", name: "Aave", category: "defi", chainId: 10 },
    { address: "0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb", symbol: "wstETH", name: "Wrapped stETH", category: "long-tail", chainId: 10 },
    { address: "0x9Bcef72be871e61ED4fBbc7630889beE758eb81D", symbol: "rETH", name: "Rocket Pool ETH", category: "long-tail", chainId: 10 },
  ],
  "base-mainnet": [
    { address: "0x4200000000000000000000000000000000000006", symbol: "WETH", name: "Wrapped Ether", category: "blue-chip", chainId: 8453 },
    { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", symbol: "USDC", name: "USD Coin", category: "stablecoin", chainId: 8453 },
    { address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", symbol: "DAI", name: "Dai", category: "stablecoin", chainId: 8453 },
    { address: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA", symbol: "USDbC", name: "USD Base Coin", category: "stablecoin", chainId: 8453 },
    { address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22", symbol: "cbETH", name: "Coinbase Wrapped Staked ETH", category: "long-tail", chainId: 8453 },
    { address: "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452", symbol: "wstETH", name: "Wrapped stETH", category: "long-tail", chainId: 8453 },
    { address: "0xB6fe221Fe9EeF5aBa221c348bA20A1Bf5e73624c", symbol: "rETH", name: "Rocket Pool ETH", category: "long-tail", chainId: 8453 },
    { address: "0x940181a94A35A4569E4529A3CDfB74e38FD98631", symbol: "AERO", name: "Aerodrome Finance", category: "defi", chainId: 8453 },
  ],
  "avalanche-mainnet": [
    { address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", symbol: "WAVAX", name: "Wrapped AVAX", category: "blue-chip", chainId: 43114 },
    { address: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB", symbol: "WETH.e", name: "Wrapped Ether", category: "blue-chip", chainId: 43114 },
    { address: "0x50b7545627a5162F82A992c33b87aDc75187B218", symbol: "WBTC.e", name: "Wrapped Bitcoin", category: "blue-chip", chainId: 43114 },
    { address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", symbol: "USDC", name: "USD Coin", category: "stablecoin", chainId: 43114 },
    { address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", symbol: "USDT", name: "Tether", category: "stablecoin", chainId: 43114 },
    { address: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", symbol: "DAI.e", name: "Dai", category: "stablecoin", chainId: 43114 },
    { address: "0x5947BB275c521040051D82396192181b413227A3", symbol: "LINK.e", name: "Chainlink", category: "defi", chainId: 43114 },
    { address: "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd", symbol: "JOE", name: "Trader Joe", category: "defi", chainId: 43114 },
    { address: "0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE", symbol: "sAVAX", name: "Staked AVAX", category: "long-tail", chainId: 43114 },
    { address: "0x152b9d0FdC40C096DE0fF02170EE15fd68Df004A", symbol: "BTC.b", name: "Bitcoin Bridged", category: "long-tail", chainId: 43114 },
  ],
};

export const PRICING_TEST_TOKENS: PricingToken[] = PRICING_TOKENS_BY_CHAIN["eth-mainnet"];

export function getPricingTokensForChain(chainId: string): PricingToken[] {
  return PRICING_TOKENS_BY_CHAIN[chainId] || PRICING_TOKENS_BY_CHAIN["eth-mainnet"];
}

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

export interface ProviderMeta {
  displayName: string;
  color: string;
  endpoints: {
    balances: string;
    pricing: string;
  };
}

export const PROVIDER_META: Record<ProviderName, ProviderMeta> = {
  covalent: {
    displayName: "Covalent (GoldRush)",
    color: "#FF4C3B",
    endpoints: {
      balances: "GET /v1/{chainId}/address/{wallet}/balances_v2/",
      pricing: "GET /v1/pricing/historical_by_addresses_v2/{chainId}/USD/{address}/",
    },
  },
  alchemy: {
    displayName: "Alchemy",
    color: "#5B8DEF",
    endpoints: {
      balances: "POST alchemy_getTokenBalances + alchemy_getTokenMetadata",
      pricing: "POST /prices/v1/tokens/by-address",
    },
  },
  moralis: {
    displayName: "Moralis",
    color: "#57C5B6",
    endpoints: {
      balances: "GET /api/v2.2/{wallet}/erc20",
      pricing: "POST /api/v2.2/erc20/prices",
    },
  },
  mobula: {
    displayName: "Mobula",
    color: "#E5A93D",
    endpoints: {
      balances: "GET /api/1/wallet/portfolio",
      pricing: "GET /api/1/market/multi-data",
    },
  },
};
