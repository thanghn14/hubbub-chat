import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content: string;
}

export const MarkdownContent = ({ content }: MarkdownContentProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-base font-bold text-zinc-100 mt-4 mb-2 pb-1 border-b border-zinc-800">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-sm font-semibold text-zinc-100 mt-3.5 mb-1.5">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xs font-semibold text-zinc-200 mt-2.5 mb-1">{children}</h3>
        ),
        p: ({ children }) => <p className="mb-2.5 leading-6 text-zinc-200 font-normal">{children}</p>,
        ul: ({ children }) => (
          <ul className="list-disc pl-5 mb-2.5 space-y-1 text-zinc-200">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 mb-2.5 space-y-1 text-zinc-200">{children}</ol>
        ),
        li: ({ children }) => <li className="leading-5">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-indigo-500/80 pl-3 py-1 italic text-zinc-400 my-2 bg-zinc-900/30 rounded-r">
            {children}
          </blockquote>
        ),
        code: ({ className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match && !String(children).includes('\n');
          return isInline ? (
            <code
              className="bg-zinc-800/90 text-amber-300 px-1.5 py-0.5 rounded text-[12px] font-mono border border-zinc-700/60"
              {...props}
            >
              {children}
            </code>
          ) : (
            <div className="my-2.5 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 shadow-xs">
              {match && (
                <div className="bg-zinc-800/80 px-3 py-1 text-[11px] font-mono text-zinc-400 border-b border-zinc-800 flex justify-between items-center select-none">
                  <span>{match[1]}</span>
                </div>
              )}
              <pre className="p-3 text-xs font-mono overflow-x-auto text-emerald-300 leading-relaxed">
                <code>{children}</code>
              </pre>
            </div>
          );
        },
        table: ({ children }) => (
          <div className="my-2.5 overflow-x-auto rounded-lg border border-zinc-800">
            <table className="min-w-full divide-y divide-zinc-800 text-xs text-zinc-200">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="bg-zinc-900/90 px-3 py-1.5 text-left font-semibold text-zinc-300 border-b border-zinc-800">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-1.5 border-b border-zinc-800/50">{children}</td>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
