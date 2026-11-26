import { useState } from 'react';
import { Check, Copy, Download, Terminal } from 'lucide-react';
import type { RepoConfig, RepoFile, RepoId } from '../data/repoFiles';

interface GitSetupViewProps {
  repoId: RepoId;
  config: RepoConfig;
  files: RepoFile[];
  onChangeConfig: (next: RepoConfig) => void;
  onDownloadZip: () => void;
}

export function GitSetupView({
  repoId,
  config,
  files,
  onChangeConfig,
  onDownloadZip,
}: GitSetupViewProps) {
  const [copiedBlock, setCopiedBlock] = useState<'cli' | 'manual' | null>(null);

  const safeUser = config.githubUsername.trim() || 'your-username';
  const safeSlug = config.repoSlug.trim() || repoId;

  const ghCliCommands = `# 1. Unzip the downloaded ${safeSlug}.zip archive and enter the folder
unzip ${safeSlug}.zip -d ${safeSlug}
cd ${safeSlug}

# 2. Initialize Git and create the GitHub repository via GitHub CLI
git init -b main
git add .
git commit -m "docs: initialize ${safeSlug} markdown repository"
gh repo create ${safeUser}/${safeSlug} --public --source=. --remote=origin --push`;

  const manualGitCommands = `# 1. Create an empty repository named "${safeSlug}" on github.com/new (no README)
# 2. Unzip the downloaded archive and push to origin
unzip ${safeSlug}.zip -d ${safeSlug}
cd ${safeSlug}

git init -b main
git add .
git commit -m "docs: initialize ${safeSlug} markdown repository"
git remote add origin https://github.com/${safeUser}/${safeSlug}.git
git push -u origin main`;

  const handleCopy = async (block: 'cli' | 'manual', text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedBlock(block);
    setTimeout(() => setCopiedBlock(null), 1800);
  };

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">
            Repository Configuration · GitHub Publishing
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Configure & Push to GitHub
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Customize your GitHub username, repository slug, and attribution. All generated Markdown files and export archives update immediately.
          </p>
        </div>

        <button
          type="button"
          onClick={onDownloadZip}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Download {safeSlug}.zip
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Repository Metadata</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="gh-user" className="block text-xs font-medium text-slate-700 mb-1.5">
                GitHub Username
              </label>
              <input
                id="gh-user"
                type="text"
                value={config.githubUsername}
                onChange={(e) => onChangeConfig({ ...config, githubUsername: e.target.value })}
                placeholder="your-username"
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label htmlFor="repo-slug" className="block text-xs font-medium text-slate-700 mb-1.5">
                Repository Name
              </label>
              <input
                id="repo-slug"
                type="text"
                value={config.repoSlug}
                onChange={(e) => onChangeConfig({ ...config, repoSlug: e.target.value })}
                placeholder={repoId}
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label htmlFor="author-name" className="block text-xs font-medium text-slate-700 mb-1.5">
                Author Attribution
              </label>
              <input
                id="author-name"
                type="text"
                value={config.authorName}
                onChange={(e) => onChangeConfig({ ...config, authorName: e.target.value })}
                placeholder="Muhammed Abdulazeez"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label htmlFor="license-select" className="block text-xs font-medium text-slate-700 mb-1.5">
                License
              </label>
              <select
                id="license-select"
                value={config.license}
                onChange={(e) => onChangeConfig({ ...config, license: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              >
                <option value="MIT">MIT</option>
                <option value="Apache-2.0">Apache-2.0</option>
                <option value="CC-BY-4.0">CC-BY-4.0</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-2">Workspace Output</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Every file is written in standard GitHub-Flavored Markdown with clean relative asset and guide paths ready for version control.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs text-slate-700 leading-relaxed">
              <div>{safeSlug}/</div>
              {files.map((f, idx) => (
                <div key={f.path}>
                  {idx === files.length - 1 ? '└── ' : '├── '}
                  {f.path}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Local workspace copy also saved under <span className="font-mono text-slate-700">/{repoId}/</span>.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Terminal className="w-4 h-4 text-slate-500" />
              Option A: Create & Push via GitHub CLI
            </div>
            <button
              type="button"
              onClick={() => handleCopy('cli', ghCliCommands)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copiedBlock === 'cli' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedBlock === 'cli' ? 'Copied' : 'Copy Commands'}
            </button>
          </div>
          <pre className="p-5 bg-slate-900 text-slate-100 text-xs font-mono leading-relaxed overflow-x-auto">
            <code>{ghCliCommands}</code>
          </pre>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Terminal className="w-4 h-4 text-slate-500" />
              Option B: Push to an Existing Empty GitHub Repository
            </div>
            <button
              type="button"
              onClick={() => handleCopy('manual', manualGitCommands)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copiedBlock === 'manual' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedBlock === 'manual' ? 'Copied' : 'Copy Commands'}
            </button>
          </div>
          <pre className="p-5 bg-slate-900 text-slate-100 text-xs font-mono leading-relaxed overflow-x-auto">
            <code>{manualGitCommands}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
