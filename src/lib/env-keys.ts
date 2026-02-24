import { ProviderName } from "./types";

const ENV_KEY_MAP: Record<ProviderName, string> = {
  covalent: "COVALENT_API_KEY",
  alchemy: "ALCHEMY_API_KEY",
  moralis: "MORALIS_API_KEY",
  mobula: "MOBULA_API_KEY",
  codex: "CODEX_API_KEY",
};

export function getEnvKey(provider: ProviderName): string | undefined {
  const val = process.env[ENV_KEY_MAP[provider]];
  return val && val.trim().length > 0 ? val.trim() : undefined;
}

export function maskKey(key: string): string {
  if (key.length <= 8) return "*".repeat(key.length);
  return key.slice(0, 4) + "*".repeat(key.length - 8) + key.slice(-4);
}

export function getEnvKeyStatus(): Record<ProviderName, { hasEnvKey: boolean; masked: string }> {
  const providers: ProviderName[] = ["covalent", "alchemy", "moralis", "mobula", "codex"];
  const result = {} as Record<ProviderName, { hasEnvKey: boolean; masked: string }>;

  for (const p of providers) {
    const key = getEnvKey(p);
    result[p] = {
      hasEnvKey: !!key,
      masked: key ? maskKey(key) : "",
    };
  }

  return result;
}

export function resolveApiKey(
  provider: ProviderName,
  clientKey?: string
): string | undefined {
  const envKey = getEnvKey(provider);
  if (envKey) return envKey;
  return clientKey && clientKey.trim().length > 0 ? clientKey.trim() : undefined;
}
