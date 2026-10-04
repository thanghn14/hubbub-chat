import { useState, useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { WorkspaceReportsView } from './components/WorkspaceReportsView';
import { SettingsModal } from './components/SettingsModal';
import { AgentModal } from './components/AgentModal';
import { BenchmarkSpike } from './components/BenchmarkSpike';
import type { Conversation, Message, Agent, Run, RunEvent, ToolLog } from './types';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('analyst');
  const [messages, setMessages] = useState<Message[]>([]);

  // View Navigation
  const [viewMode, setViewMode] = useState<'chat' | 'workspace'>('chat');

  // Streaming & Execution State
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingText, setStreamingText] = useState<string>('');
  const [activeTools, setActiveTools] = useState<ToolLog[]>([]);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals & Panels
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState<boolean>(false);
  const [showBenchmark, setShowBenchmark] = useState<boolean>(false);
  const [appVersion, setAppVersion] = useState<string>('0.1.0');

  // Keep a ref to activeConversationId for async Tauri event handlers
  const activeConversationIdRef = useRef<string | null>(null);
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (convId: string) => {
    try {
      const msgs = await invoke<Message[]>('list_messages', {
        conversationId: convId,
        limit: 100,
        offset: 0,
      });
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }, []);

  // Initialize data on mount & subscribe to Tauri events
  useEffect(() => {
    let isMounted = true;
    let unlistenRunEvent: UnlistenFn | null = null;

    async function init() {
      try {
        const ver = await invoke<string>('get_version');
        if (isMounted) setAppVersion(ver);
      } catch {
        // Fallback for browser preview
      }

      // 1. Fetch available agents
      let loadedAgents: Agent[] = [];
      try {
        loadedAgents = await invoke<Agent[]>('list_agents');
        if (isMounted && loadedAgents.length > 0) {
          setAgents(loadedAgents);
          setSelectedAgentId(loadedAgents[0].id);
        }
      } catch (err) {
        console.error('Failed to list agents:', err);
      }

      // 2. Fetch conversations or seed initial conversation
      try {
        let convs = await invoke<Conversation[]>('list_conversations');
        if (convs.length === 0) {
          const defaultAgent = loadedAgents[0]?.id || 'researcher';
          const newConv = await invoke<Conversation>('create_conversation', {
            title: 'Cuộc trò chuyện mới',
            agentId: defaultAgent,
          });
          convs = [newConv];
        }

        if (isMounted) {
          setConversations(convs);
          if (convs[0]) {
            setActiveConversationId(convs[0].id);
            if (convs[0].agent_id) {
              setSelectedAgentId(convs[0].agent_id);
            }
            loadMessages(convs[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      }

      // 3. Listen for Tauri run_event streaming events
      try {
        unlistenRunEvent = await listen<RunEvent>('run_event', (event) => {
          const payload = event.payload;
          if (!payload) return;

          switch (payload.type) {
            case 'MessageDelta':
              setStreamingText((prev) => prev + payload.data.content);
              break;

            case 'ToolStarted':
              setActiveTools((prev) => [
                ...prev,
                {
                  id: `${payload.data.tool_name}-${Date.now()}`,
                  name: payload.data.tool_name,
                  preview: payload.data.args_preview,
                  status: 'running',
                },
              ]);
              break;

            case 'ToolFinished':
              setActiveTools((prev) =>
                prev.map((tool) =>
                  tool.name === payload.data.tool_name && tool.status === 'running'
                    ? {
                        ...tool,
                        status: payload.data.success ? 'completed' : 'failed',
                        summary: payload.data.summary,
                      }
                    : tool
                )
              );
              break;

            case 'RunFinished':
              if (activeConversationIdRef.current) {
                loadMessages(activeConversationIdRef.current).finally(() => {
                  setIsStreaming(false);
                  setActiveRunId(null);
                  setStreamingText('');
                  setActiveTools([]);
                });
              } else {
                setIsStreaming(false);
                setActiveRunId(null);
                setStreamingText('');
                setActiveTools([]);
              }
              break;

            case 'Error':
              setErrorMsg(payload.data.message);
              setIsStreaming(false);
              setActiveRunId(null);
              break;
          }
        });
      } catch (err) {
        console.warn('Tauri event listener registration failed (browser mode?):', err);
      }
    }

    init();

    return () => {
      isMounted = false;
      if (unlistenRunEvent) {
        unlistenRunEvent();
      }
    };
  }, [loadMessages]);

  // Handle switching conversation
  const handleSelectConversation = useCallback(
    (id: string) => {
      setViewMode('chat');
      setActiveConversationId(id);
      const conv = conversations.find((c) => c.id === id);
      if (conv?.agent_id) {
        setSelectedAgentId(conv.agent_id);
      }
      setIsStreaming(false);
      setStreamingText('');
      setActiveTools([]);
      setErrorMsg(null);
      loadMessages(id);
    },
    [conversations, loadMessages]
  );

  // Handle creating a new conversation
  const handleNewConversation = useCallback(async () => {
    try {
      const newConv = await invoke<Conversation>('create_conversation', {
        title: 'Cuộc trò chuyện mới',
        agentId: selectedAgentId,
      });
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setViewMode('chat');
      setMessages([]);
      setIsStreaming(false);
      setStreamingText('');
      setActiveTools([]);
      setErrorMsg(null);
    } catch (err) {
      console.error('Failed to create new conversation:', err);
    }
  }, [selectedAgentId]);

  // Handle sending a message
  const handleSendMessage = useCallback(
    async (prompt: string) => {
      if (!activeConversationId) return;

      setErrorMsg(null);
      setIsStreaming(true);
      setStreamingText('');
      setActiveTools([]);

      // Optimistically add user message to the UI
      const optimisticMsg: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: activeConversationId,
        role: 'user',
        parts: [{ type: 'Text', content: prompt }],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMsg]);

      try {
        const run = await invoke<Run>('send_message', {
          conversationId: activeConversationId,
          agentId: selectedAgentId,
          prompt,
        });
        setActiveRunId(run.id);
      } catch (err) {
        console.error('Failed to send message:', err);
        setIsStreaming(false);
        setActiveRunId(null);
        setErrorMsg(String(err));
      }
    },
    [activeConversationId, selectedAgentId]
  );

  // Handle cancelling a run
  const handleCancelRun = useCallback(async () => {
    if (!activeRunId) return;
    try {
      await invoke('cancel_run', { runId: activeRunId });
    } catch (err) {
      console.error('Failed to cancel run:', err);
    } finally {
      setIsStreaming(false);
      setActiveRunId(null);
    }
  }, [activeRunId]);

  // Handle changing agent model
  const handleSelectModel = useCallback(
    async (model: string) => {
      if (!selectedAgentId) return;
      try {
        await invoke('set_agent_model', { agentId: selectedAgentId, model });
        setAgents((prev) =>
          prev.map((a) => (a.id === selectedAgentId ? { ...a, model } : a))
        );
      } catch (err) {
        console.error('Failed to set agent model:', err);
        alert(`Lỗi khi đổi model cho agent: ${String(err)}`);
      }
    },
    [selectedAgentId]
  );

  // Handle saving new or updated functional agent
  const handleSaveAgent = useCallback(async (newAgent: Agent) => {
    try {
      await invoke('upsert_agent', { agent: newAgent });
      setAgents((prev) => {
        const existingIdx = prev.findIndex((a) => a.id === newAgent.id);
        if (existingIdx >= 0) {
          const next = [...prev];
          next[existingIdx] = newAgent;
          return next;
        }
        return [...prev, newAgent];
      });
      setSelectedAgentId(newAgent.id);
    } catch (err) {
      console.error('Failed to save agent:', err);
      throw err;
    }
  }, []);

  // Get active conversation and agent
  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const currentAgent = agents.find((a) => a.id === selectedAgentId) || agents[0] || null;

  // Gate 0 Benchmark view toggle
  if (showBenchmark) {
    return (
      <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 font-sans select-none overflow-hidden">
        <BenchmarkSpike onBackToChat={() => setShowBenchmark(false)} />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 font-sans select-none overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        agents={agents}
        selectedAgentId={selectedAgentId}
        onSelectAgent={(agentId: string) => setSelectedAgentId(agentId)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCreateAgent={() => setIsAgentModalOpen(true)}
        showBenchmark={showBenchmark}
        onToggleBenchmark={() => setShowBenchmark(true)}
        appVersion={appVersion}
        viewMode={viewMode}
        onSelectViewMode={setViewMode}
      />

      {/* Main View: Chat or Workspace Reports */}
      {viewMode === 'workspace' ? (
        <WorkspaceReportsView onBackToChat={() => setViewMode('chat')} />
      ) : (
        <ChatView
          conversationId={activeConversationId || ''}
          conversationTitle={activeConversation?.title || 'Cuộc trò chuyện'}
          messages={messages}
          agent={currentAgent}
          onSendMessage={handleSendMessage}
          onCancelRun={handleCancelRun}
          onSelectModel={handleSelectModel}
          isStreaming={isStreaming}
          streamingText={streamingText}
          activeTools={activeTools}
          errorMsg={errorMsg}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* Settings Modal (Write-only API Keys) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Agent Modal (Create & Configure Functional Agents) */}
      <AgentModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        onSaveAgent={handleSaveAgent}
      />
    </div>
  );
}
