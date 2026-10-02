import { useState, useRef, useEffect, type KeyboardEvent, type ChangeEvent } from 'react';
import type { Message, Agent, ToolLog } from '../types';
import {
  Send,
  Square,
  Bot,
  User,
  Wrench,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface ChatViewProps {
  conversationId: string;
  conversationTitle: string;
  messages: Message[];
  agent: Agent | null;
  onSendMessage: (prompt: string) => Promise<void>;
  onCancelRun: () => void;
  isStreaming: boolean;
  streamingText: string;
  activeTools: ToolLog[];
  errorMsg: string | null;
  onOpenSettings: () => void;
}

export const ChatView = ({
  conversationId: _conversationId,
  conversationTitle,
  messages,
  agent,
  onSendMessage,
  onCancelRun,
  isStreaming,
  streamingText,
  activeTools,
  errorMsg,
  onOpenSettings,
}: ChatViewProps) => {
  const [input, setInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages or stream
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, activeTools]);

  // Focus textarea when conversation changes
  useEffect(() => {
    textareaRef.current?.focus();
  }, [conversationTitle]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    const prompt = input.trim();
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    onSendMessage(prompt);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden">
      {/* Top Header */}
      <header className="h-14 border-b border-zinc-800/80 px-5 flex items-center justify-between shrink-0 bg-zinc-900/40 backdrop-blur-xs select-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100 truncate max-w-md">
              {conversationTitle || 'Cuộc trò chuyện'}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <span className="text-indigo-400 font-medium">{agent?.name || 'AI Assistant'}</span>
              <span>•</span>
              <span className="font-mono text-[10px] text-zinc-400">{agent?.model || 'gpt-4o-mini'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {agent && (
            <span className="text-[11px] bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{agent.tools.builtin.length} tools</span>
            </span>
          )}
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {messages.length === 0 && !isStreaming ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 select-none">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 shadow-lg shadow-indigo-500/5">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-zinc-200 mb-1">
              Bắt đầu trò chuyện với {agent?.name || 'Hubbub'}
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mb-4">
              {agent?.system_prompt.slice(0, 140)}...
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              <button
                onClick={() => setInput('Hãy tóm tắt tin tức công nghệ mới nhất hôm nay')}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-zinc-300 transition-colors"
              >
                Tin tức công nghệ mới nhất
              </button>
              <button
                onClick={() => setInput('Giải thích kiến trúc Clean Architecture trong Rust')}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-zinc-300 transition-colors"
              >
                Clean Architecture trong Rust
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 max-w-3xl ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-semibold select-none ${
                    msg.role === 'user'
                      ? 'bg-zinc-700 text-zinc-200'
                      : 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  }`}
                >
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                {/* Content Bubble */}
                <div
                  className={`rounded-xl px-4 py-3 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white shadow-xs rounded-tr-xs'
                      : 'bg-zinc-900 border border-zinc-800/80 text-zinc-200 shadow-xs rounded-tl-xs'
                  }`}
                >
                  {/* Render parts */}
                  {msg.parts.map((part, pIdx) => {
                    if (part.type === 'Text') {
                      const textContent =
                        typeof part.content === 'string'
                          ? part.content
                          : typeof part.content === 'object' && part.content !== null
                          ? JSON.stringify(part.content)
                          : String(part.content ?? '');
                      return (
                        <div key={pIdx} className="whitespace-pre-wrap select-text font-normal">
                          {textContent}
                        </div>
                      );
                    }
                    if (part.type === 'ToolCall') {
                      const toolName =
                        typeof part.content === 'object' && part.content !== null && 'name' in part.content
                          ? String((part.content as Record<string, unknown>).name)
                          : part.name || 'Công cụ';
                      return (
                        <div
                          key={pIdx}
                          className="my-1.5 p-2 bg-zinc-950/80 border border-zinc-800 rounded-md font-mono text-[11px] text-zinc-400 flex items-center gap-2"
                        >
                          <Wrench className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span>Gọi công cụ: <strong className="text-zinc-200">{toolName}</strong></span>
                        </div>
                      );
                    }
                    if (part.type === 'ToolResult') {
                      const resStr =
                        typeof part.content === 'object' && part.content !== null && 'result' in part.content
                          ? JSON.stringify((part.content as Record<string, unknown>).result)
                          : String(part.result ?? '');
                      return (
                        <div
                          key={pIdx}
                          className="my-1.5 p-2 bg-zinc-950/80 border border-zinc-800 rounded-md font-mono text-[11px] text-zinc-400 flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">Kết quả công cụ: {resStr}</span>
                        </div>
                      );
                    }
                    return null;
                  })}

                  <div
                    className={`text-[10px] mt-1.5 select-none ${
                      msg.role === 'user' ? 'text-indigo-200/70 text-right' : 'text-zinc-400'
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Streaming Message Indicator */}
            {isStreaming && (
              <div className="flex gap-3.5 max-w-3xl">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/30 select-none">
                  <Bot className="w-3.5 h-3.5" />
                </div>

                <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl rounded-tl-xs px-4 py-3 text-xs leading-relaxed text-zinc-200 shadow-xs flex-1">
                  {/* Tool execution logs */}
                  {activeTools.length > 0 && (
                    <div className="space-y-1.5 mb-2.5">
                      {activeTools.map((tool) => (
                        <div
                          key={tool.id}
                          className="p-2 bg-zinc-950/70 border border-zinc-800/80 rounded-lg text-[11px] font-mono flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            {tool.status === 'running' && (
                              <Loader2 className="w-3 h-3 animate-spin text-indigo-400 shrink-0" />
                            )}
                            {tool.status === 'completed' && (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            )}
                            {tool.status === 'failed' && (
                              <XCircle className="w-3 h-3 text-red-400 shrink-0" />
                            )}
                            <span className="text-zinc-300 font-medium">{tool.name}</span>
                          </div>
                          <span className="text-zinc-400 truncate max-w-xs text-[10px]">
                            {tool.summary || tool.preview}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Streaming Text with blinking cursor */}
                  <div className="whitespace-pre-wrap select-text">
                    {streamingText}
                    <span className="inline-block w-1.5 h-3.5 bg-indigo-400 ml-0.5 align-middle animate-pulse" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="mx-5 mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-between text-xs text-red-300">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={onOpenSettings}
            className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 rounded-md font-medium text-[11px] transition-colors"
          >
            Cấu hình API Key
          </button>
        </div>
      )}

      {/* Composer Input Area */}
      <footer className="p-4 border-t border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xs shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-zinc-950 border border-zinc-800 focus-within:border-indigo-500/80 rounded-xl transition-all shadow-xs flex items-end p-2 gap-2">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder={`Nhắn tin với ${agent?.name || 'Hubbub'}... (Enter để gửi, Shift+Enter xuống dòng)`}
              className="flex-1 bg-transparent border-0 resize-none px-2 py-1 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden min-h-[36px] max-h-[180px]"
            />

            {isStreaming ? (
              <button
                onClick={onCancelRun}
                title="Dừng sinh phản hồi"
                className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition-all flex items-center justify-center shrink-0 active:scale-95 shadow-sm"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                title="Gửi tin nhắn (Enter)"
                className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-lg text-xs font-medium transition-all flex items-center justify-center shrink-0 active:scale-95 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
