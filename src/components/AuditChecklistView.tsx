import { useMemo, useState } from 'react';
import { ArrowUpRight, Check, Copy, RotateCcw } from 'lucide-react';
import type { ChecklistItem } from '../data/repoFiles';

interface AuditChecklistViewProps {
  title: string;
  description: string;
  items: ChecklistItem[];
  onOpenFile: (filePath: string) => void;
}

export function AuditChecklistView({
  title,
  description,
  items,
  onOpenFile,
}: AuditChecklistViewProps) {
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copied, setCopied] = useState(false);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(items.map((item) => item.category)));
    return ['All', ...unique];
  }, [items]);

  const activeCategory = categories.includes(selectedCategory) ? selectedCategory : 'All';

  const visibleItems = useMemo(() => {
    if (activeCategory === 'All') return items;
    return items.filter((item) => item.category === activeCategory);
  }, [items, activeCategory]);

  const completedCount = useMemo(
    () => items.filter((item) => checkedIds[item.id]).length,
    [items, checkedIds],
  );

  const toggleItem = (id: string) => {
    setCheckedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyMarkdown = async () => {
    const grouped = items.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    const lines: string[] = [`# ${title}`, ''];
    for (const [category, groupItems] of Object.entries(grouped)) {
      lines.push(`## ${category}`, '');
      for (const item of groupItems) {
        lines.push(`- [${checkedIds[item.id] ? 'x' : ' '}] ${item.text}`);
      }
      lines.push('');
    }

    await navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">
            CHECKLIST.md · Interactive Verification
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="text-sm text-slate-600 mt-1">{description}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-sm font-mono tabular-nums text-slate-700 px-3 py-1.5 bg-white border border-slate-200 rounded-lg">
            {completedCount} / {items.length} verified
          </div>
          <button
            type="button"
            onClick={() => setCheckedIds({})}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Markdown' : 'Copy Checklist'}
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-lg w-fit">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeCategory === cat
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-6 bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {visibleItems.map((item) => {
          const checked = Boolean(checkedIds[item.id]);
          return (
            <div
              key={item.id}
              className={`flex items-start justify-between gap-4 px-5 py-4 transition-colors ${
                checked ? 'bg-slate-50/70' : 'hover:bg-slate-50/50'
              }`}
            >
              <label className="flex items-start gap-3.5 cursor-pointer flex-1 select-none">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleItem(item.id)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600 cursor-pointer shrink-0"
                />
                <div>
                  <span
                    className={`text-sm leading-relaxed block ${
                      checked ? 'line-through text-slate-400' : 'text-slate-800 font-medium'
                    }`}
                  >
                    {item.text}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">
                    {item.category} · {item.filePath}
                  </span>
                </div>
              </label>

              <button
                type="button"
                onClick={() => onOpenFile(item.filePath)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Guide
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
