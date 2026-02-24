"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProviderName, PROVIDER_META, EnvKeyStatus } from "@/lib/types";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (keys: Record<ProviderName, string>) => void;
  currentKeys: Record<ProviderName, string>;
  envKeys: Record<ProviderName, EnvKeyStatus>;
}

const PROVIDER_DOCS: Record<ProviderName, string> = {
  covalent: "https://www.covalenthq.com/platform/auth/register/",
  alchemy: "https://dashboard.alchemy.com/",
  moralis: "https://admin.moralis.io/register",
  mobula: "https://developer.mobula.fi/",
};

function maskLocalKey(key: string): string {
  if (!key || key.length <= 8) return key ? "*".repeat(key.length) : "";
  return key.slice(0, 4) + "****" + key.slice(-4);
}

export default function ApiKeyModal({ isOpen, onClose, onSave, currentKeys, envKeys }: ApiKeyModalProps) {
  const [keys, setKeys] = useState<Record<ProviderName, string>>({ ...currentKeys });
  const [editing, setEditing] = useState<Record<ProviderName, boolean>>({
    covalent: false, alchemy: false, moralis: false, mobula: false,
  });
  const [revealed, setRevealed] = useState<Record<ProviderName, boolean>>({
    covalent: false, alchemy: false, moralis: false, mobula: false,
  });

  useEffect(() => {
    if (isOpen) {
      setKeys({ ...currentKeys });
      setEditing({ covalent: false, alchemy: false, moralis: false, mobula: false });
      setRevealed({ covalent: false, alchemy: false, moralis: false, mobula: false });
    }
  }, [currentKeys, isOpen]);

  const handleSave = () => {
    onSave(keys);
    onClose();
  };

  const providers = Object.keys(PROVIDER_META) as ProviderName[];
  const configuredCount = providers.filter(
    (p) => envKeys[p]?.hasEnvKey || keys[p]?.trim().length > 0
  ).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/25 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="bg-white border border-[#E8E5E0] rounded-2xl shadow-2xl shadow-black/15 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-5 pt-5 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg font-semibold text-[#1a1a1a]">API Keys</h2>
                  <span className="text-xs text-[#A8A29E] bg-[#F5F3F0] px-2 py-1 rounded-md font-medium">
                    {configuredCount}/{providers.length} configured
                  </span>
                </div>
              </div>

              {/* Provider List */}
              <div className="px-5 pb-2">
                <div className="space-y-3">
                  {providers.map((provider) => {
                    const meta = PROVIDER_META[provider];
                    const env = envKeys[provider];
                    const hasEnvKey = env?.hasEnvKey;
                    const hasLocalKey = keys[provider]?.trim().length > 0;
                    const isEditing = editing[provider];
                    const isRevealed = revealed[provider];

                    return (
                      <div
                        key={provider}
                        className="bg-[#FAFAF8] border border-[#E8E5E0] rounded-xl p-3 transition-all duration-150"
                      >
                        {/* Provider Header Row */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-2.5 h-2.5 rounded-full ring-1 ring-white shadow-sm"
                              style={{ backgroundColor: meta.color }}
                            />
                            <span className="text-sm font-medium text-[#1a1a1a]">{meta.displayName}</span>
                            {hasEnvKey && (
                              <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1 font-medium">
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                .env
                              </span>
                            )}
                            {!hasEnvKey && hasLocalKey && !isEditing && (
                              <span className="text-[10px] bg-[#FFF5F4] text-[#FF4C3B] px-1.5 py-0.5 rounded-md border border-[#FF4C3B]/15 font-medium">
                                saved
                              </span>
                            )}
                          </div>
                          <a
                            href={PROVIDER_DOCS[provider]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[#A8A29E] hover:text-[#78716C] transition-colors flex items-center gap-1"
                          >
                            Get key
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>

                        {/* Key Display */}
                        {hasEnvKey && !isEditing ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                              <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              <span className="text-xs font-mono text-[#78716C] truncate">
                                {env.masked}
                              </span>
                              <span className="text-[10px] text-emerald-500 ml-auto shrink-0 font-medium">default</span>
                            </div>
                            <button
                              onClick={() => setEditing({ ...editing, [provider]: true })}
                              className="text-[11px] text-[#A8A29E] hover:text-[#78716C] transition-colors flex items-center gap-1"
                            >
                              Use your own key instead
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        ) : isEditing || !hasLocalKey ? (
                          <div>
                            <div className="relative">
                              <input
                                type="password"
                                value={keys[provider] || ""}
                                onChange={(e) => setKeys({ ...keys, [provider]: e.target.value })}
                                placeholder="Paste your API key here..."
                                className="w-full bg-white border border-[#E8E5E0] rounded-lg px-3 py-2 text-xs text-[#1a1a1a] font-mono placeholder-[#D6D3CE] focus:outline-none focus:ring-2 focus:ring-[#FF4C3B]/15 focus:border-[#FF4C3B]/30 transition-all pr-16"
                                autoFocus={isEditing}
                              />
                              {(hasLocalKey || hasEnvKey) && (
                                <button
                                  onClick={() => {
                                    setEditing({ ...editing, [provider]: false });
                                    if (hasEnvKey && !hasLocalKey) {
                                      setKeys({ ...keys, [provider]: "" });
                                    }
                                  }}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-[#A8A29E] hover:text-[#1a1a1a] transition-colors bg-[#F5F3F0] px-2 py-0.5 rounded font-medium"
                                >
                                  {hasEnvKey ? "Use default" : "Cancel"}
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 bg-white border border-[#E8E5E0] rounded-lg px-3 py-2">
                            <span className="text-xs font-mono text-[#78716C] truncate">
                              {isRevealed ? keys[provider] : maskLocalKey(keys[provider])}
                            </span>
                            <div className="flex items-center gap-0.5 shrink-0 ml-auto">
                              <button
                                onClick={() => setRevealed({ ...revealed, [provider]: !isRevealed })}
                                className="p-1.5 text-[#D6D3CE] hover:text-[#78716C] transition-colors rounded-md hover:bg-[#F5F3F0]"
                                title={isRevealed ? "Hide" : "Show"}
                              >
                                {isRevealed ? (
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                  </svg>
                                ) : (
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setEditing({ ...editing, [provider]: true });
                                  setRevealed({ ...revealed, [provider]: false });
                                }}
                                className="p-1.5 text-[#D6D3CE] hover:text-[#78716C] transition-colors rounded-md hover:bg-[#F5F3F0]"
                                title="Edit"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setKeys({ ...keys, [provider]: "" })}
                                className="p-1.5 text-[#D6D3CE] hover:text-red-400 transition-colors rounded-md hover:bg-red-50"
                                title="Remove"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-[#E8E5E0] flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-[#D6D3CE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-[11px] text-[#A8A29E]">
                    Keys are never sent to third parties.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-[#78716C] hover:text-[#1a1a1a] hover:bg-[#F5F3F0] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-lg text-xs font-medium bg-[#1a1a1a] text-white hover:bg-[#333] active:scale-[0.97] transition-all shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
