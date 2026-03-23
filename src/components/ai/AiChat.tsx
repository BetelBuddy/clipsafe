import { useState, useRef, useEffect, useCallback } from 'react';
import { useAiStore, AI_MODELS, type AiProvider, type AiMessage as AiMessageType, type AiToolCallInfo } from '@/stores/aiStore';
import { streamAiChat } from '@/lib/ai';
import { Send, Settings, X, Loader2, Trash2, Wrench, Check, AlertCircle, Bot, User, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

function AiToolCallBadge({ tc, expandable }: { tc: AiToolCallInfo; expandable?: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full">
      <button
        onClick={() => expandable && setExpanded(!expanded)}
        className={cn(
          'inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full border w-full text-left',
          tc.status === 'calling' && 'border-secondary/50 text-secondary bg-secondary/10',
          tc.status === 'done' && 'border-green-500/50 text-green-400 bg-green-500/10',
          tc.status === 'error' && 'border-destructive/50 text-destructive bg-destructive/10',
          expandable && 'cursor-pointer hover:opacity-80',
        )}
      >
        {tc.status === 'calling' && <Loader2 className="w-2.5 h-2.5 animate-spin flex-shrink-0" />}
        {tc.status === 'done' && <Check className="w-2.5 h-2.5 flex-shrink-0" />}
        {tc.status === 'error' && <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" />}
        <Wrench className="w-2.5 h-2.5 flex-shrink-0" />
        <span className="truncate flex-1">{tc.name}</span>
        {tc.durationMs !== undefined && tc.status === 'done' && (
          <span className="opacity-60 flex-shrink-0">({(tc.durationMs / 1000).toFixed(1)}s)</span>
        )}
        {expandable && (
          expanded ? <ChevronDown className="w-2.5 h-2.5 flex-shrink-0" /> : <ChevronRight className="w-2.5 h-2.5 flex-shrink-0" />
        )}
      </button>
      {expanded && (
        <div className="mt-1 ml-2 p-2 rounded bg-background/50 border border-border text-[10px] font-mono space-y-1.5 max-h-40 overflow-auto">
          <div>
            <span className="text-muted-foreground">Args: </span>
            <pre className="whitespace-pre-wrap break-all text-foreground/80">
              {JSON.stringify(tc.args, null, 2)}
            </pre>
          </div>
          {tc.result && (
            <div>
              <span className="text-muted-foreground">Result: </span>
              <pre className="whitespace-pre-wrap break-all text-foreground/80">{tc.result}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ msg }: { msg: AiMessageType }) {
  const isUser = msg.role === 'user';
  return (
    <div className={cn('flex gap-2 px-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div className={cn(
        'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
        isUser ? 'bg-primary/20' : 'bg-surface-elevated',
      )}>
        {isUser ? <User className="w-3 h-3 text-primary" /> : <Bot className="w-3 h-3 text-muted-foreground" />}
      </div>
      <div className={cn(
        'max-w-[85%] rounded-lg px-3 py-2 text-sm',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-surface-elevated text-foreground',
      )}>
        {isUser ? (
          <p>{msg.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}
        {msg.toolCalls && msg.toolCalls.length > 0 && (
          <div className="flex flex-col gap-1 mt-2">
            {msg.toolCalls.map((tc) => <AiToolCallBadge key={tc.id} tc={tc} expandable />)}
          </div>
        )}
      </div>
    </div>
  );
}

export function AiChat() {
  const {
    messages, keys, selectedModel, setSelectedModel, setKey,
    addMessage, updateLastAssistant, isStreaming, setStreaming,
    addToolCall, updateToolCall, clearMessages, clearActiveToolCalls,
    activeToolCalls,
  } = useAiStore();

  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const currentModel = AI_MODELS.find((m) => m.id === selectedModel);
  const currentProvider = currentModel?.provider || 'openai';
  const hasKey = !!keys[currentProvider];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, activeToolCalls]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming || !hasKey) return;
    const text = input.trim();
    setInput('');

    clearActiveToolCalls();

    const userMsg: AiMessageType = { id: crypto.randomUUID(), role: 'user', content: text, timestamp: Date.now() };
    addMessage(userMsg);
    setStreaming(true);

    const chatMessages = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
    abortRef.current = new AbortController();

    const timeoutId = setTimeout(() => {
      abortRef.current?.abort();
    }, 60000);

    let assistantContent = '';

    try {
      await streamAiChat(
        chatMessages,
        selectedModel,
        keys[currentProvider],
        {
          onDelta: (delta) => {
            assistantContent += delta;
            updateLastAssistant(assistantContent);
          },
          onToolCall: (tc) => addToolCall(tc),
          onToolCallUpdate: (id, updates) => updateToolCall(id, updates),
          onDone: () => {
            clearTimeout(timeoutId);
            setStreaming(false);
            // Attach tool calls to last assistant message
            const aiState = useAiStore.getState();
            const msgs = [...aiState.messages];
            const lastIdx = msgs.length - 1;
            if (lastIdx >= 0 && msgs[lastIdx].role === 'assistant' && aiState.activeToolCalls.length > 0) {
              msgs[lastIdx] = { ...msgs[lastIdx], toolCalls: [...aiState.activeToolCalls] };
              // Manually update messages
              useAiStore.setState({ messages: msgs });
            }
            const stale = aiState.activeToolCalls.filter(tc => tc.status === 'calling');
            stale.forEach(tc => updateToolCall(tc.id, { status: 'error', result: 'Stream ended unexpectedly' }));
          },
          onError: (err) => {
            clearTimeout(timeoutId);
            updateLastAssistant(assistantContent + `\n\n⚠️ Error: ${err}`);
            setStreaming(false);
            const stale = useAiStore.getState().activeToolCalls.filter(tc => tc.status === 'calling');
            stale.forEach(tc => updateToolCall(tc.id, { status: 'error', result: err }));
          },
        },
        abortRef.current.signal,
      );
    } catch {
      clearTimeout(timeoutId);
      setStreaming(false);
    }
  }, [input, isStreaming, hasKey, messages, selectedModel, keys, currentProvider, addMessage, setStreaming, updateLastAssistant, addToolCall, updateToolCall, clearActiveToolCalls]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <img src="/logo.png" className="w-10 h-10 object-contain dark:hidden" alt="ClipSafe AI" />
          <img src="/logo-white.png" className="w-10 h-10 object-contain hidden dark:block" alt="ClipSafe AI" />
          <span className="text-xs font-semibold">AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => clearMessages()}>
            <Trash2 className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="border-b border-border p-3 space-y-3 bg-surface">
          <div>
            <label className="text-[10px] text-muted-foreground uppercase mb-1 block">Model</label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id} className="text-xs">{m.name} ({m.provider})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(['openai', 'gemini', 'anthropic'] as AiProvider[]).map((p) => (
            <div key={p}>
              <label className="text-[10px] text-muted-foreground uppercase mb-1 block">{p} API Key</label>
              <Input
                type="password"
                value={keys[p]}
                onChange={(e) => setKey(p, e.target.value)}
                placeholder={`Enter ${p} key...`}
                className="h-7 text-xs"
              />
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full text-xs h-7" onClick={() => setShowSettings(false)}>
            <X className="w-3 h-3 mr-1" /> Close
          </Button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-2 px-4 text-center">
            <img src="/logo.png" className="w-40 h-40 opacity-40 object-contain mb-6 dark:hidden" alt="ClipSafe Logo" />
            <img src="/logo-white.png" className="w-40 h-40 opacity-40 object-contain mb-6 hidden dark:block" alt="ClipSafe Logo" />
            <span className="font-medium">ClipSafe AI</span>
            <span>Ask me to edit your video. I can trim, compress, add effects, style captions, and more.</span>
            {!hasKey && (
              <Button variant="outline" size="sm" className="text-xs mt-2" onClick={() => setShowSettings(true)}>
                <Settings className="w-3 h-3 mr-1" /> Add API Key to start
              </Button>
            )}
          </div>
        )}
        {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}

        {/* Live tool calls (in progress) */}
        {activeToolCalls.length > 0 && (
          <div className="px-3 space-y-1">
            <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 mb-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Tools running...
            </div>
            {activeToolCalls.map((tc) => (
              <AiToolCallBadge key={tc.id} tc={tc} expandable />
            ))}
          </div>
        )}
        {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && activeToolCalls.length === 0 && (
          <div className="px-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-2">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasKey ? 'Ask AI to edit your video...' : 'Add an API key first...'}
            disabled={!hasKey || isStreaming}
            className="h-8 text-xs"
          />
          <Button size="icon" className="h-8 w-8" onClick={handleSend} disabled={!input.trim() || isStreaming || !hasKey}>
            {isStreaming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
