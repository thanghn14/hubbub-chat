import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  FileText,
  Search,
  Plus,
  Save,
  CheckCircle2,
  XCircle,
  Shield,
  FileCode,
  Calendar,
  HardDrive,
  RefreshCw,
  Eye,
  Edit3,
} from 'lucide-react';
import { MarkdownContent } from './MarkdownContent';
import { MilkdownEditor } from './MilkdownEditor';
import type { WorkspaceDocument, AuditLog } from '../types';

interface WorkspaceReportsViewProps {
  onBackToChat: () => void;
}

export const WorkspaceReportsView = ({ onBackToChat }: WorkspaceReportsViewProps) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'audit'>('reports');

  // Reports / Documents state
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [reportsList, setReportsList] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [editedContent, setEditedContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // New report modal/state
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditFilter, setAuditFilter] = useState<'all' | 'allow' | 'deny'>('all');

  // Load documents and reports
  const loadDocuments = useCallback(async (query = '') => {
    setIsLoading(true);
    try {
      if (query.trim()) {
        const found = await invoke<WorkspaceDocument[]>('search_documents', { query: query.trim() });
        setDocuments(found);
      } else {
        const docs = await invoke<WorkspaceDocument[]>('list_documents');
        setDocuments(docs);
      }
      const rawReports = await invoke<string[]>('list_reports');
      setReportsList(rawReports);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load audit logs
  const loadAuditLogs = useCallback(async () => {
    try {
      const logs = await invoke<AuditLog[]>('list_audit_logs', { limit: 100 });
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
    loadAuditLogs();
  }, [loadDocuments, loadAuditLogs]);

  // Select a document or report
  const handleSelectFile = async (pathOrFilename: string) => {
    setSelectedFile(pathOrFilename);
    setIsEditing(false);
    try {
      const filename = pathOrFilename.replace(/^reports[\\/]/, '');
      const content = await invoke<string>('read_report', { filename });
      setFileContent(content);
      setEditedContent(content);
    } catch (err) {
      console.error('Failed to read file:', err);
      setFileContent('# Không thể đọc tệp\n\n' + String(err));
    }
  };

  // Save report
  const handleSaveReport = async () => {
    if (!selectedFile) return;
    const filename = selectedFile.replace(/^reports[\\/]/, '');
    const firstLine = editedContent.trim().split('\n')[0].replace(/^#+\s*/, '') || filename;
    try {
      await invoke('write_report', {
        title: firstLine,
        content: editedContent,
        filename,
      });
      setFileContent(editedContent);
      setIsEditing(false);
      setStatusNotice('Đã lưu thành công!');
      setTimeout(() => setStatusNotice(null), 3000);
      loadDocuments(searchQuery);
    } catch (err) {
      console.error('Failed to save report:', err);
      setStatusNotice('Lỗi khi lưu: ' + String(err));
    }
  };

  // Create new report
  const handleCreateNew = async () => {
    if (!newTitle.trim()) return;
    try {
      const path = await invoke<string>('write_report', {
        title: newTitle.trim(),
        content: `# ${newTitle.trim()}\n\nNội dung báo cáo...`,
        filename: null,
      });
      setIsCreating(false);
      setNewTitle('');
      await loadDocuments();
      handleSelectFile(path);
    } catch (err) {
      console.error('Failed to create report:', err);
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    if (auditFilter === 'all') return true;
    return log.decision.toLowerCase() === auditFilter;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 select-none overflow-hidden">
      {/* Top Header */}
      <div className="h-14 border-b border-zinc-800/80 px-6 flex items-center justify-between bg-zinc-900/40">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToChat}
            className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition-colors"
          >
            ← Quay lại Trò chuyện
          </button>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-lg border border-zinc-800">
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeTab === 'reports'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 inline mr-1.5" />
              Kho Báo cáo & Tài liệu
            </button>
            <button
              onClick={() => {
                setActiveTab('audit');
                loadAuditLogs();
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeTab === 'audit'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5 inline mr-1.5" />
              Nhật ký kiểm toán
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {statusNotice && (
            <span className="text-xs text-emerald-400 font-medium animate-fade-in flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {statusNotice}
            </span>
          )}
          <button
            onClick={() => {
              if (activeTab === 'reports') loadDocuments(searchQuery);
              else loadAuditLogs();
            }}
            title="Làm mới"
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      {activeTab === 'reports' ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Files / Documents Explorer */}
          <div className="w-80 border-r border-zinc-800/80 bg-zinc-900/30 flex flex-col shrink-0">
            {/* Search Bar */}
            <div className="p-3 border-b border-zinc-800/60 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm FTS5..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    loadDocuments(e.target.value);
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <button
                onClick={() => setIsCreating(true)}
                title="Tạo báo cáo mới"
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Create New Modal / Inline Form */}
            {isCreating && (
              <div className="p-3 border-b border-indigo-500/30 bg-indigo-950/20 space-y-2">
                <div className="text-[11px] font-medium text-indigo-300">Tên báo cáo mới:</div>
                <input
                  type="text"
                  placeholder="Ví dụ: Nghiên cứu thị trường 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateNew()}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-2.5 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-400"
                  autoFocus
                />
                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    onClick={() => setIsCreating(false)}
                    className="px-2 py-0.5 text-[11px] text-zinc-400 hover:text-zinc-200"
                  >
                    Huỷ
                  </button>
                  <button
                    onClick={handleCreateNew}
                    className="px-2.5 py-0.5 text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium"
                  >
                    Tạo
                  </button>
                </div>
              </div>
            )}

            {/* Document List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {isLoading ? (
                <div className="p-4 text-center text-xs text-zinc-400">Đang tải tài liệu...</div>
              ) : documents.length === 0 && reportsList.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-400 space-y-2">
                  <FileCode className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p>Chưa có báo cáo nào trong Workspace.</p>
                  <p className="text-[11px] text-zinc-400">
                    Agent có thể tự động viết báo cáo bằng công cụ report_write hoặc bạn có thể tạo mới tại đây.
                  </p>
                </div>
              ) : documents.length > 0 ? (
                documents.map((doc) => {
                  const active = selectedFile === doc.path;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => handleSelectFile(doc.path)}
                      className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-start gap-2.5 ${
                        active
                          ? 'bg-indigo-600/15 border border-indigo-500/30 text-indigo-200'
                          : 'text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/60'
                      }`}
                    >
                      <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${active ? 'text-indigo-400' : 'text-zinc-400'}`} />
                      <div className="truncate flex-1">
                        <div className="truncate font-medium">{doc.title || doc.path}</div>
                        <div className="text-[10px] text-zinc-400 truncate flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <HardDrive className="w-3 h-3" />
                            {(doc.size_bytes / 1024).toFixed(1)} KB
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3" />
                            {new Date(doc.updated_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                reportsList.map((filename) => {
                  const active = selectedFile === filename;
                  return (
                    <button
                      key={filename}
                      onClick={() => handleSelectFile(filename)}
                      className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-center gap-2.5 ${
                        active
                          ? 'bg-indigo-600/15 border border-indigo-500/30 text-indigo-200'
                          : 'text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/60'
                      }`}
                    >
                      <FileText className="w-4 h-4 text-zinc-400 shrink-0" />
                      <span className="truncate flex-1 font-medium">{filename}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Markdown Preview / Milkdown WYSIWYG Editor */}
          <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden">
            {selectedFile ? (
              <>
                {/* File Header Actions */}
                <div className="h-12 border-b border-zinc-800/80 px-6 flex items-center justify-between bg-zinc-900/20">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-xs font-semibold text-zinc-200 truncate">{selectedFile}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`px-3 py-1 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors ${
                        isEditing
                          ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {isEditing ? (
                        <>
                          <Eye className="w-3.5 h-3.5" /> Xem trước
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa WYSIWYG
                        </>
                      )}
                    </button>

                    {isEditing && (
                      <button
                        onClick={handleSaveReport}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Save className="w-3.5 h-3.5" /> Lưu báo cáo
                      </button>
                    )}
                  </div>
                </div>

                {/* Content Viewer / Editor */}
                <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full select-text">
                  {isEditing ? (
                    <MilkdownEditor
                      key={selectedFile}
                      initialContent={editedContent}
                      onChange={(md) => setEditedContent(md)}
                    />
                  ) : (
                    <MarkdownContent content={fileContent} />
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-400">
                <FileText className="w-12 h-12 text-zinc-700 mb-3" />
                <p className="text-sm font-medium text-zinc-300">Chọn một báo cáo để xem hoặc chỉnh sửa</p>
                <p className="text-xs text-zinc-400 mt-1 max-w-md">
                  Mọi báo cáo được lưu trong thư mục Workspace reports/ và tự động được lập chỉ mục FTS5 để tìm kiếm toàn văn siêu tốc.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Audit Logs View */
        <div className="flex-1 flex flex-col overflow-hidden p-6 max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-zinc-200">Nhật ký kiểm toán bảo mật (Audit Logs)</h2>
              <p className="text-xs text-zinc-400">
                Ghi nhận mọi lượt thực thi công cụ (Tool execution) của các Agent, gồm cả hành động được cho phép và bị từ chối.
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-lg border border-zinc-800">
              <button
                onClick={() => setAuditFilter('all')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  auditFilter === 'all' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Tất cả ({auditLogs.length})
              </button>
              <button
                onClick={() => setAuditFilter('allow')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  auditFilter === 'allow' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Cho phép
              </button>
              <button
                onClick={() => setAuditFilter('deny')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  auditFilter === 'deny' ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Từ chối
              </button>
            </div>
          </div>

          <div className="flex-1 bg-zinc-900/60 border border-zinc-800/80 rounded-xl overflow-hidden flex flex-col">
            <div className="overflow-y-auto flex-1 divide-y divide-zinc-800/60">
              {filteredLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400">Chưa có bản ghi kiểm toán nào phù hợp.</div>
              ) : (
                filteredLogs.map((log) => {
                  const isDeny = log.decision.toLowerCase() === 'deny';
                  return (
                    <div key={log.id} className="p-3.5 hover:bg-zinc-850/40 transition-colors flex items-start gap-3">
                      {isDeny ? (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-zinc-200">{log.tool_name}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                isDeny
                                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                              }`}
                            >
                              {isDeny ? 'Bị từ chối' : 'Cho phép'}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-zinc-400">
                            {new Date(log.timestamp).toLocaleString('vi-VN')}
                          </span>
                        </div>

                        <div className="font-mono text-[11px] text-zinc-400 bg-zinc-950/60 p-2 rounded border border-zinc-850 truncate">
                          <span className="text-zinc-400">args: </span>
                          {log.args_digest}
                        </div>

                        {log.result_digest && (
                          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 pl-1">
                            <span className="text-zinc-400">Kết quả:</span>
                            <span className="text-zinc-300 truncate">{log.result_digest}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
