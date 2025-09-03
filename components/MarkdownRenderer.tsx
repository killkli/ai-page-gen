import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose prose-slate max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          // 自定義標題樣式
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-slate-800 mb-4 mt-6 leading-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold text-slate-800 mb-3 mt-5 leading-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-slate-700 mb-3 mt-4 leading-tight">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold text-slate-700 mb-2 mt-3 leading-tight">
              {children}
            </h4>
          ),
          
          // 段落樣式
          p: ({ children }) => (
            <p className="text-base leading-relaxed mb-4 text-slate-700">
              {children}
            </p>
          ),
          
          // 清單樣式
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-2 text-slate-700">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-2 text-slate-700">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed ml-4">
              {children}
            </li>
          ),
          
          // 強調和粗體
          strong: ({ children }) => (
            <strong className="font-bold text-slate-800">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-700">
              {children}
            </em>
          ),
          
          // 程式碼區塊
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className="block bg-slate-100 text-slate-800 p-4 rounded-lg text-sm font-mono overflow-x-auto mb-4" {...props}>
                {children}
              </code>
            );
          },
          
          // 引用區塊
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-indigo-300 pl-4 my-4 italic text-slate-600 bg-indigo-50 py-2 rounded-r">
              {children}
            </blockquote>
          ),
          
          // 水平線
          hr: () => (
            <hr className="my-6 border-slate-300" />
          ),
          
          // 連結
          a: ({ href, children }) => (
            <a 
              href={href} 
              className="text-indigo-600 hover:text-indigo-800 underline font-medium"
              target="_blank" 
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          
          // 表格
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse border border-slate-300 rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-100">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody>
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-slate-200">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="border border-slate-300 px-4 py-2 text-left font-semibold text-slate-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-slate-300 px-4 py-2 text-slate-700">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;