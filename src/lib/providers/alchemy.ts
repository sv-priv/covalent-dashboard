import { TokenBalance, SUPPORTED_CHAINS } from "../types";

export async function fetchAlchemyBalances(
  walletAddress: string,
  chain: string,
  apiKey: string
): Promise<TokenBalance[]> {
  const chainConfig = SUPPORTED_CHAINS.find((c) => c.id === chain) || SUPPORTED_CHAINS[0];
  const url = `https://${chainConfig.alchemySubdomain}.g.alchemy.com/v2/${apiKey}`;

  const balancesRes = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "alchemy_getTokenBalances",
      params: [walletAddress, "erc20"],
    }),
  });

  if (!balancesRes.ok) {
    throw new Error(`Alchemy API error: ${balancesRes.status} ${balancesRes.statusText}`);
  }

  const balancesJson = await balancesRes.json();
  const tokenBalances = balancesJson?.result?.tokenBalances || [];

  const nonZero = tokenBalances.filter(
    (t: { tokenBalance: string }) =>
      t.tokenBalance && t.tokenBalance !== "0x0000000000000000000000000000000000000000000000000000000000000000"
  );

  const metaBatch = nonZero.slice(0, 50).map((_: unknown, i: number) => ({
    jsonrpc: "2.0",
    id: i,
    method: "alchemy_getTokenMetadata",
    params: [(nonZero[i] as { contractAddress: string }).contractAddress],
  }));

  let metaResults: Record<string, unknown>[] = [];
  if (metaBatch.length > 0) {
    const metaRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(metaBatch),
    });
    if (metaRes.ok) {
      metaResults = await metaRes.json();
    }
  }

  const metaMap = new Map<number, Record<string, unknown>>();
  if (Array.isArray(metaResults)) {
    metaResults.forEach((r) => {
      metaMap.set(r.id as number, r.result as Record<string, unknown>);
    });
  }

  return nonZero.slice(0, 50).map((t: { contractAddress: string; tokenBalance: string }, i: number) => {
    const meta = metaMap.get(i) || {};
    return {
      token_address: t.contractAddress,
      name: meta.name as string | undefined,
      symbol: meta.symbol as string | undefined,
      decimals: meta.decimals as number | undefined,
      logo_url: meta.logo as string | undefined,
      balance: t.tokenBalance,
      balance_usd: undefined,
      price_usd: undefined,
      price_24h_change: undefined,
      contract_type: "ERC-20",
      is_spam: undefined,
      last_transfer_date: undefined,
    };
  });
}
