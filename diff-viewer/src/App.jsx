// diff-viewer/src/App.jsx
import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Download, GitBranch, Edit, Copy, Check } from 'lucide-react';
import { CommitHistory } from './components/CommitHistory';
import { DiffViewer } from './components/DiffViewer';
import { FileTree } from './components/FileTree';
import { BranchSelector } from './components/BranchSelector';
import { useCommits } from './hooks/useCommits';
import { useDiff } from './hooks/useDiff';
import { getDiffStats } from './utils/diffParser';
import { getBranches } from './services/api';

function App() {
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFileTree, setShowFileTree] = useState(true);
  const [branches, setBranches] = useState([]);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [showBranchSelector, setShowBranchSelector] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { commits, loading: commitsLoading, error: commitsError, refetch } = useCommits(50);
  
  const parentHash = selectedCommit?.parent || null;
  const currentHash = selectedCommit?.hash || null;
  
  const { diff: fileDiffs, loading: diffLoading } = useDiff(parentHash, currentHash);

  // Fetch branches
  useEffect(() => {
    fetchBranches();
  }, []);

  async function fetchBranches() {
    try {
      const branchList = await getBranches();
      setBranches(branchList);
      const current = branchList.find(b => b.current);
      if (current) {
        setCurrentBranch(current.name);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  }

  const handleRefreshAll = async () => {
    await Promise.all([
      refetch(),
      fetchBranches()
    ]);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        refetch();
      }
      
      if (e.key === 't' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT') {
        setShowFileTree(prev => !prev);
      }
      
      if (commits.length > 0 && document.activeElement.tagName !== 'INPUT') {
        const currentIndex = commits.findIndex(c => c.hash === selectedCommit?.hash);
        
        if (e.key === 'ArrowDown' && currentIndex < commits.length - 1) {
          setSelectedCommit(commits[currentIndex + 1]);
        } else if (e.key === 'ArrowUp' && currentIndex > 0) {
          setSelectedCommit(commits[currentIndex - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [commits, selectedCommit, refetch]);

  useEffect(() => {
    if (selectedCommit?.files && selectedCommit.files.length > 0) {
      setSelectedFile(selectedCommit.files[0]);
    } else {
      setSelectedFile(null);
    }
  }, [selectedCommit]);

  const handleSelectCommit = (commit) => {
    setSelectedCommit(commit);
  };

  const handleCopyHash = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = async (filename, content) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadRepo = async () => {
    if (!selectedCommit) return;
    
    // Create a simple ZIP-like structure (or just download all files)
    alert('Download repository feature - would download all files from commit ' + selectedCommit.hash.substring(0, 7));
  };

  const filteredCommits = commits.filter(commit => 
    searchQuery === '' || 
    commit.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    commit.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    commit.hash.includes(searchQuery.toLowerCase())
  );

  const diffStats = fileDiffs ? getDiffStats(fileDiffs) : null;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
            <div>
              <h1 className="text-2xl font-bold">MyGit Repository</h1>
              <div className="flex items-center gap-3 mt-1">
                <button
                  onClick={() => setShowBranchSelector(!showBranchSelector)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                  }`}
                >
                  <GitBranch className="w-4 h-4" />
                  <span className="font-medium">{currentBranch}</span>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    ({branches.length} {branches.length === 1 ? 'branch' : 'branches'})
                  </span>
                </button>
                {diffStats && (
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {diffStats.changes} files · <span className="text-green-500">+{diffStats.additions}</span> <span className="text-red-500">-{diffStats.deletions}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                id="search-input"
                type="text"
                placeholder="Search commits (⌘K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-100 placeholder-gray-400' 
                    : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {selectedCommit && (
              <>
                <button
                  onClick={() => handleCopyHash(selectedCommit.hash)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  title="Copy commit hash"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="text-sm">{selectedCommit.hash.substring(0, 7)}</span>
                </button>

                <button
                  onClick={handleDownloadRepo}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  title="Download repository"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Download</span>
                </button>
              </>
            )}
            
            <button
              onClick={refetch}
              disabled={commitsLoading}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              } ${commitsLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Refresh (⌘R)"
            >
              <RefreshCw className={`w-5 h-5 ${commitsLoading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>

        {/* Branch Selector Dropdown */}
        {showBranchSelector && (
  <BranchSelector
    branches={branches}
    currentBranch={currentBranch}
    onClose={() => setShowBranchSelector(false)}
    onRefresh={handleRefreshAll} 
    darkMode={darkMode}
  />
)}
      </header>

      <div className="flex h-[calc(100vh-105px)]">
        {/* Commit History Sidebar */}
        <aside className={`w-80 border-r overflow-y-auto ${
          darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <CommitHistory
            commits={filteredCommits}
            selectedCommit={selectedCommit}
            onSelectCommit={handleSelectCommit}
            darkMode={darkMode}
            loading={commitsLoading}
            error={commitsError}
            currentBranch={currentBranch}
          />
        </aside>

        {/* File Tree */}
        {showFileTree && selectedCommit?.files && (
          <aside className={`w-64 border-r overflow-y-auto ${
            darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          }`}>
            <div className={`p-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Files</h3>
                <button
                  onClick={() => setShowFileTree(false)}
                  className={`text-xs px-2 py-1 rounded ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                  }`}
                  title="Hide file tree (T)"
                >
                  ✕
                </button>
              </div>
            </div>
            <FileTree
              files={selectedCommit.files}
              selectedFile={selectedFile}
              onSelectFile={setSelectedFile}
              darkMode={darkMode}
            />
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {!showFileTree && selectedCommit && (
            <button
              onClick={() => setShowFileTree(true)}
              className={`absolute left-[320px] top-[120px] z-10 p-2 rounded-r-lg ${
                darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
              } border ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-l-0`}
              title="Show file tree (T)"
            >
              ▶
            </button>
          )}
          
          <DiffViewer
            commit={selectedCommit}
            selectedFile={selectedFile}
            onSelectFile={setSelectedFile}
            fileDiffs={fileDiffs}
            darkMode={darkMode}
            loading={diffLoading}
            onDownload={handleDownloadFile}
          />
        </main>
      </div>
    </div>
  );
}

export default App;