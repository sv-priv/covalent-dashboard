import { TokenBalance, SUPPORTED_CHAINS } from "../types";

const WELL_KNOWN_TOKENS_BY_CHAIN: Record<number, string[]> = {
  1: [
    "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
    "0x514910771AF9Ca656af840dff83E8264EcF986CA", // LINK
    "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", // UNI
    "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", // AAVE
  ],
  137: [
    "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // USDC
    "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // USDT
    "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WMATIC
    "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // WETH
  ],
  56: [
    "0x55d398326f99059fF775485246999027B3197955", // USDT
    "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC
    "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
    "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", // ETH
  ],
};

export async function fetchCodexBalances(
  walletAddress: string,
  chain: string,
  apiKey: string
): Promise<TokenBalance[]> {
  const chainConfig = SUPPORTED_CHAINS.find((c) => c.id === chain) || SUPPORTED_CHAINS[0];
  const networkId = chainConfig.codexNetworkId;

  // First, attempt the `balances` query (requires Growth/Enterprise plan)
  const balancesQuery = `{
    balances(walletAddress: "${walletAddress}", networks: [${networkId}], removeScams: true, limit: 50) {
      items {
        walletAddress
        tokenAddress
        balance
        shiftedBalance
        balanceUsd
        tokenPriceUsd
        token {
          address
          name
          symbol
          decimals
          isScam
          info {
            imageSmallUrl
          }
        }
      }
    }
  }`;

  const balancesRes = await fetch("https://graph.codex.io/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({ query: balancesQuery }),
  });

  if (balancesRes.ok) {
    const balancesJson = await balancesRes.json();
    if (!balancesJson.errors && balancesJson?.data?.balances?.items?.length > 0) {
      return balancesJson.data.balances.items.map((item: Record<string, unknown>) => {
        const token = (item.token || {}) as Record<string, unknown>;
        const info = (token.info || {}) as Record<string, unknown>;
        return {
          token_address: (item.tokenAddress || token.address) as string | undefined,
          name: token.name as string | undefined,
          symbol: token.symbol as string | undefined,
          decimals: token.decimals as number | undefined,
          logo_url: info.imageSmallUrl as string | undefined,
          balance: item.balance?.toString() || item.shiftedBalance?.toString(),
          balance_usd: item.balanceUsd as number | undefined,
          price_usd: item.tokenPriceUsd as number | undefined,
          price_24h_change: undefined,
          contract_type: undefined,
          is_spam: token.isScam as boolean | undefined,
          last_transfer_date: undefined,
        };
      });
    }
  }

  // Fallback: use the `tokens` query (available on free plan) with well-known tokens
  const tokens = WELL_KNOWN_TOKENS_BY_CHAIN[networkId] || WELL_KNOWN_TOKENS_BY_CHAIN[1];
  const tokenIds = tokens.map((addr) => `"${addr}:${networkId}"`).join(", ");
  const tokensQuery = `{
    tokens(ids: [${tokenIds}]) {
      address
      name
      symbol
      decimals
      isScam
      info {
        imageSmallUrl
        circulatingSupply
      }
    }
  }`;

  const tokensRes = await fetch("https://graph.codex.io/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({ query: tokensQuery }),
  });

  if (!tokensRes.ok) {
    throw new Error(`Codex API error: ${tokensRes.status} ${tokensRes.statusText}`);
  }

  const tokensJson = await tokensRes.json();

  if (tokensJson.errors) {
    throw new Error(`Codex GraphQL error: ${tokensJson.errors[0]?.message || "Unknown error"}`);
  }

  const items = tokensJson?.data?.tokens || [];
  if (items.length === 0) {
    throw new Error("Codex returned no data. Verify your API key at https://dashboard.codex.io/");
  }

  return items
    .filter((item: Record<string, unknown> | null) => item !== null)
    .map((item: Record<string, unknown>) => {
      const info = (item.info || {}) as Record<string, unknown>;
      return {
        token_address: item.address as string | undefined,
        name: item.name as string | undefined,
        symbol: item.symbol as string | undefined,
        decimals: item.decimals as number | undefined,
        logo_url: info.imageSmallUrl as string | undefined,
        balance: undefined,
        balance_usd: undefined,
        price_usd: undefined,
        price_24h_change: undefined,
        contract_type: undefined,
        is_spam: item.isScam as boolean | undefined,
        last_transfer_date: undefined,
      };
    });
}
