// diff-viewer/src/components/CommitHistory.jsx
import React from 'react';

export function CommitHistory({ commits, selectedCommit, onSelectCommit, darkMode, loading, error }) {
  if (error) {
    return (
      <div className="p-4">
        <div className={`rounded-lg p-4 ${darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-700'}`}>
          <p className="font-semibold">Error loading commits</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-20 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>
    );
  }

  if (commits.length === 0) {
    return (
      <div className="p-4 text-center">
        <svg className="w-12 h-12 mx-auto text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-400">No commits yet</p>
        <p className="text-sm text-gray-500 mt-1">Create your first commit</p>
      </div>
    );
  }

  return (
    <>
      <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className="text-lg font-semibold">Commit History</h2>
        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {commits.length} commit{commits.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
        {commits.map(commit => (
          <button
            key={commit.hash}
            onClick={() => onSelectCommit(commit)}
            className={`w-full text-left p-4 transition-colors ${
              selectedCommit?.hash === commit.hash
                ? darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                {commit.author.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{commit.message}</p>
                <div className={`flex items-center gap-2 mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span className="font-mono">{commit.hash.substring(0, 7)}</span>
                  <span>•</span>
                  <span className="truncate">{commit.author}</span>
                </div>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {new Date(commit.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}