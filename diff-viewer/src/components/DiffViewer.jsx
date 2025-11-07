// diff-viewer/src/components/DiffViewer.jsx
import React, { useEffect, useState } from 'react';
import { Download, Edit, Copy, GitBranch } from 'lucide-react';
import { FileDiff } from './FileDiff';
import { FileContentViewer } from './FileContentViewer';
import { FileEditor } from './FileEditor';

export function DiffViewer({ commit, selectedFile, onSelectFile, fileDiffs, darkMode, loading, onDownload }) {
  const [showEditor, setShowEditor] = useState(false);
  useEffect(() => {
    console.log('DiffViewer props:', {
      commit: commit?.hash,
      selectedFile,
      fileDiffs: fileDiffs ? Object.keys(fileDiffs) : null,
      loading
    });
  }, [commit, selectedFile, fileDiffs, loading]);

  if (!commit) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">
            📊
          </div>
          <h2 className="text-xl font-semibold mb-2">Select a commit</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Choose a commit from the history to view its changes
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* File List Header */}
      <div className={`border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-4`}>
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{commit.message}</h2>
            {commit.files && commit.files.length > 0 && selectedFile && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const content = fileDiffs?.[selectedFile]?.newContent || '';
                    onDownload?.(selectedFile, content);
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  title="Download file"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => alert('Edit functionality - would open file editor')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  title="Edit file"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {commit.author} committed on {new Date(commit.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <span className={`px-2 py-0.5 rounded text-xs ${
              darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
            }`}>
              {commit.hash.substring(0, 7)}
            </span>
          </div>
        </div>
        
        {commit.files && commit.files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {commit.files.map(file => (
              <button
                key={file}
                onClick={() => onSelectFile(file)}
                className={`px-3 py-1.5 rounded text-sm font-mono transition-colors ${
                  selectedFile === file
                    ? 'bg-blue-600 text-white'
                    : darkMode
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {file}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Diff Content */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading diff...</p>
            </div>
          </div>
        ) : selectedFile && fileDiffs && fileDiffs[selectedFile] ? (
          // File has changes - show diff
          <FileDiff 
            filename={selectedFile} 
            diff={fileDiffs[selectedFile]} 
            darkMode={darkMode} 
          />
        ) : selectedFile ? (
          // File selected but no diff means it's unchanged or first commit
          // Show the file content viewer
          <FileContentViewer
            filename={selectedFile}
            commit={commit}
            darkMode={darkMode}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                {commit.files?.length > 0 
                  ? 'Select a file to view changes' 
                  : 'No files in this commit'}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}