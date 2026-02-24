import { TokenBalance, SUPPORTED_CHAINS } from "../types";

export async function fetchMoralisBalances(
  walletAddress: string,
  chain: string,
  apiKey: string
): Promise<TokenBalance[]> {
  const chainConfig = SUPPORTED_CHAINS.find((c) => c.id === chain) || SUPPORTED_CHAINS[0];
  const url = `https://deep-index.moralis.io/api/v2.2/${walletAddress}/erc20?chain=${chainConfig.moralisChain}`;

  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      "X-API-Key": apiKey,
    },
  });

  if (!res.ok) {
    throw new Error(`Moralis API error: ${res.status} ${res.statusText}`);
  }

  const items: Record<string, unknown>[] = await res.json();

  return (Array.isArray(items) ? items : []).map((item) => ({
    token_address: item.token_address as string | undefined,
    name: item.name as string | undefined,
    symbol: item.symbol as string | undefined,
    decimals: Number(item.decimals) || undefined,
    logo_url: item.logo as string | undefined,
    balance: item.balance?.toString(),
    balance_usd: item.usd_value as number | undefined,
    price_usd: item.usd_price as number | undefined,
    price_24h_change: item.usd_price_24hr_percent_change as number | undefined,
    contract_type: "ERC-20",
    is_spam: item.possible_spam as boolean | undefined,
    last_transfer_date: undefined,
  }));
}
