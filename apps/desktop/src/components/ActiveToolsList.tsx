import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import type { ToolLog } from '../types';

interface ActiveToolsListProps {
  tools: ToolLog[];
}

export const ActiveToolsList = ({ tools }: ActiveToolsListProps) => {
  if (tools.length === 0) return null;

  return (
    <div className="space-y-1.5 mb-2.5 max-w-md">
      {tools.map((tool) => (
        <div
          key={tool.id}
          className="p-2 bg-zinc-900/60 border border-zinc-800/80 rounded-lg text-[11px] font-mono flex items-center justify-between"
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
  );
};
