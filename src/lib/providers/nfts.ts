import { ProviderName, SUPPORTED_CHAINS } from "../types";

type NftFetcher = (wallet: string, chain: string, apiKey: string) => Promise<number>;

async function fetchCovalentNfts(
  wallet: string,
  chain: string,
  apiKey: string
): Promise<number> {
  const chainConfig = SUPPORTED_CHAINS.find((c) => c.id === chain) || SUPPORTED_CHAINS[0];
  const url = `https://api.covalenthq.com/v1/${chainConfig.covalentId}/address/${wallet}/balances_nft/?key=${apiKey}&no-spam=true`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Covalent NFT API error: ${res.status} ${res.statusText}`);

  const json = await res.json();
  const items = json?.data?.items || [];
  return items.length;
}

async function fetchAlchemyNfts(
  wallet: string,
  chain: string,
  apiKey: string
): Promise<number> {
  const chainConfig = SUPPORTED_CHAINS.find((c) => c.id === chain) || SUPPORTED_CHAINS[0];
  const url = `https://${chainConfig.alchemySubdomain}.g.alchemy.com/nft/v3/${apiKey}/getNFTsForOwner?owner=${wallet}&withMetadata=false&pageSize=100`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Alchemy NFT API error: ${res.status} ${res.statusText}`);

  const json = await res.json();
  return json?.totalCount ?? (json?.ownedNfts?.length || 0);
}

async function fetchMoralisNfts(
  wallet: string,
  chain: string,
  apiKey: string
): Promise<number> {
  const chainConfig = SUPPORTED_CHAINS.find((c) => c.id === chain) || SUPPORTED_CHAINS[0];
  const url = `https://deep-index.moralis.io/api/v2.2/${wallet}/nft?chain=${chainConfig.moralisChain}&limit=100`;

  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      "X-API-Key": apiKey,
    },
  });
  if (!res.ok) throw new Error(`Moralis NFT API error: ${res.status} ${res.statusText}`);

  const json = await res.json();
  return json?.total ?? (json?.result?.length || 0);
}

async function fetchMobulaNfts(
  wallet: string,
  _chain: string,
  _apiKey: string
): Promise<number> {
  const url = `https://demo-api.mobula.io/api/1/wallet/nfts?wallet=${wallet}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Mobula NFT API error: ${res.status} ${res.statusText}`);

  const json = await res.json();
  const data = json?.data || [];
  return Array.isArray(data) ? data.length : 0;
}

export const nftProviderFunctions: Record<ProviderName, NftFetcher> = {
  covalent: fetchCovalentNfts,
  alchemy: fetchAlchemyNfts,
  moralis: fetchMoralisNfts,
  mobula: fetchMobulaNfts,
};
