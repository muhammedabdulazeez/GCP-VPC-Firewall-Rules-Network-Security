import { useMemo, useState } from 'react';
import JSZip from 'jszip';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  FileCode2,
  FileImage,
  FileText,
  Folder,
  FolderOpen,
  RotateCcw,
  Search,
} from 'lucide-react';
import { AuditChecklistView } from './components/AuditChecklistView';
import { GitSetupView } from './components/GitSetupView';
import { MarkdownViewer } from './components/MarkdownViewer';
import { VulnerabilityMatrixView } from './components/VulnerabilityMatrixView';
import {
  DEFAULT_REPO_CONFIGS,
  getRepoBundle,
  type RepoConfig,
  type RepoId,
} from './data/repoFiles';

type ActiveSection = 'repository' | 'matrix' | 'checklist' | 'git-setup';
type ViewMode = 'preview' | 'raw' | 'split';

export default function App() {
  const [activeRepoId, setActiveRepoId] = useState<RepoId>('gcp-firewall-rules');
  const [activeSection, setActiveSection] = useState<ActiveSection>('repository');
  const [repoConfigs, setRepoConfigs] = useState<Record<RepoId, RepoConfig>>(DEFAULT_REPO_CONFIGS);
  const [selectedPaths, setSelectedPaths] = useState<Record<RepoId, string>>({
    'gcp-firewall-rules': 'README.md',
    'auth-frontier': 'README.md',
  });
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [docsOpen, setDocsOpen] = useState<boolean>(true);
  const [assetsOpen, setAssetsOpen] = useState<boolean>(true);
  const [fileFilter, setFileFilter] = useState<string>('');
  const [editedContents, setEditedContents] = useState<Record<string, string>>({});
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [zipBusy, setZipBusy] = useState<boolean>(false);

  const activeConfig = repoConfigs[activeRepoId];
  const bundle = useMemo(
    () => getRepoBundle(activeRepoId, activeConfig),
    [activeRepoId, activeConfig],
  );

  const files = useMemo(
    () =>
      bundle.files.map((file) => {
        const editKey = `${activeRepoId}:${file.path}`;
        const edited = editedContents[editKey];
        return {
          ...file,
          content: edited ?? file.content,
          isModified: edited !== undefined && edited !== file.content,
        };
      }),
    [bundle.files, activeRepoId, editedContents],
  );

  const selectedPath = selectedPaths[activeRepoId] ?? 'README.md';
  const selectedFile = useMemo(
    () => files.find((f) => f.path === selectedPath) ?? files[0],
    [files, selectedPath],
  );

  const filteredFiles = useMemo(() => {
    const q = fileFilter.trim().toLowerCase();
    if (!q) return files;
    return files.filter(
      (f) =>
        f.path.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.content.toLowerCase().includes(q),
    );
  }, [files, fileFilter]);

  const rootFiles = useMemo(() => filteredFiles.filter((f) => f.folder === null), [filteredFiles]);
  const docsFiles = useMemo(() => filteredFiles.filter((f) => f.folder === 'docs'), [filteredFiles]);
  const assetFiles = useMemo(() => filteredFiles.filter((f) => f.folder === 'assets'), [filteredFiles]);

  const safeSlug = activeConfig.repoSlug.trim() || activeRepoId;

  const setSelectedPathForActive = (filePath: string) => {
    setSelectedPaths((prev) => ({ ...prev, [activeRepoId]: filePath }));
  };

  const handleOpenFile = (filePath: string) => {
    const exists = files.some((f) => f.path === filePath);
    if (exists) {
      setSelectedPathForActive(filePath);
      if (filePath.startsWith('docs/')) setDocsOpen(true);
      if (filePath.startsWith('assets/')) setAssetsOpen(true);
      setActiveSection('repository');
    }
  };

  const handleCopyFile = async () => {
    if (selectedFile.category === 'asset') return;
    await navigator.clipboard.writeText(selectedFile.content);
    setCopiedPath(`${activeRepoId}:${selectedFile.path}`);
    setTimeout(() => setCopiedPath(null), 1800);
  };

  const handleDownloadSingleFile = async () => {
    if (selectedFile.category === 'asset' && selectedFile.assetUrl) {
      const response = await fetch(selectedFile.assetUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedFile.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return;
    }

    const blob = new Blob([selectedFile.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    if (zipBusy) return;
    setZipBusy(true);
    try {
      const zip = new JSZip();
      for (const file of files) {
        if (file.category === 'asset' && file.assetUrl) {
          const response = await fetch(file.assetUrl);
          const buffer = await response.arrayBuffer();
          zip.file(file.path, buffer);
        } else {
          zip.file(file.path, file.content);
        }
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeSlug}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setZipBusy(false);
    }
  };

  const handleResetFile = () => {
    const key = `${activeRepoId}:${selectedFile.path}`;
    setEditedContents((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const lineCount = useMemo(
    () => (selectedFile.category === 'asset' ? 0 : selectedFile.content.split('\n').length),
    [selectedFile],
  );

  const navItems: { id: ActiveSection; label: string }[] = [
    { id: 'repository', label: 'Repository' },
    { id: 'matrix', label: 'Security Matrix' },
    { id: 'checklist', label: 'Audit Checklist' },
    { id: 'git-setup', label: 'Git Setup' },
  ];

  const isAssetSelected = selectedFile.category === 'asset';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Three-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={() => setActiveSection('repository')}
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
        >
          Repo Studio
        </button>

        <nav className="hidden md:flex items-center gap-6" aria-label="Primary navigation">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`text-sm font-medium transition-colors whitespace-nowrap shrink-0 py-4 border-b-2 cursor-pointer ${
                  isActive
                    ? 'text-slate-900 border-blue-700'
                    : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handleDownloadZip}
            disabled={zipBusy}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            {zipBusy ? 'Building ZIP...' : 'Download ZIP'}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Strip */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-4 overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveSection(item.id)}
            className={`text-xs font-medium whitespace-nowrap shrink-0 py-1.5 border-b-2 cursor-pointer ${
              activeSection === item.id
                ? 'text-slate-900 border-blue-700'
                : 'text-slate-600 border-transparent'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Workspace Repository Switcher Strip */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-medium text-slate-900">Active Repository:</span>
            <span className="font-mono text-slate-700">
              {activeConfig.githubUsername.trim() || 'your-username'}/{safeSlug}
            </span>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg">
            {(
              [
                { id: 'gcp-firewall-rules', label: 'gcp-firewall-rules' },
                { id: 'auth-frontier', label: 'auth-frontier' },
              ] as const
            ).map((repo) => (
              <button
                key={repo.id}
                type="button"
                onClick={() => {
                  setActiveRepoId(repo.id);
                  setFileFilter('');
                }}
                className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeRepoId === repo.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {repo.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1">
        {activeSection === 'repository' && (
          <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6">
            {/* Quiet Context Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  {activeConfig.githubUsername.trim() || 'your-username'}/{safeSlug}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                  {bundle.subtitle} · {activeConfig.authorName}
                </p>
              </div>
            </div>

            {/* Sidebar + Main Markdown Viewport */}
            <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6 items-start">
              {/* File Tree Sidebar */}
              <aside className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-3 border-b border-slate-200">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={fileFilter}
                      onChange={(e) => setFileFilter(e.target.value)}
                      placeholder="Filter files or topics..."
                      aria-label="Filter repository files"
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="p-2 space-y-0.5">
                  {/* assets/ folder */}
                  {assetFiles.length > 0 && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setAssetsOpen((prev) => !prev)}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                      >
                        {assetsOpen ? (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        {assetsOpen ? (
                          <FolderOpen className="w-4 h-4 text-blue-700 shrink-0" />
                        ) : (
                          <Folder className="w-4 h-4 text-blue-700 shrink-0" />
                        )}
                        <span className="font-mono truncate">assets</span>
                        <span className="ml-auto text-[11px] font-mono tabular-nums text-slate-400">
                          {assetFiles.length}
                        </span>
                      </button>

                      {assetsOpen && (
                        <div className="mt-0.5 ml-3 pl-2 border-l border-slate-200 space-y-0.5">
                          {assetFiles.map((file) => {
                            const active = selectedFile.path === file.path;
                            return (
                              <button
                                key={file.path}
                                type="button"
                                onClick={() => setSelectedPathForActive(file.path)}
                                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md transition-colors text-left cursor-pointer ${
                                  active
                                    ? 'bg-blue-50 text-blue-800 font-medium'
                                    : 'text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                <FileImage className="w-3.5 h-3.5 shrink-0 opacity-75" />
                                <span className="font-mono truncate">{file.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* docs/ folder */}
                  {docsFiles.length > 0 && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setDocsOpen((prev) => !prev)}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                      >
                        {docsOpen ? (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        {docsOpen ? (
                          <FolderOpen className="w-4 h-4 text-blue-700 shrink-0" />
                        ) : (
                          <Folder className="w-4 h-4 text-blue-700 shrink-0" />
                        )}
                        <span className="font-mono truncate">docs</span>
                        <span className="ml-auto text-[11px] font-mono tabular-nums text-slate-400">
                          {docsFiles.length}
                        </span>
                      </button>

                      {docsOpen && (
                        <div className="mt-0.5 ml-3 pl-2 border-l border-slate-200 space-y-0.5">
                          {docsFiles.map((file) => {
                            const active = selectedFile.path === file.path;
                            return (
                              <button
                                key={file.path}
                                type="button"
                                onClick={() => setSelectedPathForActive(file.path)}
                                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md transition-colors text-left cursor-pointer ${
                                  active
                                    ? 'bg-blue-50 text-blue-800 font-medium'
                                    : 'text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                <FileText className="w-3.5 h-3.5 shrink-0 opacity-75" />
                                <span className="font-mono truncate">{file.name}</span>
                                {file.isModified && (
                                  <span className="ml-auto text-[11px] text-amber-700 font-medium shrink-0">
                                    edited
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Root files */}
                  {rootFiles.map((file) => {
                    const active = selectedFile.path === file.path;
                    const Icon = file.category === 'config' ? FileCode2 : FileText;
                    return (
                      <button
                        key={file.path}
                        type="button"
                        onClick={() => setSelectedPathForActive(file.path)}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md transition-colors text-left cursor-pointer ${
                          active
                            ? 'bg-blue-50 text-blue-800 font-medium'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0 opacity-75" />
                        <span className="font-mono truncate">{file.name}</span>
                        {file.isModified && (
                          <span className="ml-auto text-[11px] text-amber-700 font-medium shrink-0">
                            edited
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {filteredFiles.length === 0 && (
                    <div className="px-3 py-6 text-center text-xs text-slate-500">
                      No matching files.
                    </div>
                  )}
                </div>
              </aside>

              {/* Main File Viewport */}
              <section className="bg-white border border-slate-200 rounded-xl overflow-hidden min-w-0">
                {/* File Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs font-medium text-slate-500 truncate">
                      {safeSlug} /
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-900 truncate">
                      {selectedFile.path}
                    </span>
                    {!isAssetSelected && (
                      <span className="hidden sm:inline text-xs text-slate-400 tabular-nums shrink-0">
                        · {lineCount} lines
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {!isAssetSelected && (
                      <div className="flex items-center gap-1 p-0.5 bg-slate-200/75 rounded-lg">
                        {(
                          [
                            { id: 'preview', label: 'Preview' },
                            { id: 'raw', label: 'Raw' },
                            { id: 'split', label: 'Split' },
                          ] as const
                        ).map((mode) => (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setViewMode(mode.id)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                              viewMode === mode.id
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {selectedFile.isModified && !isAssetSelected && (
                      <button
                        type="button"
                        onClick={handleResetFile}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset
                      </button>
                    )}

                    {!isAssetSelected && (
                      <button
                        type="button"
                        onClick={handleCopyFile}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        {copiedPath === `${activeRepoId}:${selectedFile.path}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copiedPath === `${activeRepoId}:${selectedFile.path}` ? 'Copied' : 'Copy'}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleDownloadSingleFile}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Save File
                    </button>
                  </div>
                </div>

                {/* File Content Area */}
                {isAssetSelected ? (
                  <div className="p-6 md:p-8">
                    <p className="text-xs text-slate-500 mb-3">{selectedFile.description}</p>
                    <img
                      src={selectedFile.assetUrl}
                      alt={selectedFile.description}
                      referrerPolicy="no-referrer"
                      className="w-full h-auto rounded-lg border border-slate-200 bg-slate-900"
                    />
                  </div>
                ) : (
                  <>
                    {viewMode === 'preview' && (
                      <div className="p-6 md:p-8">
                        {selectedFile.category === 'config' ? (
                          <pre className="p-4 bg-slate-900 text-slate-100 text-xs font-mono leading-relaxed rounded-lg overflow-x-auto">
                            <code>{selectedFile.content}</code>
                          </pre>
                        ) : (
                          <MarkdownViewer
                            content={selectedFile.content}
                            assetMap={bundle.assetMap}
                            onNavigateFile={handleOpenFile}
                          />
                        )}
                      </div>
                    )}

                    {viewMode === 'raw' && (
                      <div className="p-0">
                        <textarea
                          value={selectedFile.content}
                          onChange={(e) =>
                            setEditedContents((prev) => ({
                              ...prev,
                              [`${activeRepoId}:${selectedFile.path}`]: e.target.value,
                            }))
                          }
                          spellCheck={false}
                          aria-label={`Raw markdown editor for ${selectedFile.path}`}
                          className="w-full min-h-[640px] p-5 font-mono text-xs leading-relaxed text-slate-800 bg-white focus:outline-none resize-y"
                        />
                      </div>
                    )}

                    {viewMode === 'split' && (
                      <div className="grid grid-cols-1 xl:grid-cols-2 divide-y xl:divide-y-0 xl:divide-x divide-slate-200">
                        <div className="min-w-0">
                          <div className="px-4 py-2 text-[11px] font-medium text-slate-500 bg-slate-50/70 border-b border-slate-200">
                            Markdown Source (Editable)
                          </div>
                          <textarea
                            value={selectedFile.content}
                            onChange={(e) =>
                              setEditedContents((prev) => ({
                                ...prev,
                                [`${activeRepoId}:${selectedFile.path}`]: e.target.value,
                              }))
                            }
                            spellCheck={false}
                            aria-label={`Split markdown editor for ${selectedFile.path}`}
                            className="w-full min-h-[640px] p-5 font-mono text-xs leading-relaxed text-slate-800 bg-white focus:outline-none resize-y"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="px-4 py-2 text-[11px] font-medium text-slate-500 bg-slate-50/70 border-b border-slate-200">
                            GitHub Preview
                          </div>
                          <div className="p-6 max-h-[680px] overflow-y-auto">
                            {selectedFile.category === 'config' ? (
                              <pre className="p-4 bg-slate-900 text-slate-100 text-xs font-mono leading-relaxed rounded-lg overflow-x-auto">
                                <code>{selectedFile.content}</code>
                              </pre>
                            ) : (
                              <MarkdownViewer
                                content={selectedFile.content}
                                assetMap={bundle.assetMap}
                                onNavigateFile={handleOpenFile}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </section>
            </div>
          </div>
        )}

        {activeSection === 'matrix' && (
          <VulnerabilityMatrixView
            title={bundle.matrixTitle}
            subtitle={bundle.matrixSubtitle}
            description={bundle.matrixDescription}
            rows={bundle.matrixRows}
            onOpenFile={handleOpenFile}
          />
        )}

        {activeSection === 'checklist' && (
          <AuditChecklistView
            title={bundle.checklistTitle}
            description={bundle.checklistDescription}
            items={bundle.checklistItems}
            onOpenFile={handleOpenFile}
          />
        )}

        {activeSection === 'git-setup' && (
          <GitSetupView
            repoId={activeRepoId}
            config={activeConfig}
            files={files}
            onChangeConfig={(next) =>
              setRepoConfigs((prev) => ({ ...prev, [activeRepoId]: next }))
            }
            onDownloadZip={handleDownloadZip}
          />
        )}
      </main>
    </div>
  );
}
