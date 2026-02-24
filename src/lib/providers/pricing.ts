import { ProviderName, PricingToken, SUPPORTED_CHAINS } from "../types";

export type PriceFetcher = (
  tokens: PricingToken[],
  chain: string,
  apiKey: string
) => Promise<Map<string, number | null>>;

async function fetchCovalentPrices(
  tokens: PricingToken[],
  chain: string,
  apiKey: string
): Promise<Map<string, number | null>> {
  const chainConfig = SUPPORTED_CHAINS.find((c) => c.id === chain) || SUPPORTED_CHAINS[0];
  const results = new Map<string, number | null>();

  const batchSize = 5;
  for (let i = 0; i < tokens.length; i += batchSize) {
    const batch = tokens.slice(i, i + batchSize);
    const promises = batch.map(async (token) => {
      try {
        const url = `https://api.covalenthq.com/v1/pricing/historical_by_addresses_v2/${chainConfig.covalentId}/USD/${token.address.toLowerCase()}/?key=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) { results.set(token.address, null); return; }
        const json = await res.json();
        const items = json?.data?.[0]?.prices;
        if (items && items.length > 0) {
          results.set(token.address, items[0].price ?? null);
        } else {
          results.set(token.address, null);
        }
      } catch {
        results.set(token.address, null);
      }
    });
    await Promise.all(promises);
  }
  return results;
}

async function fetchAlchemyPrices(
  tokens: PricingToken[],
  chain: string,
  apiKey: string
): Promise<Map<string, number | null>> {
  const chainConfig = SUPPORTED_CHAINS.find((c) => c.id === chain) || SUPPORTED_CHAINS[0];
  const results = new Map<string, number | null>();
  const addresses = tokens.map((t) => t.address);

  try {
    const priceUrl = `https://api.g.alchemy.com/prices/v1/${apiKey}/tokens/by-address`;
    const priceRes = await fetch(priceUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        addresses: addresses.map((a) => ({
          network: chainConfig.alchemySubdomain,
          address: a,
        })),
      }),
    });

    if (priceRes.ok) {
      const priceJson = await priceRes.json();
      const priceData = priceJson?.data || [];
      for (const token of tokens) {
        const match = priceData.find(
          (d: Record<string, unknown>) =>
            (d.address as string)?.toLowerCase() === token.address.toLowerCase()
        );
        if (match?.prices?.[0]?.value) {
          results.set(token.address, parseFloat(match.prices[0].value));
        } else {
          results.set(token.address, null);
        }
      }
    } else {
      for (const token of tokens) results.set(token.address, null);
    }
  } catch {
    for (const token of tokens) results.set(token.address, null);
  }

  return results;
}

async function fetchMoralisPrices(
  tokens: PricingToken[],
  chain: string,
  apiKey: string
): Promise<Map<string, number | null>> {
  const chainConfig = SUPPORTED_CHAINS.find((c) => c.id === chain) || SUPPORTED_CHAINS[0];
  const results = new Map<string, number | null>();

  try {
    const body = {
      tokens: tokens.map((t) => ({
        token_address: t.address,
        chain: chainConfig.moralisChain,
      })),
    };

    const res = await fetch(
      "https://deep-index.moralis.io/api/v2.2/erc20/prices",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify(body),
      }
    );

    if (res.ok) {
      const items: Record<string, unknown>[] = await res.json();
      for (const token of tokens) {
        const match = (Array.isArray(items) ? items : []).find(
          (item) =>
            (item.tokenAddress as string)?.toLowerCase() === token.address.toLowerCase()
        );
        if (match?.usdPrice) {
          results.set(token.address, match.usdPrice as number);
        } else {
          results.set(token.address, null);
        }
      }
    } else {
      for (const token of tokens) results.set(token.address, null);
    }
  } catch {
    for (const token of tokens) results.set(token.address, null);
  }

  return results;
}

async function fetchMobulaPrices(
  tokens: PricingToken[],
  _chain: string,
  apiKey: string
): Promise<Map<string, number | null>> {
  const results = new Map<string, number | null>();

  try {
    const addresses = tokens.map((t) => t.address).join(",");
    const url = `https://api.mobula.io/api/1/market/multi-data?assets=${addresses}`;

    const res = await fetch(url, {
      headers: { Authorization: apiKey },
    });

    if (res.ok) {
      const json = await res.json();
      const data = json?.data || {};
      for (const token of tokens) {
        const key = Object.keys(data).find(
          (k) => k.toLowerCase() === token.address.toLowerCase()
        );
        if (key && data[key]?.price) {
          results.set(token.address, data[key].price as number);
        } else {
          results.set(token.address, null);
        }
      }
    } else {
      for (const token of tokens) results.set(token.address, null);
    }
  } catch {
    for (const token of tokens) results.set(token.address, null);
  }

  return results;
}

export const pricingFunctions: Record<ProviderName, PriceFetcher> = {
  covalent: fetchCovalentPrices,
  alchemy: fetchAlchemyPrices,
  moralis: fetchMoralisPrices,
  mobula: fetchMobulaPrices,
};
