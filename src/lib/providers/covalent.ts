import { TokenBalance, SUPPORTED_CHAINS } from "../types";

export async function fetchCovalentBalances(
  walletAddress: string,
  chain: string,
  apiKey: string
): Promise<TokenBalance[]> {
  const chainConfig = SUPPORTED_CHAINS.find((c) => c.id === chain) || SUPPORTED_CHAINS[0];
  const url = `https://api.covalenthq.com/v1/${chainConfig.covalentId}/address/${walletAddress}/balances_v2/?key=${apiKey}&no-spam=true&no-nft-asset-metadata=true`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Covalent API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const items = json?.data?.items || [];

  return items.map((item: Record<string, unknown>) => ({
    token_address: item.contract_address as string | undefined,
    name: item.contract_name as string | undefined,
    symbol: item.contract_ticker_symbol as string | undefined,
    decimals: item.contract_decimals as number | undefined,
    logo_url: item.logo_url as string | undefined,
    balance: item.balance?.toString(),
    balance_usd: item.quote as number | undefined,
    price_usd: item.quote_rate as number | undefined,
    price_24h_change: item.quote_rate_24h as number | undefined,
    contract_type: item.type as string | undefined,
    is_spam: item.is_spam as boolean | undefined,
    last_transfer_date: item.last_transferred_at as string | undefined,
  }));
}
