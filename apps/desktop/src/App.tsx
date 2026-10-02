import React, { useState, useEffect, useRef, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  FileText,
  Zap,
  Type,
  Activity,
  CheckCircle2,
  XCircle,
  Play,
  Copy,
  Check,
  Cpu,
  Layers
} from 'lucide-react';
import { MilkdownEditor } from './components/MilkdownEditor';

// --- Types ---
type Tab = 'overview' | 'vietnamese' | 'benchmark' | 'streaming' | 'milkdown' | 'scorecard';

interface BenchmarkMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  hasTable?: boolean;
  hasCode?: boolean;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [appVersion, setAppVersion] = useState<string>('Loading...');
  const [healthStatus, setHealthStatus] = useState<string>('Checking...');
  const [ipcLatency, setIpcLatency] = useState<number | null>(null);

  // --- Scorecard State ---
  const [checklist, setChecklist] = useState({
    vietnamese: null as boolean | null,
    scroll1k: null as boolean | null,
    ramTarget: null as boolean | null,
    streamSmooth: null as boolean | null,
    milkdownWorks: null as boolean | null,
  });

  // --- Check Tauri Health on mount ---
  useEffect(() => {
    async function checkTauri() {
      const t0 = performance.now();
      try {
        const version = await invoke<string>('get_version');
        const health = await invoke<string>('health_check');
        const dt = Math.round(performance.now() - t0);
        setAppVersion(version);
        setHealthStatus(health);
        setIpcLatency(dt);
      } catch (err) {
        console.warn('Tauri IPC call failed (running in browser mode?):', err);
        setAppVersion('0.1.0 (Web preview)');
        setHealthStatus('Running outside Tauri Webview');
        setIpcLatency(0);
      }
    }
    checkTauri();
  }, []);

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 font-sans select-none overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900/80 border-r border-zinc-800/80 flex flex-col justify-between shrink-0">
        <div>
          {/* App Branding */}
          <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">
                H
              </div>
              <div>
                <h1 className="font-semibold text-sm tracking-tight text-zinc-100">Hubbub</h1>
                <p className="text-[11px] text-zinc-400 font-mono">Gate 0 Spike</p>
              </div>
            </div>
            <span className="text-[10px] bg-indigo-950/80 text-indigo-400 border border-indigo-800/50 px-2 py-0.5 rounded-full font-mono">
              v{appVersion}
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="p-3 space-y-1">
            <NavItem
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              icon={<Activity className="w-4 h-4" />}
              label="Tổng quan & Hệ thống"
            />
            <NavItem
              active={activeTab === 'vietnamese'}
              onClick={() => setActiveTab('vietnamese')}
              icon={<Type className="w-4 h-4 text-emerald-400" />}
              label="1. Gõ Tiếng Việt"
              badge={checklist.vietnamese === true ? 'PASS' : checklist.vietnamese === false ? 'FAIL' : undefined}
              badgeColor={checklist.vietnamese ? 'emerald' : 'rose'}
            />
            <NavItem
              active={activeTab === 'benchmark'}
              onClick={() => setActiveTab('benchmark')}
              icon={<Layers className="w-4 h-4 text-sky-400" />}
              label="2. Benchmark 1.000 tin"
              badge={checklist.scroll1k === true ? 'PASS' : checklist.scroll1k === false ? 'FAIL' : undefined}
              badgeColor={checklist.scroll1k ? 'emerald' : 'rose'}
            />
            <NavItem
              active={activeTab === 'streaming'}
              onClick={() => setActiveTab('streaming')}
              icon={<Zap className="w-4 h-4 text-amber-400" />}
              label="3. Mô phỏng Stream 50t/s"
              badge={checklist.streamSmooth === true ? 'PASS' : checklist.streamSmooth === false ? 'FAIL' : undefined}
              badgeColor={checklist.streamSmooth ? 'emerald' : 'rose'}
            />
            <NavItem
              active={activeTab === 'milkdown'}
              onClick={() => setActiveTab('milkdown')}
              icon={<FileText className="w-4 h-4 text-purple-400" />}
              label="4. Milkdown Editor"
              badge={checklist.milkdownWorks === true ? 'PASS' : checklist.milkdownWorks === false ? 'FAIL' : undefined}
              badgeColor={checklist.milkdownWorks ? 'emerald' : 'rose'}
            />
            <NavItem
              active={activeTab === 'scorecard'}
              onClick={() => setActiveTab('scorecard')}
              icon={<CheckCircle2 className="w-4 h-4 text-teal-400" />}
              label="5. Kết quả & Đánh giá"
            />
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-zinc-800/80 text-[11px] text-zinc-400 space-y-1.5">
          <div className="flex items-center justify-between">
            <span>Tauri Core:</span>
            <span className="text-zinc-300 font-mono truncate max-w-[110px]">{healthStatus}</span>
          </div>
          {ipcLatency !== null && (
            <div className="flex items-center justify-between">
              <span>IPC Latency:</span>
              <span className="text-emerald-400 font-mono">{ipcLatency}ms</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-zinc-950 overflow-hidden">
        {activeTab === 'overview' && (
          <OverviewTab
            onSelectTab={setActiveTab}
            appVersion={appVersion}
            healthStatus={healthStatus}
            ipcLatency={ipcLatency}
            checklist={checklist}
          />
        )}
        {activeTab === 'vietnamese' && (
          <VietnameseTab
            status={checklist.vietnamese}
            onSetStatus={(val) => setChecklist((prev) => ({ ...prev, vietnamese: val }))}
          />
        )}
        {activeTab === 'benchmark' && (
          <BenchmarkTab
            status={checklist.scroll1k}
            onSetStatus={(val) => setChecklist((prev) => ({ ...prev, scroll1k: val }))}
          />
        )}
        {activeTab === 'streaming' && (
          <StreamingTab
            status={checklist.streamSmooth}
            onSetStatus={(val) => setChecklist((prev) => ({ ...prev, streamSmooth: val }))}
          />
        )}
        {activeTab === 'milkdown' && (
          <MilkdownTab
            status={checklist.milkdownWorks}
            onSetStatus={(val) => setChecklist((prev) => ({ ...prev, milkdownWorks: val }))}
          />
        )}
        {activeTab === 'scorecard' && (
          <ScorecardTab
            checklist={checklist}
            onUpdateChecklist={setChecklist}
          />
        )}
      </main>
    </div>
  );
}

// ==========================================
// Tab 0: Overview & System Health
// ==========================================
function OverviewTab({
  onSelectTab,
  appVersion,
  healthStatus,
  ipcLatency,
  checklist,
}: {
  onSelectTab: (tab: Tab) => void;
  appVersion: string;
  healthStatus: string;
  ipcLatency: number | null;
  checklist: any;
}) {
  return (
    <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Kế hoạch Gate 0 Spike — Hubbub</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Xác thực hiệu năng, RAM và trải nghiệm gõ tiếng Việt trên nền Tauri 2 + WebView2 Windows trước khi phát triển toàn diện.
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="text-xs text-zinc-400 flex items-center gap-1.5 mb-1">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tauri Runtime</span>
          </div>
          <div className="text-lg font-semibold text-zinc-100 font-mono">v{appVersion}</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{healthStatus}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="text-xs text-zinc-400 flex items-center gap-1.5 mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>IPC Latency</span>
          </div>
          <div className="text-lg font-semibold text-zinc-100 font-mono">
            {ipcLatency !== null ? `${ipcLatency} ms` : '—'}
          </div>
          <div className="text-xs text-zinc-400 mt-1">Giao tiếp UI ↔ Rust Core</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="text-xs text-zinc-400 flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Tiến độ Gate 0</span>
          </div>
          <div className="text-lg font-semibold text-zinc-100 font-mono">
            {Object.values(checklist).filter((v) => v === true).length} / 5 Đạt
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            {Object.values(checklist).every((v) => v === true)
              ? '✅ Sẵn sàng chốt Tauri 2'
              : 'Đang thực hiện kiểm thử'}
          </div>
        </div>
      </div>

      {/* 5 Tiêu chí Gate 0 */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-sm text-zinc-200">5 Tiêu Chí Nghiệm Thu Gate 0 (Pass / Fail)</h3>
        <div className="space-y-2.5 text-xs">
          <Gate0Item
            number="1"
            title="Gõ tiếng Việt (UniKey / EVKey / Telex)"
            desc="Không mất ký tự, không lặp dấu, sửa giữa chuỗi và undo mượt mà."
            tab="vietnamese"
            onSelect={onSelectTab}
            status={checklist.vietnamese}
          />
          <Gate0Item
            number="2"
            title="1.000 Tin nhắn Markdown ảo hoá"
            desc="Cuộn mượt mà 60fps, chọn/copy text chuẩn xác, không giật lag."
            tab="benchmark"
            onSelect={onSelectTab}
            status={checklist.scroll1k}
          />
          <Gate0Item
            number="3"
            title="Mức tiêu thụ RAM (Private Working Set)"
            desc="Giữ mức RAM ≤ 180MB khi nạp 1.000 tin nhắn (đo qua Task Manager)."
            tab="scorecard"
            onSelect={onSelectTab}
            status={checklist.ramTarget}
          />
          <Gate0Item
            number="4"
            title="Mô phỏng Stream Token 50 token/giây"
            desc="Cập nhật DOM từng từ không giật frame, tự động bám cuộn trang."
            tab="streaming"
            onSelect={onSelectTab}
            status={checklist.streamSmooth}
          />
          <Gate0Item
            number="5"
            title="Soạn thảo Milkdown WYSIWYG Editor"
            desc="Nạp GFM Markdown, bảng biểu, gõ tiếng Việt trực tiếp trong ProseMirror."
            tab="milkdown"
            onSelect={onSelectTab}
            status={checklist.milkdownWorks}
          />
        </div>
      </div>

      {/* Hướng dẫn đo RAM */}
      <div className="bg-indigo-950/20 border border-indigo-800/40 rounded-xl p-4 text-xs text-indigo-300 space-y-2">
        <div className="font-semibold text-indigo-200 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-indigo-400" />
          <span>Cách kiểm tra RAM thực tế của ứng dụng trên Windows:</span>
        </div>
        <p className="text-zinc-400 leading-relaxed">
          Mở PowerShell và chạy lệnh sau để xem toàn bộ nhánh tiến trình của Hubbub (gồm tiến trình chủ Tauri + tiến trình WebView2):
        </p>
        <div className="p-2.5 bg-black/60 rounded-md font-mono text-[11px] text-emerald-400 select-all border border-zinc-800">
          Get-Process -Name "*hubbub*", "*msedgewebview2*" | Select-Object ProcessName, Id, @&#123;Name="RAM (MB)"; Expression=&#123;[math]::Round($_.WorkingSet64/1MB, 2)&#125;&#125;
        </div>
      </div>
    </div>
  );
}

function Gate0Item({
  number,
  title,
  desc,
  tab,
  onSelect,
  status,
}: {
  number: string;
  title: string;
  desc: string;
  tab: Tab;
  onSelect: (t: Tab) => void;
  status: boolean | null;
}) {
  return (
    <div
      onClick={() => onSelect(tab)}
      className="p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg flex items-center justify-between cursor-pointer transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-md bg-zinc-800 text-zinc-300 font-mono flex items-center justify-center font-bold text-xs">
          {number}
        </div>
        <div>
          <div className="font-medium text-zinc-200 group-hover:text-indigo-400 transition-colors">
            {title}
          </div>
          <div className="text-zinc-500 text-[11px]">{desc}</div>
        </div>
      </div>
      <div>
        {status === true && (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
            ĐẠT (PASS)
          </span>
        )}
        {status === false && (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950 text-rose-400 border border-rose-800/60">
            CHƯA ĐẠT (FAIL)
          </span>
        )}
        {status === null && (
          <span className="text-[11px] text-zinc-500 group-hover:text-zinc-300">Thử nghiệm &rarr;</span>
        )}
      </div>
    </div>
  );
}

// ==========================================
// Tab 1: Vietnamese Typing Test
// ==========================================
function VietnameseTab({
  status,
  onSetStatus,
}: {
  status: boolean | null;
  onSetStatus: (val: boolean) => void;
}) {
  const [singleInput, setSingleInput] = useState('');
  const [multiInput, setMultiInput] = useState(
    'Cộng hòa Xã hội Chủ nghĩa Việt Nam\nĐộc lập - Tự do - Hạnh phúc\n\nKiểm tra gõ dấu:\n- Hoàng Sa và Trường Sa là của Việt Nam.\n- Ứng dụng hỗ trợ học tập và nghiên cứu cá nhân.\n- Trí tuệ nhân tạo thế hệ mới.'
  );
  const [keyLog, setKeyLog] = useState<string[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    setKeyLog((prev) => [
      `Key: "${e.key}" (code: ${e.code})`,
      ...prev.slice(0, 15),
    ]);
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <Type className="w-6 h-6 text-emerald-400" />
            Kiểm tra gõ Tiếng Việt trên Windows (UniKey / EVKey / Telex)
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Gõ nhanh, sửa dấu giữa từ, xóa backspace, và thử nghiệm phím tắt để đảm bảo không bị lỗi nuốt ký tự hoặc nhân đôi dấu.
          </p>
        </div>

        {/* Action status buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSetStatus(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              status === true
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Đánh dấu ĐẠT
          </button>
          <button
            onClick={() => onSetStatus(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              status === false
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Đánh dấu CHƯA ĐẠT
          </button>
        </div>
      </div>

      {/* Test checklist guide */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-xs space-y-2 text-zinc-300">
        <div className="font-semibold text-zinc-200">Các bài kiểm tra cần thực hiện:</div>
        <ul className="list-disc list-inside space-y-1 text-zinc-400">
          <li>1. Gõ nhanh câu dài: <code className="text-emerald-400 bg-zinc-950 px-1 py-0.5 rounded">Trường Sa, Hoàng Sa là máu thịt của Tổ quốc Việt Nam.</code></li>
          <li>2. Đặt con trỏ chuột vào giữa từ <code className="text-zinc-300">"Hoàng"</code> rồi xóa dấu hoặc sửa thành <code className="text-zinc-300">"Hồng"</code>.</li>
          <li>3. Thử gõ các từ ghép dấu phức tạp: <code className="text-zinc-300">quản lí, huỳnh huỵch, ngoằn ngoèo, khuỷu tay</code>.</li>
          <li>4. Nhấn Ctrl+Z để Undo xem dấu có bị vỡ thành ký tự thô (ví dụ: a s thay vì á) không.</li>
        </ul>
      </div>

      {/* Input boxes */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Ô nhập một dòng (Single-line Input):
          </label>
          <input
            type="text"
            value={singleInput}
            onChange={(e) => setSingleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Gõ thử tiếng Việt vào đây..."
            className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Vùng soạn thảo nhiều dòng (Multi-line Textarea):
          </label>
          <textarea
            rows={6}
            value={multiInput}
            onChange={(e) => setMultiInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700/80 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono leading-relaxed"
          />
        </div>
      </div>

      {/* Keystroke Diagnostics */}
      <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl">
        <div className="text-xs font-semibold text-zinc-400 mb-2">Nhật ký sự kiện bàn phím thời gian thực:</div>
        <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
          {keyLog.length === 0 ? (
            <span className="text-zinc-600">Chưa có phím bấm nào...</span>
          ) : (
            keyLog.map((k, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
                {k}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Tab 2: 1,000 Messages Benchmark (Virtualization)
// ==========================================
function BenchmarkTab({
  status,
  onSetStatus,
}: {
  status: boolean | null;
  onSetStatus: (val: boolean) => void;
}) {
  const [messages, setMessages] = useState<BenchmarkMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

  // Generate 1,000 messages
  const generate1kMessages = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const msgs: BenchmarkMessage[] = [];
      const roles: ('user' | 'assistant')[] = ['user', 'assistant'];
      for (let i = 1; i <= 1000; i++) {
        const isAssistant = i % 2 === 0;
        let content = `Tin nhắn #${i}: Đây là nội dung phản hồi kiểm thử tải giao diện của hệ thống Hubbub. `;
        if (isAssistant && i % 5 === 0) {
          content += `\n\n| Chỉ số | Mục tiêu | Kết quả |\n| --- | --- | --- |\n| Bộ nhớ RAM | <= 180MB | Đạt tiêu chuẩn |\n| Độ trễ phản hồi | < 50ms | Cực nhanh |\n\nTrích dẫn tài liệu: \`docs/MASTER_PLAN.md\``;
        } else if (isAssistant && i % 3 === 0) {
          content += `\n\n\`\`\`rust\n// Code snippet mẫu kiểm tra render\nfn benchmark_step_${i}() -> bool {\n    true\n}\n\`\`\``;
        } else {
          content += `Tài liệu nghiên cứu khoa học cần trích dẫn nguồn đầy đủ, không để hallucination làm sai lệch dữ kiện.`;
        }
        msgs.push({
          id: i,
          role: roles[i % 2],
          content,
          timestamp: new Date(Date.now() - (1000 - i) * 60000).toLocaleTimeString(),
          hasTable: isAssistant && i % 5 === 0,
          hasCode: isAssistant && i % 3 === 0,
        });
      }
      setMessages(msgs);
      setIsGenerating(false);
    }, 50);
  };

  useEffect(() => {
    generate1kMessages();
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 95,
    overscan: 5,
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 space-y-4">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <Layers className="w-6 h-6 text-sky-400" />
            Benchmark 1.000 Tin Nhắn (Virtualization)
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Kiểm tra độ mượt cuộn trang khi có 1.000 tin nhắn chứa text, code snippet và bảng GFM.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => parentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300"
          >
            Lên đầu
          </button>
          <button
            onClick={() =>
              parentRef.current?.scrollTo({
                top: parentRef.current.scrollHeight,
                behavior: 'smooth',
              })
            }
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300"
          >
            Xuống cuối
          </button>
          <button
            onClick={() => onSetStatus(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              status === true
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Đánh dấu ĐẠT
          </button>
          <button
            onClick={() => onSetStatus(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              status === false
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Đánh dấu CHƯA ĐẠT
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-4 gap-3 text-xs shrink-0">
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="text-zinc-500">Tổng số tin nhắn</div>
          <div className="text-base font-semibold text-zinc-100 font-mono">{messages.length} tin</div>
        </div>
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="text-zinc-500">Node DOM đang render thực tế</div>
          <div className="text-base font-semibold text-emerald-400 font-mono">
            ~{rowVirtualizer.getVirtualItems().length} nodes (Virtual)
          </div>
        </div>
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="text-zinc-500">Kích thước mảng dữ liệu</div>
          <div className="text-base font-semibold text-zinc-100 font-mono">~350 KB RAM</div>
        </div>
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="text-zinc-500">Khả năng bôi đen & Copy</div>
          <div className="text-base font-semibold text-sky-400 font-mono">Đã kích hoạt</div>
        </div>
      </div>

      {/* Virtualized Message List */}
      <div
        ref={parentRef}
        className="flex-1 bg-zinc-900/70 border border-zinc-800 rounded-xl overflow-y-auto p-4 select-text"
      >
        {isGenerating ? (
          <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
            Đang tạo 1.000 tin nhắn mẫu...
          </div>
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const msg = messages[virtualRow.index];
              const isAssistant = msg.role === 'assistant';

              return (
                <div
                  key={msg.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="pb-3"
                >
                  <div
                    className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                      isAssistant
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-200'
                        : 'bg-indigo-950/40 border-indigo-900/50 text-indigo-100 ml-12'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1.5 font-mono">
                      <span className="font-semibold text-zinc-400">
                        {isAssistant ? '🤖 Assistant' : '👤 User'} — #{msg.id}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// Tab 3: Token Streaming Simulator (50 t/s)
// ==========================================
function StreamingTab({
  status,
  onSetStatus,
}: {
  status: boolean | null;
  onSetStatus: (val: boolean) => void;
}) {
  const [streamSpeed, setStreamSpeed] = useState<number>(50); // tokens per second
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [tokenCount, setTokenCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Full sample research report text to stream
  const sampleReport = useMemo(
    () => `## Báo Cáo Nghiên Cứu: Tối Ưu Hóa Trí Tuệ Nhân Tạo Trên Desktop

### 1. Tổng quan vấn đề
Việc phát triển ứng dụng **AI cá nhân** đòi hỏi sự cân bằng khắt khe giữa:
- **Tốc độ phản hồi** (First token latency < 1 giây)
- **Mức tiêu thụ tài nguyên** (RAM idle < 180MB)
- **Tính bảo mật tuyệt đối** (Không rò rỉ dữ liệu qua mạng khi chưa có sự cho phép của người dùng).

### 2. Phân tích kiến trúc Modular Monolith
Hệ thống sử dụng **Rust Core** làm trung tâm điều phối mọi tác vụ:
1. *Tool Gateway*: Chỉ cho phép gọi các công cụ đã được cấp phép tĩnh.
2. *Policy Engine*: Kiểm tra nghiêm ngặt đường dẫn file (\`PathGuard\`) và địa chỉ mạng (\`UrlGuard\`).
3. *Workspace Markdown*: Tất cả ghi chép được lưu trữ dưới dạng Markdown thuần, tương thích chuẩn với Obsidian và VS Code.

### 3. Bảng so sánh hiệu năng
| Nền tảng | RAM Khởi động | RAM Tải 1.000 tin | Khả năng mở rộng Mobile |
| :--- | :--- | :--- | :--- |
| **Tauri 2 + React** | ~45 MB | ~110 MB | Sẵn sàng kiến trúc |
| Electron | ~280 MB | ~520 MB | Rất khó khăn |
| Python Sidecar | ~190 MB | ~380 MB | Cồng kềnh |

### 4. Kết luận
Lựa chọn **Tauri 2 + Rust Core** mang lại sự kết hợp hoàn hảo giữa giao diện linh hoạt của hệ sinh thái Web và tính an toàn, hiệu năng vượt trội của Rust.`,
    []
  );

  const startStream = () => {
    setIsStreaming(true);
    setStreamedText('');
    setTokenCount(0);

    const words = sampleReport.split(' ');
    let currentIndex = 0;
    const intervalMs = Math.round(1000 / streamSpeed);

    const timer = setInterval(() => {
      if (currentIndex < words.length) {
        setStreamedText((prev) => (prev ? prev + ' ' + words[currentIndex] : words[currentIndex]));
        currentIndex++;
        setTokenCount(currentIndex);

        // Auto-scroll
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      } else {
        clearInterval(timer);
        setIsStreaming(false);
      }
    }, intervalMs);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 space-y-4">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400" />
            Mô phỏng Stream Token (50 tokens / giây)
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Kiểm tra giao diện khi LLM phát token liên tục, xác nhận không bị giật lag khung hình (jank).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSetStatus(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              status === true
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Đánh dấu ĐẠT
          </button>
          <button
            onClick={() => onSetStatus(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              status === false
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Đánh dấu CHƯA ĐẠT
          </button>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex items-center justify-between p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Tốc độ stream:</span>
            {[20, 50, 100].map((speed) => (
              <button
                key={speed}
                disabled={isStreaming}
                onClick={() => setStreamSpeed(speed)}
                className={`px-2.5 py-1 rounded font-mono ${
                  streamSpeed === speed
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {speed} t/s
              </button>
            ))}
          </div>

          <div className="text-zinc-500">|</div>

          <div className="flex items-center gap-2 font-mono">
            <span className="text-zinc-400">Số token đã nhận:</span>
            <span className="text-amber-400 font-bold">{tokenCount}</span>
          </div>
        </div>

        <button
          onClick={startStream}
          disabled={isStreaming}
          className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-amber-600/20"
        >
          <Play className="w-4 h-4 fill-white" />
          {isStreaming ? 'Đang stream...' : 'Bắt đầu Stream 50t/s'}
        </button>
      </div>

      {/* Stream Output Window */}
      <div
        ref={scrollRef}
        className="flex-1 bg-zinc-900/70 border border-zinc-800 rounded-xl p-6 overflow-y-auto font-sans leading-relaxed text-sm text-zinc-200"
      >
        {streamedText ? (
          <div className="whitespace-pre-wrap">
            {streamedText}
            {isStreaming && <span className="inline-block w-2 h-4 bg-amber-400 ml-1 animate-pulse" />}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-xs gap-2">
            <Zap className="w-8 h-8 text-zinc-700" />
            <span>Nhấn nút "Bắt đầu Stream 50t/s" ở trên để kiểm tra tốc độ render token.</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// Tab 4: Milkdown WYSIWYG Editor Test
// ==========================================
function MilkdownTab({
  status,
  onSetStatus,
}: {
  status: boolean | null;
  onSetStatus: (val: boolean) => void;
}) {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 space-y-4">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-400" />
            Kiểm tra Milkdown WYSIWYG Markdown Editor (ProseMirror)
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Soạn thảo trực tiếp dạng WYSIWYG, gõ tiếng Việt, render bảng GFM và code block.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSetStatus(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              status === true
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Đánh dấu ĐẠT
          </button>
          <button
            onClick={() => onSetStatus(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              status === false
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Đánh dấu CHƯA ĐẠT
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <MilkdownEditor />
      </div>
    </div>
  );
}

// ==========================================
// Tab 5: Gate 0 Scorecard & Conclusion
// ==========================================
function ScorecardTab({
  checklist,
  onUpdateChecklist,
}: {
  checklist: any;
  onUpdateChecklist: React.Dispatch<React.SetStateAction<any>>;
}) {
  const [copied, setCopied] = useState(false);

  const passedCount = Object.values(checklist).filter((v) => v === true).length;
  const isAllPassed = Object.values(checklist).every((v) => v === true);

  const reportMarkdown = useMemo(() => {
    return `# GATE 0 VALIDATION REPORT — HUBBUB
Ngày kiểm thử: ${new Date().toLocaleDateString('vi-VN')}
Kết luận: ${isAllPassed ? 'CHẤP THUẬN TAURI 2 + REACT' : 'ĐANG THEO DÕI / CHƯA ĐẠT'}

| STT | Tiêu chí Gate 0 | Trạng thái | Ghi chú |
| --- | :--- | :---: | :--- |
| 1 | Gõ tiếng Việt (UniKey / EVKey) | ${checklist.vietnamese ? '✅ ĐẠT' : '❌ CHƯA'} | Gõ mượt, sửa dấu không lỗi |
| 2 | Benchmark 1.000 tin nhắn | ${checklist.scroll1k ? '✅ ĐẠT' : '❌ CHƯA'} | Virtualized list mượt mà |
| 3 | Mức tiêu thụ RAM <= 180MB | ${checklist.ramTarget ? '✅ ĐẠT' : '❌ CHƯA'} | Đo qua PowerShell / Task Manager |
| 4 | Stream token 50 t/s | ${checklist.streamSmooth ? '✅ ĐẠT' : '❌ CHƯA'} | Không jank, auto-scroll tốt |
| 5 | Milkdown WYSIWYG Editor | ${checklist.milkdownWorks ? '✅ ĐẠT' : '❌ CHƯA'} | GFM Tables + Code block hoạt động |

${
  isAllPassed
    ? '==> QUYẾT ĐỊNH: Tiếp tục triển khai Phase 1 với stack Tauri 2 + React + Rust Core.'
    : '==> Cần kiểm tra kỹ các tiêu chí chưa đạt trước khi chuyển sang Phase 1.'
}
`;
  }, [checklist, isAllPassed]);

  const copyReport = () => {
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-teal-400" />
            Bảng Tổng Kết & Báo Cáo Nghiệm Thu Gate 0
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Tổng hợp kết quả kiểm thử thực tế trên máy tính người dùng.
          </p>
        </div>

        <button
          onClick={copyReport}
          className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition-colors border border-zinc-700"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Đã sao chép Markdown' : 'Sao chép Báo cáo'}
        </button>
      </div>

      {/* Summary Card */}
      <div
        className={`p-6 rounded-2xl border ${
          isAllPassed
            ? 'bg-emerald-950/20 border-emerald-800/50'
            : 'bg-zinc-900 border-zinc-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-1">
              Kết luận Gate 0
            </div>
            <div className="text-xl font-bold text-zinc-100">
              {isAllPassed
                ? '🎉 ĐẠT CHUẨN: Chốt sử dụng Tauri 2 + React cho Desktop!'
                : `Đạt ${passedCount} / 5 tiêu chí`}
            </div>
          </div>

          <div className="text-3xl font-bold font-mono text-zinc-100">
            {passedCount} / 5
          </div>
        </div>
      </div>

      {/* Manual toggles for each criteria */}
      <div className="space-y-3 bg-zinc-900 p-5 rounded-xl border border-zinc-800">
        <h3 className="font-semibold text-sm text-zinc-200 mb-2">Đánh giá từng tiêu chí:</h3>

        <ScoreItem
          title="1. Gõ Tiếng Việt (UniKey / EVKey / Telex)"
          value={checklist.vietnamese}
          onChange={(val) => onUpdateChecklist((prev: any) => ({ ...prev, vietnamese: val }))}
        />
        <ScoreItem
          title="2. Cuộn mượt 1.000 tin nhắn Markdown"
          value={checklist.scroll1k}
          onChange={(val) => onUpdateChecklist((prev: any) => ({ ...prev, scroll1k: val }))}
        />
        <ScoreItem
          title="3. Tiêu thụ RAM <= 180MB (Đo qua Task Manager)"
          value={checklist.ramTarget}
          onChange={(val) => onUpdateChecklist((prev: any) => ({ ...prev, ramTarget: val }))}
        />
        <ScoreItem
          title="4. Stream Token 50 token/giây mượt mà"
          value={checklist.streamSmooth}
          onChange={(val) => onUpdateChecklist((prev: any) => ({ ...prev, streamSmooth: val }))}
        />
        <ScoreItem
          title="5. Milkdown WYSIWYG Editor hoạt động tốt"
          value={checklist.milkdownWorks}
          onChange={(val) => onUpdateChecklist((prev: any) => ({ ...prev, milkdownWorks: val }))}
        />
      </div>

      {/* Markdown Preview */}
      <div>
        <div className="text-xs font-semibold text-zinc-400 mb-2">Báo cáo dạng Markdown:</div>
        <pre className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 overflow-x-auto select-all">
          {reportMarkdown}
        </pre>
      </div>
    </div>
  );
}

function ScoreItem({
  title,
  value,
  onChange,
}: {
  title: string;
  value: boolean | null;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-2.5 bg-zinc-950/60 rounded-lg border border-zinc-800/80 text-xs">
      <span className="font-medium text-zinc-300">{title}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(true)}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
            value === true
              ? 'bg-emerald-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          ĐẠT
        </button>
        <button
          onClick={() => onChange(false)}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
            value === false
              ? 'bg-rose-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          CHƯA
        </button>
      </div>
    </div>
  );
}

// Subcomponent: NavItem
function NavItem({
  active,
  onClick,
  icon,
  label,
  badge,
  badgeColor,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  badgeColor?: 'emerald' | 'rose';
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
        active
          ? 'bg-zinc-800 text-zinc-100 shadow-sm'
          : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
      }`}
    >
      <div className="flex items-center gap-2.5 truncate">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      {badge && (
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
            badgeColor === 'emerald'
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
              : 'bg-rose-950 text-rose-400 border border-rose-800/50'
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
