import { TokenBalance, SUPPORTED_CHAINS } from "../types";

export async function fetchMobulaBalances(
  walletAddress: string,
  chain: string,
  apiKey: string
): Promise<TokenBalance[]> {
  const chainConfig = SUPPORTED_CHAINS.find((c) => c.id === chain) || SUPPORTED_CHAINS[0];
  const url = `https://api.mobula.io/api/1/wallet/portfolio?wallet=${walletAddress}&blockchains=${chainConfig.mobulaChain}`;

  const res = await fetch(url, {
    headers: {
      Authorization: apiKey,
    },
  });

  if (!res.ok) {
    throw new Error(`Mobula API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const assets = json?.data?.assets || [];

  return assets.map((asset: Record<string, unknown>) => ({
    token_address: asset.token_address as string | undefined,
    name: asset.asset?.toString(),
    symbol: asset.symbol as string | undefined,
    decimals: asset.decimals as number | undefined,
    logo_url: asset.logo as string | undefined,
    balance: asset.token_balance?.toString(),
    balance_usd: asset.estimated_balance as number | undefined,
    price_usd: asset.price as number | undefined,
    price_24h_change: asset.price_change_24h as number | undefined,
    contract_type: asset.type as string | undefined,
    is_spam: undefined,
    last_transfer_date: undefined,
  }));
}
