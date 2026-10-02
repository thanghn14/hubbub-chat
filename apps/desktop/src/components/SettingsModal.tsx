import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { X, Key, Check, Trash2, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProviderInfo {
  id: string;
  name: string;
  description: string;
  placeholder: string;
  isLocal?: boolean;
}

const PROVIDERS: ProviderInfo[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4o-mini và các model OpenAI',
    placeholder: 'sk-proj-...',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude 3.5 Sonnet, Claude Sonnet 4',
    placeholder: 'sk-ant-api03-...',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Cổng đa mô hình AI toàn cầu',
    placeholder: 'sk-or-v1-...',
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Llama 3.3 tốc độ cao (LPU Inference)',
    placeholder: 'gsk_...',
  },
  {
    id: 'ollama',
    name: 'Ollama (Cục bộ)',
    description: 'Mô hình cục bộ tại http://localhost:11434/v1 (Không cần API key)',
    placeholder: 'Không yêu cầu API key',
    isLocal: true,
  },
];

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [keyStatus, setKeyStatus] = useState<Record<string, boolean>>({});
  const [inputKeys, setInputKeys] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function loadStatus() {
      const statusMap: Record<string, boolean> = {};
      for (const p of PROVIDERS) {
        if (p.isLocal) continue;
        try {
          const has = await invoke<boolean>('has_provider_key', { provider: p.id });
          statusMap[p.id] = has;
        } catch (e) {
          console.warn(`Failed to check key for ${p.id}:`, e);
          statusMap[p.id] = false;
        }
      }
      setKeyStatus(statusMap);
    }

    loadStatus();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveKey = async (providerId: string) => {
    const key = inputKeys[providerId]?.trim();
    if (!key) return;

    setSaving((prev) => ({ ...prev, [providerId]: true }));
    try {
      await invoke('set_provider_key', { provider: providerId, apiKey: key });
      setKeyStatus((prev) => ({ ...prev, [providerId]: true }));
      setInputKeys((prev) => ({ ...prev, [providerId]: '' }));
      setSuccessMsg(`Đã lưu API key cho ${providerId} vào Windows Credential Manager!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert(`Lỗi khi lưu key: ${String(err)}`);
    } finally {
      setSaving((prev) => ({ ...prev, [providerId]: false }));
    }
  };

  const handleDeleteKey = async (providerId: string) => {
    if (!confirm(`Bạn có chắc muốn xóa API key của ${providerId}?`)) return;

    try {
      await invoke('delete_provider_key', { provider: providerId });
      setKeyStatus((prev) => ({ ...prev, [providerId]: false }));
      setSuccessMsg(`Đã xóa API key của ${providerId}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert(`Lỗi khi xóa key: ${String(err)}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">Cấu hình Nhà Cung Cấp & API Keys</h2>
              <p className="text-xs text-zinc-400">Bảo vệ qua Windows Credential Manager — không lưu plaintext</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mx-5 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2.5 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Provider List */}
        <div className="p-5 overflow-y-auto space-y-4 divide-y divide-zinc-800/60">
          {PROVIDERS.map((p) => {
            const isConfigured = keyStatus[p.id];
            const isBusy = saving[p.id];

            return (
              <div key={p.id} className="pt-4 first:pt-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-200">{p.name}</span>
                    {p.isLocal ? (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                        Cục bộ
                      </span>
                    ) : isConfigured ? (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                        <Check className="w-3 h-3" /> Đã cấu hình
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3" /> Chưa cấu hình
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-zinc-400 mb-3">{p.description}</p>

                {!p.isLocal && (
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      placeholder={isConfigured ? '••••••••••••••••••••••••••••••••' : p.placeholder}
                      value={inputKeys[p.id] || ''}
                      onChange={(e) =>
                        setInputKeys((prev) => ({ ...prev, [p.id]: e.target.value }))
                      }
                      className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-hidden font-mono"
                    />

                    <button
                      onClick={() => handleSaveKey(p.id)}
                      disabled={isBusy || !inputKeys[p.id]?.trim()}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      {isBusy ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang lưu...
                        </>
                      ) : (
                        'Lưu khóa'
                      )}
                    </button>

                    {isConfigured && (
                      <button
                        onClick={() => handleDeleteKey(p.id)}
                        title="Xóa khóa bí mật này khỏi OS Keyring"
                        className="p-2 border border-zinc-800 hover:border-red-900/60 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 rounded-lg text-xs transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-between text-xs text-zinc-500">
          <span>Khóa API được mã hóa an toàn ở cấp hệ điều hành (OS Keyring).</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
