// diff-viewer/src/components/FileContentViewer.jsx
import React, { useState, useEffect } from 'react';
import { getCommitFiles } from '../services/api';
import { detectLanguage, highlightCode } from '../utils/highlighter';

export function FileContentViewer({ filename, commit, darkMode }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFileContent() {
      try {
        setLoading(true);
        setError(null);
        
        const files = await getCommitFiles(commit.hash);
        const file = files.find(f => f.name === filename);
        
        if (file) {
          setContent(file.content);
        } else {
          setError('File not found');
        }
      } catch (err) {
        console.error('Error fetching file content:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFileContent();
  }, [filename, commit.hash]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className={`p-4 rounded ${darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'}`}>
          Error loading file: {error}
        </div>
      </div>
    );
  }

  const language = detectLanguage(filename);
  const lines = content ? content.split('\n') : [];

  return (
    <div className="rounded-lg overflow-hidden">
      <div className={`px-4 py-2 border-b flex items-center justify-between ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
      }`}>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{filename}</span>
          <span className={`px-2 py-0.5 rounded text-xs ${
            darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
          }`}>
            {commit.parent ? 'Unchanged' : 'Added'}
          </span>
        </div>
        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {lines.length} lines · {language}
        </span>
      </div>

      <div className={`font-mono text-sm ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {lines.map((line, index) => (
          <div
            key={index}
            className={`flex border-l-4 border-transparent ${
              darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
            }`}
          >
            <span className={`w-12 flex-shrink-0 text-right pr-4 select-none ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {index + 1}
            </span>
            <span 
              className="flex-1 pr-4"
              dangerouslySetInnerHTML={{ 
                __html: highlightCode(line || ' ', language) 
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}