import type { Conversation, Agent } from '../types';
import {
  MessageSquare,
  Plus,
  Settings,
  Bot,
  Activity,
  Search,
  BookOpen,
  GraduationCap,
} from 'lucide-react';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  agents: Agent[];
  selectedAgentId: string;
  onSelectAgent: (id: string) => void;
  onOpenSettings: () => void;
  showBenchmark: boolean;
  onToggleBenchmark: () => void;
  appVersion: string;
}

export const Sidebar = ({
  conversations,
  activeId,
  onSelectConversation,
  onNewConversation,
  agents,
  selectedAgentId,
  onSelectAgent,
  onOpenSettings,
  showBenchmark,
  onToggleBenchmark,
  appVersion,
}: SidebarProps) => {
  const getAgentIcon = (id: string) => {
    switch (id) {
      case 'researcher':
        return <Search className="w-3.5 h-3.5 text-indigo-400" />;
      case 'librarian':
        return <BookOpen className="w-3.5 h-3.5 text-emerald-400" />;
      case 'tutor':
        return <GraduationCap className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Bot className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <aside className="w-68 bg-zinc-900 border-r border-zinc-800/80 flex flex-col justify-between shrink-0 select-none">
      {/* Top Header & New Chat */}
      <div className="flex flex-col min-h-0">
        {/* Branding */}
        <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">
              H
            </div>
            <div>
              <h1 className="font-semibold text-sm tracking-tight text-zinc-100">Hubbub</h1>
              <p className="text-[11px] text-zinc-400">Multi-Agent Chat</p>
            </div>
          </div>
          <span className="text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700/50 px-2 py-0.5 rounded-full font-mono">
            v{appVersion}
          </span>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={onNewConversation}
            className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white rounded-lg text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Cuộc trò chuyện mới
          </button>
        </div>

        {/* Agent Selector Section */}
        <div className="px-3 pb-2">
          <div className="text-[11px] font-medium text-zinc-400 px-1 mb-1.5 flex items-center justify-between">
            <span>Tác tử (Agent)</span>
            <span className="text-[10px] text-zinc-400">{agents.length} sẵn dùng</span>
          </div>
          <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-950/60 rounded-lg border border-zinc-800/60">
            {agents.map((agent) => {
              const active = agent.id === selectedAgentId;
              return (
                <button
                  key={agent.id}
                  onClick={() => onSelectAgent(agent.id)}
                  title={`${agent.name} (${agent.model})`}
                  className={`py-1.5 px-2 rounded-md text-[11px] font-medium flex flex-col items-center gap-1 transition-all ${
                    active
                      ? 'bg-zinc-800 text-zinc-100 shadow-xs border border-zinc-700/60'
                      : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-900/60'
                  }`}
                >
                  {getAgentIcon(agent.id)}
                  <span className="truncate w-full text-center">{agent.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversation List */}
        <div className="px-3 pt-2 pb-1 border-t border-zinc-800/60 flex items-center justify-between">
          <span className="text-[11px] font-medium text-zinc-400 px-1">Lịch sử trò chuyện</span>
          <span className="text-[10px] text-zinc-400 font-mono">{conversations.length}</span>
        </div>

        <div className="overflow-y-auto px-2 space-y-0.5 flex-1 min-h-[140px] max-h-[calc(100vh-320px)]">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-zinc-400">Chưa có cuộc trò chuyện nào</div>
          ) : (
            conversations.map((conv) => {
              const active = conv.id === activeId;
              return (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`w-full text-left p-2 rounded-lg text-xs flex items-center gap-2.5 transition-colors group ${
                    active
                      ? 'bg-indigo-600/15 border border-indigo-500/30 text-indigo-200'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <MessageSquare
                    className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-indigo-400' : 'text-zinc-400'}`}
                  />
                  <div className="truncate flex-1">
                    <div className="truncate font-medium">{conv.title}</div>
                    <div className="text-[10px] text-zinc-400 truncate flex items-center gap-1.5 mt-0.5">
                      <span>{conv.agent_id}</span>
                      <span>•</span>
                      <span>{new Date(conv.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-zinc-800/80 space-y-1 bg-zinc-900/60">
        <button
          onClick={onOpenSettings}
          className="w-full py-2 px-3 text-left text-xs text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg flex items-center gap-2.5 transition-colors"
        >
          <Settings className="w-4 h-4 text-zinc-400" />
          <span>Cấu hình API Keys & Providers</span>
        </button>

        <button
          onClick={onToggleBenchmark}
          className={`w-full py-2 px-3 text-left text-xs rounded-lg flex items-center gap-2.5 transition-colors ${
            showBenchmark
              ? 'bg-zinc-800 text-indigo-300 font-medium'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Activity className="w-4 h-4 text-indigo-400" />
          <span>Gate 0 Benchmark Spike</span>
        </button>
      </div>
    </aside>
  );
};
