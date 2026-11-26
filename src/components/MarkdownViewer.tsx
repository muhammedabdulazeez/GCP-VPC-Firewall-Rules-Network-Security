import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewerProps {
  content: string;
  assetMap?: Record<string, string>;
  onNavigateFile?: (filePath: string) => void;
}

export function MarkdownViewer({ content, assetMap = {}, onNavigateFile }: MarkdownViewerProps) {
  return (
    <div className="md-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => {
            const isInternalDoc =
              href &&
              !href.startsWith('http://') &&
              !href.startsWith('https://') &&
              !href.startsWith('#') &&
              (href.endsWith('.md') || href.startsWith('docs/'));

            if (isInternalDoc && onNavigateFile && href) {
              const normalized = href.replace(/^\.\//, '');
              return (
                <button
                  type="button"
                  onClick={() => onNavigateFile(normalized)}
                  className="text-blue-700 underline decoration-blue-700/35 underline-offset-2 hover:decoration-blue-700 font-medium cursor-pointer"
                >
                  {children}
                </button>
              );
            }

            return (
              <a href={href} target="_blank" rel="noreferrer" {...props}>
                {children}
              </a>
            );
          },
          img: ({ src, alt }) => {
            const resolvedSrc = src ? (assetMap[src] ?? src) : '';
            if (!resolvedSrc) {
              return (
                <div className="p-4 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600">
                  {alt || 'Image asset'}
                </div>
              );
            }
            return (
              <figure className="my-5">
                <img
                  src={resolvedSrc}
                  alt={alt ?? 'Repository screenshot'}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto rounded-lg border border-slate-200 bg-slate-900"
                />
                {alt && (
                  <figcaption className="mt-2 text-xs text-slate-500">
                    {alt}
                  </figcaption>
                )}
              </figure>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
