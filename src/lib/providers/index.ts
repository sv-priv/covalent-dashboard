import { ProviderName, TokenBalance } from "../types";
import { fetchCovalentBalances } from "./covalent";
import { fetchAlchemyBalances } from "./alchemy";
import { fetchMoralisBalances } from "./moralis";
import { fetchMobulaBalances } from "./mobula";
import { fetchCodexBalances } from "./codex";

type ProviderFn = (wallet: string, chain: string, apiKey: string) => Promise<TokenBalance[]>;

export const providerFunctions: Record<ProviderName, ProviderFn> = {
  covalent: fetchCovalentBalances,
  alchemy: fetchAlchemyBalances,
  moralis: fetchMoralisBalances,
  mobula: fetchMobulaBalances,
  codex: fetchCodexBalances,
};
