import { useState, useMemo } from 'react';
import type { Conversation, Agent } from '../types';
import {
  MessageSquare,
  Plus,
  Search,
  Bot,
  Sparkles,
  Code2,
  PenTool,
  GraduationCap,
  BookOpen,
} from 'lucide-react';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  agents: Agent[];
  selectedAgentId: string;
  onSelectAgent: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
}

export const Sidebar = ({
  conversations,
  activeId,
  onSelectConversation,
  onNewConversation,
  agents,
  selectedAgentId,
  onSelectAgent,
}: SidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const getAgentIcon = (id: string) => {
    switch (id) {
      case 'analyst':
        return <Sparkles className="w-3.5 h-3.5 text-indigo-400" />;
      case 'developer':
        return <Code2 className="w-3.5 h-3.5 text-cyan-400" />;
      case 'researcher':
        return <Search className="w-3.5 h-3.5 text-blue-400" />;
      case 'writer':
        return <PenTool className="w-3.5 h-3.5 text-purple-400" />;
      case 'tutor':
        return <GraduationCap className="w-3.5 h-3.5 text-amber-400" />;
      case 'librarian':
        return <BookOpen className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Bot className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  // Filter conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  // Group conversations by date
  const groupedConversations = useMemo(() => {
    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const past7Days: Conversation[] = [];
    const older: Conversation[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const sevenDaysStart = todayStart - 86400000 * 7;

    for (const conv of filteredConversations) {
      const time = new Date(conv.updated_at || conv.created_at).getTime();
      if (time >= todayStart) {
        today.push(conv);
      } else if (time >= yesterdayStart) {
        yesterday.push(conv);
      } else if (time >= sevenDaysStart) {
        past7Days.push(conv);
      } else {
        older.push(conv);
      }
    }

    return [
      { label: 'Hôm nay', list: today },
      { label: 'Hôm qua', list: yesterday },
      { label: '7 ngày trước', list: past7Days },
      { label: 'Cũ hơn', list: older },
    ].filter((g) => g.list.length > 0);
  }, [filteredConversations]);

  return (
    <aside className="w-64 bg-[#0c0e16] border-r border-white/5 flex flex-col justify-between shrink-0 select-none z-20">
      {/* Top Header & Search */}
      <div className="flex flex-col min-h-0">
        {/* New Chat Button */}
        <div className="p-3 pb-2">
          <button
            onClick={onNewConversation}
            className="w-full py-2 px-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-[0.98] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cuộc trò chuyện mới</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-3 pb-2.5">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm hội thoại..."
              className="w-full bg-[#121520] border border-white/5 focus:border-indigo-500/60 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Quick Agent Switcher Chips */}
        <div className="px-3 pb-2">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5 px-0.5">
            Tác tử đang chọn
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {agents.map((agent) => {
              const active = agent.id === selectedAgentId;
              return (
                <button
                  key={agent.id}
                  onClick={() => onSelectAgent(agent.id)}
                  title={`${agent.name} (${agent.model})`}
                  className={`py-1 px-2 rounded-lg text-[11px] font-medium flex items-center gap-1.5 shrink-0 transition-all ${
                    active
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-xs'
                      : 'bg-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  {getAgentIcon(agent.id)}
                  <span className="truncate max-w-[80px]">{agent.name.replace(/^(Agent|Tác tử|Chuyên viên|Kỹ sư|Trợ lý)\s*/i, '')}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 mx-3 my-1" />

        {/* Conversation List grouped by date */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 py-2">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-zinc-500">
              Không tìm thấy cuộc trò chuyện nào
            </div>
          ) : (
            groupedConversations.map((group) => (
              <div key={group.label} className="space-y-1">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-2 py-0.5 block">
                  {group.label}
                </span>
                {group.list.map((conv) => {
                  const isActive = conv.id === activeId;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => onSelectConversation(conv.id)}
                      className={`w-full p-2 rounded-xl text-xs flex items-center justify-between group transition-all text-left ${
                        isActive
                          ? 'bg-[#181e2b] text-zinc-100 border border-indigo-500/30 shadow-xs'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <MessageSquare
                          className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-400'}`}
                        />
                        <span className="truncate font-medium">{conv.title || 'Cuộc trò chuyện'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};
