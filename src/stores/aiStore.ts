import { create } from 'zustand';

export type AiProvider = 'openai' | 'gemini' | 'anthropic';

export interface AiModel {
  id: string;
  name: string;
  provider: AiProvider;
  contextWindow: number;
}

export const AI_MODELS: AiModel[] = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', contextWindow: 128000 },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', contextWindow: 128000 },
  { id: 'o3-mini', name: 'o3-mini', provider: 'openai', contextWindow: 128000 },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', provider: 'gemini', contextWindow: 1048576 },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'gemini', contextWindow: 1048576 },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'gemini', contextWindow: 1048576 },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'gemini', contextWindow: 1048576 },
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'anthropic', contextWindow: 200000 },
  { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', provider: 'anthropic', contextWindow: 200000 },
];

export interface AiToolCallInfo {
  id: string;
  name: string;
  args: Record<string, unknown>;
  status: 'calling' | 'done' | 'error';
  result?: string;
  durationMs?: number;
}

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: AiToolCallInfo[];
  timestamp: number;
}

interface AiState {
  keys: Record<AiProvider, string>;
  selectedModel: string;
  messages: AiMessage[];
  isStreaming: boolean;
  streamingContent: string;
  activeToolCalls: AiToolCallInfo[];
  isPanelOpen: boolean;

  setKey: (provider: AiProvider, key: string) => void;
  getKey: (provider: AiProvider) => string;
  setSelectedModel: (id: string) => void;
  addMessage: (msg: AiMessage) => void;
  updateLastAssistant: (content: string) => void;
  setStreaming: (v: boolean) => void;
  setStreamingContent: (c: string) => void;
  addToolCall: (tc: AiToolCallInfo) => void;
  updateToolCall: (id: string, updates: Partial<AiToolCallInfo>) => void;
  clearActiveToolCalls: () => void;
  clearMessages: () => void;
  togglePanel: () => void;
  setPanelOpen: (v: boolean) => void;
  loadKeysFromStorage: () => void;
}

const STORAGE_KEY = 'clipsafe_ai_keys';

function loadKeys(): Record<AiProvider, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { openai: '', gemini: '', anthropic: '' };
}

function saveKeys(keys: Record<AiProvider, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

export const useAiStore = create<AiState>((set, get) => ({
  keys: loadKeys(),
  selectedModel: 'gemini-3-flash-preview',
  messages: [],
  isStreaming: false,
  streamingContent: '',
  activeToolCalls: [],
  isPanelOpen: false,

  setKey: (provider, key) => {
    const keys = { ...get().keys, [provider]: key };
    saveKeys(keys);
    set({ keys });
  },
  getKey: (provider) => get().keys[provider],
  setSelectedModel: (id) => set({ selectedModel: id }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  updateLastAssistant: (content) => set((s) => {
    const msgs = [...s.messages];
    const lastIdx = msgs.length - 1;
    if (lastIdx >= 0 && msgs[lastIdx].role === 'assistant') {
      msgs[lastIdx] = { ...msgs[lastIdx], content };
    } else {
      msgs.push({ id: crypto.randomUUID(), role: 'assistant', content, timestamp: Date.now() });
    }
    return { messages: msgs };
  }),
  setStreaming: (v) => set({ isStreaming: v }),
  setStreamingContent: (c) => set({ streamingContent: c }),
  addToolCall: (tc) => set((s) => ({ activeToolCalls: [...s.activeToolCalls, tc] })),
  updateToolCall: (id, updates) => set((s) => ({
    activeToolCalls: s.activeToolCalls.map((tc) => (tc.id === id ? { ...tc, ...updates } : tc)),
  })),
  clearActiveToolCalls: () => set({ activeToolCalls: [] }),
  clearMessages: () => set({ messages: [], activeToolCalls: [] }),
  togglePanel: () => set((s) => ({ isPanelOpen: !s.isPanelOpen })),
  setPanelOpen: (v) => set({ isPanelOpen: v }),
  loadKeysFromStorage: () => set({ keys: loadKeys() }),
}));
